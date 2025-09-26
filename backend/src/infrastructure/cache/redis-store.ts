import { Cache } from 'cache-manager';
import type { RedisClientType } from 'redis';

type RedisStoreWithClient = Cache & {
  store: {
    getClient: () => RedisClientType;
  };
};

export { RedisStoreWithClient };
