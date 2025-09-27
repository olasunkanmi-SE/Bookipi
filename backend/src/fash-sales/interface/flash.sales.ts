import { Result } from 'src/common/result';
import { FlashSale } from 'src/infrastructure/data-access/models/flash-sales.entity';
import { DeleteResult } from 'typeorm';
import { CreateFlashSaleDto } from '../dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from '../dto/update-flash-sale.dto';

export interface IFlashSalesResponseDTO {
  id: string;
  startDate: string;
  endDate: string;
  auditCreatedBy: string;
  auditCreatedDateTime: string;
}

export interface IFlashSalesService {
  create(
    createFlashSaleDto: CreateFlashSaleDto,
  ): Promise<Result<IFlashSalesResponseDTO>>;
  findAll(): Promise<Result<FlashSale[]>>;
  findOne(id: string): Promise<FlashSale | null>;
  update(
    id: string,
    updateFlashSaleDto: UpdateFlashSaleDto,
  ): Promise<Result<FlashSale>>;
  remove(id: string): Promise<DeleteResult>;
  validateActiveFlashSale(productId: string): Promise<void>;
  findById(productId: string): Promise<FlashSale | null>;
}
