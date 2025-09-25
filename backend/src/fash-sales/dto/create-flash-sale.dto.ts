import { IsString, IsNotEmpty } from 'class-validator';
export class CreateFlashSaleDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @IsString()
  @IsNotEmpty()
  enDate: string;
}
