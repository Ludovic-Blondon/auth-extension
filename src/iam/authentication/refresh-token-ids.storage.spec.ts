import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { Redis } from 'ioredis';

describe('RefreshTokenIdsStorage', () => {
  it('should be defined', () => {
    const mockRedisClient = {} as Redis;
    expect(new RefreshTokenIdsStorage(mockRedisClient)).toBeDefined();
  });
});
