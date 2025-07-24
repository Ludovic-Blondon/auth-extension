import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';
import { Role } from '../users/enums/role.enum';

describe('CoffeesController', () => {
  let controller: CoffeesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoffeesController],
      providers: [CoffeesService],
    }).compile();

    controller = module.get<CoffeesController>(CoffeesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of coffees', () => {
      const result = controller.findAll({
        sub: 1,
        email: 'test@test.com',
        role: Role.REGULAR,
        permissions: [],
      });
      expect(result).toEqual('This action returns all coffees');
    });
  });

  describe('findOne', () => {
    it('should return a coffee', () => {
      const result = controller.findOne('1');
      expect(result).toEqual('This action returns a #1 coffee');
    });
  });

  describe('create', () => {
    it('should create a coffee', () => {
      const result = controller.create({
        name: 'Test Coffee',
        brand: 'Test Brand',
        flavors: ['Test Flavor'],
      });
      expect(result).toEqual('This action adds a new coffee');
    });
  });

  describe('update', () => {
    it('should update a coffee', () => {
      const result = controller.update('1', {
        name: 'Updated Coffee',
        brand: 'Updated Brand',
        flavors: ['Updated Flavor'],
      });
      expect(result).toEqual('This action updates a #1 coffee');
    });
  });

  describe('remove', () => {
    it('should remove a coffee', () => {
      const result = controller.remove('1');
      expect(result).toEqual('This action removes a #1 coffee');
    });
  });
});
