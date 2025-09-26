import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from 'src/common/audit';
import { TYPES } from 'src/common/constants';
import { Result } from 'src/common/result';
import { logError } from 'src/common/utils';
import { IRedisService } from 'src/infrastructure/cache/redis.service';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import {
  ICreateProductResponseDTO,
  IProductService,
} from './interface/product';

@Injectable()
export class ProductsService implements IProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @Inject(TYPES.IRedisService) private readonly cacheService: IRedisService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<Result<ICreateProductResponseDTO>> {
    const { name, stock, price } = createProductDto;

    const audit = Audit.create({
      auditCreatedBy: 'System',
      auditCreatedDateTime: new Date().toISOString(),
    });

    const product: Product = this.productRepository.create({
      name,
      stock,
      price,
      ...audit,
    });
    const result = await this.productRepository.save(product);

    if (!result) {
      throw new Error('Error while creating product');
    }

    return Result.ok({
      id: result.id,
      name: result.name,
      stock: result.stock,
      price: result.price,
      auditCreatedBy: result.auditCreatedBy,
      auditCreatedDateTime: result.auditCreatedDateTime,
    });
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({});
  }

  async findOne(id: string): Promise<Product> {
    const cacheKey = this.getCacheKey(id);
    const cachedProduct = (await this.cacheService.get(cacheKey)) as Product;
    if (cachedProduct) {
      return cachedProduct;
    }
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error('Product does not exist');
    }
    await this.cacheService.set(cacheKey, product, 36000);
    return product;
  }

  async getProductStock(productId: string): Promise<number | null> {
    const product = await this.productRepository.findOne({
      where: { id: productId },
      select: ['stock'],
    });
    return product ? product.stock : null;
  }

  async decrementStock(productId: string): Promise<boolean> {
    try {
      const result = await this.productRepository
        .createQueryBuilder()
        .update(Product)
        .set({ stock: () => 'stock -1' })
        .where('id = :productId AND stock > 0', { productId })
        .execute();

      if (result.affected === 0) {
        Logger.warn(
          `Failed to decrement stock for product ${productId}. Stock was 0 or not found`,
        );
        return false;
      }
      Logger.log(`Stock decrement for product ${productId}`);
      return true;
    } catch (error) {
      logError(error, ProductsService.name);
      throw error;
    }
  }

  async handlePurchaseAttempt(
    productId: string,
    userId: string,
  ): Promise<Result<null> | Result<string>> {
    const decrementStock = await this.decrementStock(productId);
    if (!decrementStock) {
      Logger.warn(
        `Purchase failed for user ${userId}, product ${productId}. Out of stock.`,
      );
      return Result.fail('Sorry, this item is now out of stock!');
    }
    return Result.ok('true');
  }

  private getCacheKey(productId: string): string {
    return `product:${productId}`;
  }
}
