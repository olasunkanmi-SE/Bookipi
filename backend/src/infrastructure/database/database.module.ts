import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './typeorm.config';

@Module({
  imports: [TypeOrmModule.forRootAsync(ormConfig)],
})
export class DatabaseModule {}
