import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../src/iam/iam.module';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import { Role } from '../../src/users/enums/role.enum';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

describe('Coffees', () => {
  let app: INestApplication<App>;
  const testUserRegular = {
    email: 'testregular@test.com',
    password: 'password',
  };
  const testUserAdmin = {
    email: 'admin@test.com',
    password: 'password',
    role: Role.ADMIN,
  };
  let accessTokenRegular: string;
  let accessTokenAdmin: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        IamModule,
        CoffeesModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5433,
          username: 'postgres',
          password: 'pass123',
          database: 'postgres',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('SignUp', () => {
    it('Create a regular user', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(testUserRegular);

      expect(response.status).toBe(201);
    });

    it('Create a admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/sign-up')
        .send(testUserAdmin);

      expect(response.status).toBe(201);
    });
  });

  describe('SignIn', () => {
    it('Sign in a regular user', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send(testUserRegular);

      expect(response.status).toBe(200);
      const authResponse = response.body as AuthResponse;
      expect(authResponse.accessToken).toBeDefined();
      expect(authResponse.refreshToken).toBeDefined();
      accessTokenRegular = authResponse.accessToken;
    });

    it('Sign in a admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send({
          email: testUserAdmin.email,
          password: testUserAdmin.password,
        });

      expect(response.status).toBe(200);
      const authResponse = response.body as AuthResponse;
      expect(authResponse.accessToken).toBeDefined();
      expect(authResponse.refreshToken).toBeDefined();
      accessTokenAdmin = authResponse.accessToken;
    });
  });

  describe('Get all coffees', () => {
    it('Get all coffees as a regular user', async () => {
      const response = await request(app.getHttpServer())
        .get('/coffees')
        .set('Authorization', `Bearer ${accessTokenRegular}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Get One Coffee', () => {
    it('Get One Coffee as a regular user', async () => {
      const response = await request(app.getHttpServer())
        .get('/coffees/1')
        .set('Authorization', `Bearer ${accessTokenRegular}`);

      expect(response.status).toBe(200);
    });
  });

  describe('Create a Coffee', () => {
    it('Create a Coffee as a admin user', async () => {
      const response = await request(app.getHttpServer())
        .post('/coffees')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({});

      expect(response.status).toBe(201);
    });

    it('Create a Coffee as a regular user need fail', async () => {
      const response = await request(app.getHttpServer())
        .post('/coffees')
        .set('Authorization', `Bearer ${accessTokenRegular}`)
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('Update a Coffee', () => {
    it('Update a Coffee as a admin user', async () => {
      const response = await request(app.getHttpServer())
        .patch('/coffees/1')
        .set('Authorization', `Bearer ${accessTokenAdmin}`)
        .send({});

      expect(response.status).toBe(200);
    });

    it('Update a Coffee as a regular user need fail', async () => {
      const response = await request(app.getHttpServer())
        .patch('/coffees/1')
        .set('Authorization', `Bearer ${accessTokenRegular}`)
        .send({});

      expect(response.status).toBe(403);
    });
  });

  describe('Delete a Coffee', () => {
    it('Delete a Coffee as a admin user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/coffees/1')
        .set('Authorization', `Bearer ${accessTokenAdmin}`);

      expect(response.status).toBe(200);
    });

    it('Delete a Coffee as a regular user need fail', async () => {
      const response = await request(app.getHttpServer())
        .delete('/coffees/1')
        .set('Authorization', `Bearer ${accessTokenRegular}`);

      expect(response.status).toBe(403);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
