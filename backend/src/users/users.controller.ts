import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { ICreateUserResponseDTO, UsersService } from './users.service';
import { Result } from 'src/common/result';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Result<ICreateUserResponseDTO>> {
    return await this.usersService.create(createUserDto);
  }

  @Post('signin')
  async signin(
    @Body() createUserDto: CreateUserDto,
  ): Promise<Result<{ accessToken: string }>> {
    return await this.usersService.signIn(createUserDto);
  }

  @Get(':email')
  async getUser(@Param('email') email: string) {
    return await this.usersService.getUserByEmail(email);
  }
}
