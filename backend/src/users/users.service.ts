import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ENV, TYPES } from 'src/common/constants';
import { logError } from 'src/common/utils';
import { User } from 'src/infrastructure/data-access/models/user.entity';
import { Repository } from 'typeorm';
import { IAuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Result } from 'src/common/result';
import { Audit } from 'src/common/audit';

export interface IUserService {
  create(createUserDto: CreateUserDto): Promise<Result<ICreateUserResponseDTO>>;
  signIn(createUserDto: CreateUserDto): Promise<Result<string>>;
  getUserByName(username: string): Promise<User | null>;
}

export interface ICreateUserResponseDTO {
  username: string;
  auditCreatedDateTime: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @Inject(TYPES.IAuthService) private readonly authService: IAuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
  ): Promise<Result<ICreateUserResponseDTO>> {
    try {
      const { username, password } = createUserDto;
      const existingUser = await this.getUserByName(username);
      if (existingUser) {
        throw new BadRequestException('User already exists');
      }
      const hash: string = await this.authService.hashPassword(password);
      const audit = Audit.create({
        auditCreatedBy: username,
        auditCreatedDateTime: new Date().toString(),
      });
      const user: User = await this.userRepository.save({
        username,
        passwordHash: hash,
        auditCreatedBy: audit.auditCreatedBy,
        auditCreatedDateTime: audit.auditCreatedDateTime,
      });
      return Result.ok({
        username: user.username,
        auditCreatedDateTime: user.auditCreatedDateTime,
      });
    } catch (error) {
      logError(error, UsersService.name);
      throw new BadRequestException('Error while creating user');
    }
  }

  async signIn(
    createUserDto: CreateUserDto,
  ): Promise<Result<{ accessToken: string }>> {
    try {
      const { username, password } = createUserDto;
      const user = await this.getUserByName(username);

      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }

      const validatePassword = await this.authService.verifyPassword(
        password,
        user.passwordHash,
      );

      if (!validatePassword) {
        throw new UnauthorizedException('Invalid Username or password');
      }

      const payload = { sub: user.id, username: user.username };
      const secret = (await this.configService.get(ENV.JWT_SECRET)) as string;
      const options = { secret };
      const accessToken = await this.jwtService.signAsync(payload, options);
      return Result.ok({ accessToken });
    } catch (error) {
      logError(error, UsersService.name);
      throw new BadRequestException('Error while signing in user');
    }
  }

  async getUserByName(username: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { username },
    });
    return user;
  }
}
