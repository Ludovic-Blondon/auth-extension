import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import Redis, { Redis as RedisClient } from 'ioredis';

@Injectable()
export class RedisService implements OnApplicationShutdown {
  private readonly client: RedisClient;

  constructor() {
    this.client = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }

  getClient(): RedisClient {
    return this.client;
  }

  onApplicationShutdown() {
    return this.client.quit();
  }
}
