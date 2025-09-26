import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import {
  CREATE_ORDER_JOB,
  DECREMENT_COUNT,
  ORDER_PROCESSING,
  OrderStatus,
  TYPES,
} from 'src/common/constants';
import { logError } from 'src/common/utils';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { IProductService } from 'src/products/interface/product';
import { IOrderJobPayload, IOrderService } from './interface/order';
import { DataSource } from 'typeorm';

@Processor(ORDER_PROCESSING)
export class OrderProcessor {
  constructor(
    @Inject(TYPES.IProductService)
    private readonly productService: IProductService,
    @Inject(TYPES.IOrderService)
    private readonly orderService: IOrderService,
    private readonly dataSource: DataSource,
  ) {}

  @Process(CREATE_ORDER_JOB)
  async handleCreateOrder(job: Job<IOrderJobPayload>) {
    Logger.log(`Processing order job ${job.id} for user ${job.data.userId}`);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const idempotencyKey = String(job.id);
      const existingOrder =
        await this.orderService.findByIdempotencyKey(idempotencyKey);
      if (existingOrder) {
        Logger.log(`Job ${job.id} has already been processed. Skipping.`);
        return;
      }
      const { userId, productId, username } = job.data;
      const product: Product = await this.productService.findOne(productId);

      if (product.stock < DECREMENT_COUNT) {
        throw new Error(`Not enough stock for product ${productId}`);
      }
      const purchaseAttempt = await this.productService.handlePurchaseAttempt(
        productId,
        userId,
      );
      if (!purchaseAttempt.isSuccess) {
        throw new Error(
          purchaseAttempt.message ?? 'Sorry, this item is now out of stock!',
        );
      }
      const order = await this.orderService.create(
        { productId, idempotencyKey },
        { sub: userId, username },
        OrderStatus.SUCCESS,
      );

      if (!order) {
        throw new Error('Failed to save the order to the database');
      }
      Logger.log(
        `Successfully processed job ${job.id}. Order ${order.id} created for product ${productId}.`,
      );
      // Notify the user via WebSocket, email, etc.
      await queryRunner.commitTransaction();
    } catch (error) {
      logError(error, OrderProcessor.name);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
