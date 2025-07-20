import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesService } from './coffees.service';

describe('CoffeesService', () => {
  let service: CoffeesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoffeesService],
    }).compile();

    service = module.get<CoffeesService>(CoffeesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of coffees', () => {
      const result = service.findAll();
      expect(result).toEqual('This action returns all coffees');
    });
  });

  describe('findOne', () => {
    it('should return a coffee', () => {
      const result = service.findOne(1);
      expect(result).toEqual('This action returns a #1 coffee');
    });
  });

  describe('create', () => {
    it('should create a coffee', () => {
      const result = service.create({
        name: 'Test Coffee',
        brand: 'Test Brand',
        flavors: ['Test Flavor'],
      });
      expect(result).toEqual('This action adds a new coffee');
    });
  });

  describe('update', () => {
    it('should update a coffee', () => {
      const result = service.update(1, {
        name: 'Updated Coffee',
        brand: 'Updated Brand',
        flavors: ['Updated Flavor'],
      });
      expect(result).toEqual('This action updates a #1 coffee');
    });
  });

  describe('remove', () => {
    it('should remove a coffee', () => {
      const result = service.remove(1);
      expect(result).toEqual('This action removes a #1 coffee');
    });
  });
});
