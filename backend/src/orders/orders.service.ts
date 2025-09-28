import { InjectQueue } from '@nestjs/bull';
import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { Audit } from 'src/common/audit';
import {
  JobOptions,
  OrderQueueConstants,
  OrderStatus,
  TYPES,
} from 'src/common/constants';
import { Result } from 'src/common/result';
import { AppRedisClient } from 'src/infrastructure/cache/redis.provider';
import { IRedisService } from 'src/infrastructure/cache/redis.service';
import { Order } from 'src/infrastructure/data-access/models/order.entity';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';
import { Repository } from 'typeorm';
import { UpdateResult } from 'typeorm/browser';
import { CreateOrderDto } from './dto/create-order.dto';
import {
  IOrderJobPayload,
  IOrderQueue,
  IOrderResponseDTO,
  IOrderService,
} from './interface/order';

@Injectable()
export class OrdersService implements IOrderService {
  private redisClient: AppRedisClient;
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(TYPES.IRedisService) private readonly cacheService: IRedisService,
    @InjectQueue(OrderQueueConstants.QUEUE_NAME)
    private readonly orderQueue: Queue,
  ) {}

  onModuleInit() {
    this.redisClient = this.cacheService.getNativeClient();
  }

  private async initializeProductStock(productId: string) {
    const stockKey = `product:stock:${productId}`;
    const inCache = await this.cacheService.get(stockKey);
    if (!inCache) {
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException(
          `Product with ID '${productId}' not found.`,
        );
      }
      await this.cacheService.set(stockKey, product.stock);
    }
  }

  async addOrderToQueue(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
  ): Promise<Result<IOrderQueue>> {
    const { productId } = createOrderDto;
    try {
      const hasPurchasedProduct = await this.hasAttemptedAPurchase(
        user.sub,
        productId,
      );
      if (hasPurchasedProduct) {
        throw new ForbiddenException(`You have already made a purchase`);
      }
      await this.initializeProductStock(productId);
      await this.cacheService.decreaseCount(
        productId,
        OrderQueueConstants.DECREMENT_COUNT,
      );
      const jobPayload: IOrderJobPayload = {
        userId: user.sub,
        productId: createOrderDto.productId,
        email: user.email,
      };
      const job = await this.orderQueue.add(
        OrderQueueConstants.CREATE_ORDER_JOB,
        jobPayload,
        {
          attempts: JobOptions.DEFAULT_ATTEMPTS,
          backoff: {
            type: 'exponential',
            delay: JobOptions.BACKOFF_DELAY_MS,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );

      Logger.log(`Job with ID ${job.id} added to the order-queue.`);

      return Result.ok({
        message: 'Your order is being processed.',
        jobId: job.id,
      });
    } catch (error) {
      Logger.error(
        `Failed to add order job for product ${productId}. Reverting stock.`,
        error,
      );
      // If adding to the queue fails, we must revert the stock change.
      await this.cacheService.increaseCount(
        productId,
        OrderQueueConstants.DECREMENT_COUNT,
      );

      throw error;
    }
  }

  async create(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
    status?: OrderStatus,
  ): Promise<IOrderResponseDTO> {
    const { productId } = createOrderDto;

    await this.getUserAndProduct(user.sub, productId);

    const audit = Audit.create({
      auditCreatedBy: user.email,
      auditCreatedDateTime: new Date().toISOString(),
    });

    const order = this.orderRepository.create({
      idempotencyKey: createOrderDto.idempotencyKey,
      status: status ?? OrderStatus.PENDING,
      productId,
      userId: user.sub,
      auditCreatedBy: audit.auditCreatedBy,
      auditCreatedDateTime: audit.auditCreatedDateTime,
    });

    const result = await this.orderRepository.save(order);
    if (!result) {
      throw new InternalServerErrorException('Error while creating the order.');
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
      throw new NotFoundException(`User with ID '${userId}' not found.`);
    }

    if (!product) {
      throw new NotFoundException(`Product with ID '${productId}' not found.`);
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

  async hasAttemptedAPurchase(
    userId: string,
    productId: string,
  ): Promise<boolean> {
    const order = await this.orderRepository.findOne({
      where: {
        userId,
        productId,
      },
    });
    if (!order) {
      return false;
    }
    return (
      order.status === OrderStatus.PENDING ||
      order.status === OrderStatus.SUCCESS
    );
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
    const order = await this.orderRepository.findOne({ where: { userId: id } });
    if (!order) {
      throw new NotFoundException(`Order with ID '${id}' not found.`);
    }
    await this.cacheService.set(cacheKey, order, 36000);
    return order;
  }

  async findByIdempotencyKey(key: string): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { idempotencyKey: key },
    });
  }

  private getCacheKey(orderId: string): string {
    return `order:${orderId}`;
  }
}
