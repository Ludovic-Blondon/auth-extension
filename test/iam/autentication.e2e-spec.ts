import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IamModule } from '../../src/iam/iam.module';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { CoffeesModule } from '../../src/coffees/coffees.module';
import * as jwt from 'jsonwebtoken';

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

describe('Authentication', () => {
  let app: INestApplication<App>;
  const testUser = {
    email: 'test@test.com',
    password: 'password',
  };
  let accessToken: string;
  let refreshToken: string;
  let newRefreshToken: string;

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
    describe('when the user is created with success', () => {
      it('should sign up a user', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-up')
          .send(testUser);

        expect(response.status).toBe(201);
      });
    });

    describe('when the user is not created', () => {
      it('when the user already exists', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-up')
          .send(testUser);

        expect(response.status).toBe(409);
      });

      it('when the password is not strong enough', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-up')
          .send({ ...testUser, password: '123' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: ['password must be longer than or equal to 8 characters'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('when the email is not valid', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-up')
          .send({ ...testUser, email: 'invalid-email' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: ['email must be an email'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('when the email is not provided', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-up')
          .send({ ...testUser, email: '' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: ['email must be an email'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });
    });
  });

  describe('SignIn', () => {
    describe('when the user is authenticated with success', () => {
      it('should sign in a user', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-in')
          .send(testUser);

        expect(response.status).toBe(200);
        const authResponse = response.body as AuthResponse;
        expect(authResponse.accessToken).toBeDefined();
        expect(authResponse.refreshToken).toBeDefined();
        accessToken = authResponse.accessToken;
        refreshToken = authResponse.refreshToken;
      });
    });

    describe('when the user is not authenticated', () => {
      it('should not sign in a user', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-in')
          .send({ ...testUser, password: 'wrong-password' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: 'Unauthorized',
          message: 'Invalid password',
          statusCode: 401,
        });
      });

      it('should not sign in a user', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-in')
          .send({ ...testUser, email: 'wrong-email@test.com' });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          error: 'Unauthorized',
          message: 'User not found',
          statusCode: 401,
        });
      });

      it('when the email is not provided', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-in')
          .send({ ...testUser, email: '' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: ['email must be an email'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('when the email is not an email', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-in')
          .send({ ...testUser, email: 'not-an-email' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: ['email must be an email'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('when the password is not provided', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/sign-in')
          .send({ ...testUser, password: '' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: ['password must be longer than or equal to 8 characters'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });
    });
  });

  describe('Refresh Tokens', () => {
    let insideRefreshToken: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send(testUser);

      const authResponse = response.body as AuthResponse;
      insideRefreshToken = authResponse.refreshToken;
    });

    describe('when the refresh token is valid', () => {
      it('should refresh the tokens', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/refresh-tokens')
          .send({ refreshToken: insideRefreshToken });

        expect(response.status).toBe(200);
        const authResponse = response.body as AuthResponse;
        expect(authResponse.accessToken).toBeDefined();
        expect(authResponse.refreshToken).toBeDefined();
      });
    });

    describe('when the refresh token is invalid', () => {
      it('When is not a JWT', async () => {
        const response = await request(app.getHttpServer())
          .post('/authentication/refresh-tokens')
          .send({ refreshToken: 'invalid-refresh-token' });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          message: ['refreshToken must be a jwt string'],
          error: 'Bad Request',
          statusCode: 400,
        });
      });

      it('When is wrong JWT', async () => {
        const fakeRefreshToken = jwt.sign(
          {
            sub: '123',
            email: 'test@test.com',
          },
          'wrong-secret',
        );
        const response = await request(app.getHttpServer())
          .post('/authentication/refresh-tokens')
          .send({ refreshToken: fakeRefreshToken });

        expect(response.status).toBe(401);
        expect(response.body).toEqual({
          message: 'Unauthorized',
          statusCode: 401,
        });
      });
    });
  });

  describe('Rotate Refresh Token', () => {
    it('should rotate the refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/sign-in')
        .send(testUser);

      expect(response.status).toBe(200);
      const authResponse = response.body as AuthResponse;
      expect(authResponse.accessToken).toBeDefined();
      expect(authResponse.refreshToken).toBeDefined();
      accessToken = authResponse.accessToken;
      refreshToken = authResponse.refreshToken;
    });

    it('Should retrive coffees with access token', async () => {
      const response = await request(app.getHttpServer())
        .get('/coffees')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it('Should not retrieve coffees with refresh token', async () => {
      const response = await request(app.getHttpServer())
        .get('/coffees')
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('Get new tokens with refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/refresh-tokens')
        .send({ refreshToken });

      expect(response.status).toBe(200);
      const authResponse = response.body as AuthResponse;
      expect(authResponse.accessToken).toBeDefined();
      expect(authResponse.refreshToken).toBeDefined();
      accessToken = authResponse.accessToken;
      newRefreshToken = authResponse.refreshToken;
    });

    it('Should retrieve coffees with access token from refresh tokens route', async () => {
      const response = await request(app.getHttpServer())
        .get('/coffees')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
    });

    it('Should retrieve a second time with same refresh token and invalid all tokens', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/refresh-tokens')
        .send({ refreshToken });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        message: 'Access denied',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });

    it('Retrieve new tokens with new refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/authentication/refresh-tokens')
        .send({ refreshToken: newRefreshToken });

      expect(response.status).toBe(200);
      const authResponse = response.body as AuthResponse;
      expect(authResponse.accessToken).toBeDefined();
      expect(authResponse.refreshToken).toBeDefined();
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
