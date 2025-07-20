import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import Redis from 'ioredis';

describe('RedisService', () => {
  let service: RedisService;
  let redisClient: Redis;

  const mockRedisClient = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
    redisClient = mockRedisClient as unknown as Redis;
    service['getClient'] = jest.fn().mockReturnValue(redisClient);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get a value from redis', async () => {
    const value = 'test';
    redisClient.get = jest.fn().mockResolvedValue(value);
    const result = await service.getClient().get('test');
    expect(result).toBe(value);
  });

  it('should set a value in redis', async () => {
    const value = 'test';
    redisClient.set = jest.fn().mockResolvedValue('OK');
    const result = await service.getClient().set('test', value);
    expect(result).toBe('OK');
  });

  it('should delete a value from redis', async () => {
    redisClient.del = jest.fn().mockResolvedValue(1);
    const result = await service.getClient().del('test');
    expect(result).toBe(1);
  });

  it('should quit the redis client', async () => {
    await service.onApplicationShutdown();
  });
});
