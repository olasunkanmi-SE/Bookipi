/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Audit } from 'src/common/audit';
import { throwApplicationError } from 'src/common/exception.instance';
import { Result } from 'src/common/result';
import { logError } from 'src/common/utils';
import { Product } from 'src/infrastructure/data-access/models/product.entity';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';

export interface ICreateProductResponseDTO {
  id: string;
  name: string;
  stock: number;
  price: number;
  auditCreatedBy: string;
  auditCreatedDateTime: string;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
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
      throwApplicationError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Error while creating product',
      );
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

  async findAll() {
    return await this.productRepository.find({});
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throwApplicationError(HttpStatus.NOT_FOUND, 'Product does not exist');
    }
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
}
