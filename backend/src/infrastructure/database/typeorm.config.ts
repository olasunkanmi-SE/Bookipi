import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../data-access/models/product.entity';
import { FlashSale } from '../data-access/models/flash-sales.entity';

const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
  username: process.env.POSTGRES_USER,
  password: process.env.postgres3,
  database: process.env.BOOKIPI,
  entities: [Product, FlashSale],
  synchronize: false,
  logging: true,
};

export default ormConfig;
