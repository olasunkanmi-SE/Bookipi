import { Injectable } from '@nestjs/common';
import { CreateFashSaleDto } from './dto/create-fash-sale.dto';
import { UpdateFashSaleDto } from './dto/update-fash-sale.dto';

@Injectable()
export class FashSalesService {
  create(createFashSaleDto: CreateFashSaleDto) {
    return 'This action adds a new fashSale';
  }

  findAll() {
    return `This action returns all fashSales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fashSale`;
  }

  update(id: number, updateFashSaleDto: UpdateFashSaleDto) {
    return `This action updates a #${id} fashSale`;
  }

  remove(id: number) {
    return `This action removes a #${id} fashSale`;
  }
}
