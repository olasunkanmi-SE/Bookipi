import { PartialType } from '@nestjs/mapped-types';
import { CreateFashSaleDto } from './create-fash-sale.dto';

export class UpdateFashSaleDto extends PartialType(CreateFashSaleDto) {}
