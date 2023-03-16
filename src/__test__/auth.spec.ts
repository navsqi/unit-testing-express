import supertest from 'supertest';
import { DataSource } from 'typeorm';
import createServer from '~/createServer';
import authService from '~/services/authService';
import connect from '~/utils/connect';

const app = createServer();

let connection: DataSource;

beforeAll(async () => {
  connection = await connect();
  await connection.synchronize();
});

beforeEach(async () => {
  await connection.query(`TRUNCATE users`);
});

afterAll(async () => {
  await connection.destroy();
});

const email = 'nauvalshidqi@gmail.com';

describe('Auth', () => {
  describe('user registration', () => {
    it('should return 400 payload validation error', async () => {
      const registerSpy = jest.spyOn(authService, 'register');

      const { statusCode, body } = await supertest(app)
        .post('/api/v1/auth/register')
        .auth(process.env.BASIC_PASSWORD, process.env.BASIC_PASSWORD, { type: 'basic' })
        .send({
          email: '',
          password: '',
        });

      expect(registerSpy).not.toHaveBeenCalled();
      expect(statusCode).toBe(400);
      expect(body).not.toBe('success');
    });

    it('should return 200 with signed token', async () => {
      const registerSpy = jest.spyOn(authService, 'register');

      const { statusCode, body } = await supertest(app)
        .post('/api/v1/auth/register')
        .auth(process.env.BASIC_PASSWORD, process.env.BASIC_PASSWORD, { type: 'basic' })
        .send({
          email: email,
          password: '123',
        });

      expect(registerSpy).toHaveBeenCalled();
      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('data.bearer.token', expect.any(String));
      expect(body).toHaveProperty('data.user.email', email);
    });

    it('should return 400 email already exist', async () => {
      const registerMock = jest
        .spyOn(authService, 'register')
        .mockRejectedValueOnce({ error: true, data: null, msg: 'Email already exist!', statusCode: 400 });

      const { statusCode, body } = await supertest(app)
        .post('/api/v1/auth/register')
        .auth(process.env.BASIC_PASSWORD, process.env.BASIC_PASSWORD, { type: 'basic' })
        .send({
          email: email,
          password: '123',
        });

      expect(registerMock).toHaveBeenCalled();
      expect(statusCode).toBe(400);
      expect(body.status).not.toBe('success');
    });
  });
});
