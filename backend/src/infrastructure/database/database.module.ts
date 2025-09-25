import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../data-access/models/order.entity';
import { FlashSale } from '../data-access/models/flash-sales.entity';
import { User } from '../data-access/models/user.entity';
import { Product } from '../data-access/models/product.entity';
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow('POSTGRES_HOST'),
        port: config.getOrThrow('POSTGRES_PORT'),
        database: config.getOrThrow('POSTGRES_DB'),
        username: config.getOrThrow('POSTGRES_USER'),
        password: config.getOrThrow('POSTGRES_PASSWORD'),
        entities: [Order, FlashSale, User, Product],
        autoLoadEntities: false,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
