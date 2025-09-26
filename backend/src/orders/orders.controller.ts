import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Result } from 'src/common/result';
import { JwtPayload } from 'src/infrastructure/interfaces/infrastructure';
import { AuthGuard } from './../infrastructure/guards/auth';
import { CreateOrderDto } from './dto/create-order.dto';
import { IOrderResponseDTO, OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('create')
  @UseGuards(AuthGuard)
  async create(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ): Promise<Result<IOrderResponseDTO>> {
    const user = req['user'] as JwtPayload;
    return await this.ordersService.create(createOrderDto, user);
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
