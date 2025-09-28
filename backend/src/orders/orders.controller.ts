import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';
import { AuthGuard } from './../infrastructure/guards/auth';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrdersService } from './orders.service';
import { IOrderQueue } from './interface/order';
import { Result } from 'src/common/result';
import { FlashSaleGuard } from 'src/infrastructure/guards/flash.sale';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  @UseGuards(AuthGuard, FlashSaleGuard)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<Result<IOrderQueue>> {
    const user = req['user'] as JwtPayload;
    return await this.ordersService.addOrderToQueue(createOrderDto, user);
  }

  @Get()
  async findAll() {
    return await this.ordersService.findAll();
  }

  @UseGuards(AuthGuard)
  async getUserOrders(@Req() req: Request) {
    const user = req['user'] as JwtPayload;
    return await this.ordersService.findOne(user.sub);
  }
}
