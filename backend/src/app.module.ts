import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ENV } from './common/constants';
import { FlashSalesModule } from './fash-sales/fash-sales.module';
import { RedisCacheModule } from './infrastructure/cache/redis.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { PurchasesModule } from './purchases/purchases.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    RedisCacheModule,
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
        REDIS_PASSWORD: Joi.string().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        global: true,
        secret: config.get<string>(ENV.JWT_SECRET),
        signOptions: { expiresIn: ENV.JWT_EXPIRY },
      }),
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST'),
          port: configService.get<number>('REDIS_PORT'),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
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
