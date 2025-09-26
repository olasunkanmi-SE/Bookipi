export enum OrderStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export const TYPES = {
  IAuthService: 'IAuthService',
  IUserService: 'IUserService',
  IRedisService: 'IRedisService',
  IFlashSalesService: 'IFlashSalesService',
};

export enum ENV {
  SALT_ROUNDS = 'SALT_ROUNDS',
  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRY = 3600,
  SYSTEM = 'System',
}
