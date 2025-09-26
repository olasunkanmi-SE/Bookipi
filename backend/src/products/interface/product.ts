import { Result } from 'src/common/result';
import { CreateProductDto } from '../dto/create-product.dto';
import { Product } from 'src/infrastructure/data-access/models/product.entity';

export interface IProductService {
  create(
    createProductDto: CreateProductDto,
  ): Promise<Result<ICreateProductResponseDTO>>;
  findAll(): Promise<Product[]>;
  findOne(id: string): Promise<Product>;
  getProductStock(productId: string): Promise<number | null>;
  handlePurchaseAttempt(
    productId: string,
    userId: string,
  ): Promise<Result<null> | Result<string>>;
}

export interface ICreateProductResponseDTO {
  id: string;
  name: string;
  stock: number;
  price: number;
  auditCreatedBy: string;
  auditCreatedDateTime: string;
}
