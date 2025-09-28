import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TYPES } from 'src/common/constants';
import { AuthService } from './auth.service';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    UsersService,
    JwtService,
    {
      provide: TYPES.IAuthService,
      useClass: AuthService,
    },
  ],
})
export class UsersModule {}
