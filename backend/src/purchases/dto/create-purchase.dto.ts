import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
export class CreatePurchaseDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
