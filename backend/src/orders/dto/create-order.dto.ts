import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
