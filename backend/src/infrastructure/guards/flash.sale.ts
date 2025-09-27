import { CanActivate, ExecutionContext, Inject } from '@nestjs/common';
import { Request } from 'express';
import { TYPES } from 'src/common/constants';
import { IFlashSalesService } from './../../fash-sales/interface/flash.sales';

export class FlashSaleGuard implements CanActivate {
  constructor(
    @Inject(TYPES.IFlashSalesService)
    private readonly flashSalesService: IFlashSalesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const productId = request.params.id;
    await this.flashSalesService.validateActiveFlashSale(productId);
    return true;
  }
}
