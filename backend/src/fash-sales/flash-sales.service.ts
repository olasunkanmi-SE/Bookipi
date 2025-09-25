import { Injectable } from '@nestjs/common';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';

@Injectable()
export class FlashSalesService {
  create(createFlashSaleDto: CreateFlashSaleDto) {
    return JSON.stringify(createFlashSaleDto);
  }

  findAll() {
    return `This action returns all fashSales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fashSale`;
  }

  update(id: number, updateFlashSaleDto: UpdateFlashSaleDto) {
    return JSON.stringify(updateFlashSaleDto);
  }

  remove(id: number) {
    return `This action removes a #${id} fashSale`;
  }
}
