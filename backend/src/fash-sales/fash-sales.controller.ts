import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FashSalesService } from './fash-sales.service';
import { CreateFashSaleDto } from './dto/create-fash-sale.dto';
import { UpdateFashSaleDto } from './dto/update-fash-sale.dto';

@Controller('fash-sales')
export class FashSalesController {
  constructor(private readonly fashSalesService: FashSalesService) {}

  @Post()
  create(@Body() createFashSaleDto: CreateFashSaleDto) {
    return this.fashSalesService.create(createFashSaleDto);
  }

  @Get()
  findAll() {
    return this.fashSalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.fashSalesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFashSaleDto: UpdateFashSaleDto,
  ) {
    return this.fashSalesService.update(+id, updateFashSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fashSalesService.remove(+id);
  }
}
