import {
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsNumber,
} from 'class-validator';
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsNumber()
  @IsNotEmpty()
  stock: string;

  @IsNumber()
  @IsNotEmpty()
  price: string;
}
