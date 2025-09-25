import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus } from 'src/common/constants';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsEnum(OrderStatus)
  @IsNotEmpty()
  status: OrderStatus;
}
