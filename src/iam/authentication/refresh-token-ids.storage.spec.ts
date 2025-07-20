import {
  InvalidatedRefreshTokenError,
  RefreshTokenIdsStorage,
} from './refresh-token-ids.storage';
import { Redis } from 'ioredis';

describe('RefreshTokenIdsStorage', () => {
  it('should be defined', () => {
    const mockRedisClient = {} as Redis;
    expect(new RefreshTokenIdsStorage(mockRedisClient)).toBeDefined();
  });

  it('should insert a token id', async () => {
    const mockRedisClient = {
      set: jest.fn(),
    } as unknown as Redis;
    const storage = new RefreshTokenIdsStorage(mockRedisClient);
    await storage.insert(1, 'token-id');
  });

  it('should validate a token id', async () => {
    const mockRedisClient = {
      get: jest.fn().mockResolvedValue('token-id'),
    } as unknown as Redis;
    const storage = new RefreshTokenIdsStorage(mockRedisClient);
    const result = await storage.validate(1, 'token-id');
    expect(result).toBe(true);
  });

  it('should invalidate a token id', async () => {
    const mockRedisClient = {
      del: jest.fn(),
    } as unknown as Redis;
    const storage = new RefreshTokenIdsStorage(mockRedisClient);
    await storage.invalidate(1);
  });

  it('should throw an error if the token id is invalid', async () => {
    const mockRedisClient = {
      get: jest.fn().mockResolvedValue('different-token-id'),
    } as unknown as Redis;
    const storage = new RefreshTokenIdsStorage(mockRedisClient);
    await expect(storage.validate(1, 'invalid-token-id')).rejects.toThrow(
      InvalidatedRefreshTokenError,
    );
  });

  it('should get the key', () => {
    const storage = new RefreshTokenIdsStorage({} as Redis);
    expect(storage.getKey(1)).toBe('user-1');
  });

  it('should throw an error if the token id is invalid', async () => {
    const mockRedisClient = {
      get: jest.fn().mockResolvedValue(null),
    } as unknown as Redis;
    const storage = new RefreshTokenIdsStorage(mockRedisClient);
    await expect(storage.validate(1, 'invalid-token-id')).rejects.toThrow(
      new InvalidatedRefreshTokenError(),
    );
  });
});
