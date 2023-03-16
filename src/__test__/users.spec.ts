import supertest from 'supertest';
import createServer from '~/createServer';
import userService from '~/services/userService';

const app = createServer();

const users = [{ email: 'nauvalsh@gmail.com', role: 'ADMIN' }];
const findAndCountUserService = [users, 1];

describe('User', () => {
  describe('get users', () => {
    it('should return 200 and users', async () => {
      // @ts-ignore
      const getUserServiceMock = jest.spyOn(userService, 'findAndCount').mockReturnValueOnce(findAndCountUserService);

      const { statusCode, body } = await supertest(app).get('/api/v1/users');

      expect(getUserServiceMock).toHaveBeenCalledTimes(1);
      expect(statusCode).toBe(200);
      expect(body.data.users).toEqual(users);
    });
  });
});
