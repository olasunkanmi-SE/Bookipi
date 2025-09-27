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

export const OrderQueueConstants = {
  QUEUE_NAME: 'order-queue',
  CREATE_ORDER_JOB: 'create-order-job',
  DECREMENT_COUNT: 1,
};

export const JobOptions = {
  DEFAULT_ATTEMPTS: 3,
  BACKOFF_DELAY_MS: 1000,
  TYPE: 'exponential',
};
