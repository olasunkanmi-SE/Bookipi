import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { PurchasesModule } from './purchases/purchases.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FlashSalesModule } from './fash-sales/fash-sales.module';
import { JwtModule } from '@nestjs/jwt';
import { ENV } from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>(ENV.JWT_SECRET),
        signOptions: { expiresIn: ENV.EXPIRY },
      }),
    }),
    DatabaseModule,
    ProductsModule,
    FlashSalesModule,
    UsersModule,
    ProductsModule,
    OrdersModule,
    PurchasesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
