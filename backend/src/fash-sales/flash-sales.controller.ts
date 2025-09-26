import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  FlashSalesService,
  IFlashSalesResponseDTO,
} from './flash-sales.service';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { Result } from 'src/common/result';

@Controller('flash-sales')
export class FlashSalesController {
  constructor(private readonly flashSalesService: FlashSalesService) {}

  @Post('create')
  @UsePipes(new ValidationPipe({ transform: true }))
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
