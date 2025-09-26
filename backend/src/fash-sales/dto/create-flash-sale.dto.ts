import { IsString, IsNotEmpty } from 'class-validator';
export class CreateFlashSaleDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  productId: string;
}
