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
  IProductService: 'IProductService',
  IOrderService: 'IOrderService',
};

export enum ENV {
  SALT_ROUNDS = 'SALT_ROUNDS',
  JWT_SECRET = 'JWT_SECRET',
  JWT_EXPIRY = 3600,
  SYSTEM = 'System',
}

export const ORDER_PROCESSING = 'order-processing';
export const CREATE_ORDER_JOB = 'create-order-job';
export const DECREMENT_COUNT = 1;
