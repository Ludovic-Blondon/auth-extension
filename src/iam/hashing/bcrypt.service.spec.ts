import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should hash a password', async () => {
    const password = 'password';
    const hashedPassword = await service.hash(password);
    expect(hashedPassword).toBeDefined();
  });

  it('should verify a password', async () => {
    const password = 'password';
    const hashedPassword = await service.hash(password);
    const isVerified = await service.compare(password, hashedPassword);
    expect(isVerified).toBe(true);
  });

  it('should not verify a password', async () => {
    const password = 'password';
    const hashedPassword = await service.hash(password);
    const isVerified = await service.compare('wrong-password', hashedPassword);
    expect(isVerified).toBe(false);
  });
});
