import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { Result } from 'src/common/result';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { FlashSalesService } from './flash-sales.service';
import { IFlashSalesResponseDTO } from './interface/flash.sales';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Post('create')
  create(
    @Body() createFashSaleDto: CreateFlashSaleDto,
  ): Promise<Result<IFlashSalesResponseDTO>> {
    return this.flashSalesService.create(createFashSaleDto);
  }

  @Get()
  findAll() {
    return this.flashSalesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.flashSalesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFashSaleDto: UpdateFlashSaleDto,
  ) {
    return this.flashSalesService.update(id, updateFashSaleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.flashSalesService.remove(id);
  }
}
