import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FlashSalesService } from './flash-sales.service';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly fashSalesService: FlashSalesService) {}

  @Post()
  create(@Body() createFashSaleDto: CreateFlashSaleDto) {
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
    @Body() updateFashSaleDto: UpdateFlashSaleDto,
  ) {
    return this.fashSalesService.update(+id, updateFashSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fashSalesService.remove(+id);
  }
}
