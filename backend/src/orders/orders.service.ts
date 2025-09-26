import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderStatus } from 'src/common/constants';
import { throwApplicationError } from 'src/common/exception.instance';
import { Result } from 'src/common/result';
import { Order } from 'src/infrastructure/data-access/models/order.entity';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';
import { Audit } from 'src/common/audit';

export interface IOrderResponseDTO {
  id: string;
  userId: string;
  productId: string;
  status: OrderStatus;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(
    createOrderDto: CreateOrderDto,
    user: JwtPayload,
  ): Promise<Result<IOrderResponseDTO>> {
    const { productId } = createOrderDto;

    await this.getUserAndProduct(user.sub, productId);

    const audit = Audit.create({
      auditCreatedBy: user.username,
      auditCreatedDateTime: new Date().toISOString(),
    });

    const order = this.orderRepository.create({
      status: OrderStatus.PENDING,
      productId,
      userId: user.sub,
      ...audit,
    });

    const result = await this.orderRepository.save(order);
    if (!result) {
      throwApplicationError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error while creating order',
      );
    }

    return Result.ok({
      id: result.id,
      status: result.status,
      productId: result.productId,
      userId: result.userId,
    });
  }

  async getUserAndProduct(userId: string, productId: string): Promise<void> {
    const [user, product] = await Promise.all([
      this.userRepository.findOne({
        where: { id: userId },
      }),
      this.productRepository.findOne({
        where: { id: productId },
      }),
    ]);
    if (!user) {
      throwApplicationError(HttpStatus.NOT_FOUND, 'User does not exist ');
    }

    if (!product) {
      throwApplicationError(
        HttpStatus.NOT_FOUND,
        `Product with id ${productId} does not exist `,
      );
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus) {
    await this.orderRepository.update(orderId, { status });
  }

  async hasUserPurchasedProduct(userId: string, productId: string) {
    const order = await this.orderRepository.findOne({
      where: {
        userId,
        productId,
        status: OrderStatus.SUCCESS,
      },
    });
    return !!order;
  }

  async findAll() {
    return await this.orderRepository.find({});
  }

  async findOne(id: string) {
    return await this.orderRepository.findOne({ where: { id } });
  }
}
