import { PartialType } from '@nestjs/mapped-types';
import { CreateFlashSaleDto } from './create-flash-sale.dto';

export class UpdateFlashSaleDto extends PartialType(CreateFlashSaleDto) {}
