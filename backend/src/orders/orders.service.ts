import { InjectQueue } from '@nestjs/bull';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { RedisClientType } from 'redis';
import { Audit } from 'src/common/audit';
import {
  CREATE_ORDER_JOB,
  DECREMENT_COUNT,
  OrderStatus,
  TYPES,
} from 'src/common/constants';
import { Result } from 'src/common/result';
import { IRedisService } from 'src/infrastructure/cache/redis.service';
import { Order } from 'src/infrastructure/data-access/models/order.entity';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';
import { Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderJobPayload, IOrderService } from './interface/order';

export interface IOrderResponseDTO {
  id: string;
  userId: string;
  productId: string;
  status: OrderStatus;
}

@Injectable()
export class OrdersService implements IOrderService {
  private redisClient: RedisClientType;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(TYPES.IRedisService) private readonly cacheService: IRedisService,
    @InjectQueue('order-queue') private readonly orderQueue: Queue,
  ) {}

  onModuleInit() {
    this.redisClient = this.cacheService.getNativeClient();
  }

  private async addOrderToQueue(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
  ) {
    const { productId } = createOrderDto;
    await this.decrementStockInCache(productId, DECREMENT_COUNT);
    const jobPayload: IOrderJobPayload = {
      userId: user.sub,
      productId: createOrderDto.productId,
      username: user.username,
    };
    const job = await this.orderQueue.add(CREATE_ORDER_JOB, jobPayload, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    });

    Logger.log(`Job with ID ${job.id} added to the order-queue.`);

    return Result.ok({
      message: 'Your order is being processed.',
      jobId: job.id,
    });
  }

  async create(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
    status?: OrderStatus,
  ): Promise<IOrderResponseDTO> {
    const { productId } = createOrderDto;

    await this.getUserAndProduct(user.sub, productId);

    const audit = Audit.create({
      auditCreatedBy: user.username,
      auditCreatedDateTime: new Date().toISOString(),
    });

    const order = this.orderRepository.create({
      status: status ?? OrderStatus.PENDING,
      productId,
      userId: user.sub,
      ...audit,
    });

    const result = await this.orderRepository.save(order);
    if (!result) {
      throw new Error('Error while creating order');
    }

    return {
      id: result.id,
      status: result.status,
      productId: result.productId,
      userId: result.userId,
    };
  }

  private async getUserAndProduct(
    userId: string,
    productId: string,
  ): Promise<void> {
    const [user, product] = await Promise.all([
      this.userRepository.findOne({
        where: { id: userId },
      }),
      this.productRepository.findOne({
        where: { id: productId },
      }),
    ]);
    if (!user) {
      throw new Error('User does not exist ');
    }

    if (!product) {
      throw new Error('Product with id ${productId} does not exist');
    }
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<boolean> {
    const update: UpdateResult = await this.orderRepository.update(orderId, {
      status,
    });
    return update.affected && update.affected > 0 ? true : false;
  }

  async hasUserPurchasedProduct(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: {
        userId,
        productId,
        status: OrderStatus.SUCCESS,
      },
    });
    return !!order;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({});
  }

  async findOne(id: string): Promise<Order | undefined> {
    const cacheKey = this.getCacheKey(id);
    const cachedOrder = (await this.cacheService.get(cacheKey)) as Order;
    if (cachedOrder) {
      return cachedOrder;
    }
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new Error('order does not exist');
    }
    await this.cacheService.set(cacheKey, order, 36000);
    return;
  }

  async findByIdempotencyKey(key: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { idempotencyKey: key },
    });
  }

  private getCacheKey(orderId: string): string {
    return `order:${orderId}`;
  }

  private async decrementStockInCache(
    productId: string,
    quantity: number = 1,
  ): Promise<boolean> {
    const stockKey = `product:stock:${productId}`;
    const newStock = await this.redisClient.decrBy(stockKey, quantity);
    if (newStock < 0) {
      await this.redisClient.incrBy(stockKey, quantity);
      return false;
    }
    return true;
  }
}
