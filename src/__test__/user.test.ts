import mongoose from "mongoose";
import supertest from "supertest";
import createServer from "../utils/server";
import * as UserService from "../service/user.service";
import * as SessionService from "../service/session.service";
import { createUserSessionHandler } from "../controller/session.controller";

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

const userPayload = {
  _id: userId,
  email: "jane.doe@example.com",
  name: "Jane Doe",
};

const userInput = {
  email: "test@example.com",
  name: "Jane Doe",
  password: "Password123",
  passwordConfirmation: "Password123",
};

const sessionPayload = {
  _id: new mongoose.Types.ObjectId().toString(),
  user: userId,
  valid: true,
  userAgent: "PostmanRuntime/7.28.4",
  createdAt: new Date("2021-09-30T13:31:07.674Z"),
  updatedAt: new Date("2021-09-30T13:31:07.674Z"),
  __v: 0,
};

describe("user", () => {
  describe(`user registration`, () => {
    describe("given the username and password are valid", () => {
      it("should return a 200", async () => {
        // Sometimes you only want to watch a method be called, but keep the original implementation. Other times you may want to mock the implementation, but restore the original later in the suite.

        // In these cases, you can use jest.spyOn
        //  @ts-ignore
        const createUserServiceMock = jest.spyOn(UserService, "createUser");

        //  override the implementation
        //  @ts-ignore
        createUserServiceMock.mockImplementation(() => "Yeay!");
        expect(UserService.createUser(userInput)).toEqual("Yeay!");
        createUserServiceMock.mockReset();

        const { statusCode, body } = await supertest(app).post("/api/users").send(userInput);

        expect(createUserServiceMock).toHaveBeenCalledTimes(1);
        expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
        expect(statusCode).toBe(200);
        expect(body).toHaveProperty("email", userInput.email);
      });

      it("should return the user payload", async () => {
        // membuat mock function createUser pada UserService agar nilai yang dikembalikan sesuai dengan yang kita inginkan
        // Mocking is a technique to isolate test subjects by replacing dependencies with objects that you can control and inspect. A dependency can be anything your subject depends on, but it is typically a module that the subject imports.
        //  @ts-ignore
        const createUserServiceMock = jest.spyOn(UserService, "createUser").mockReturnValueOnce(userPayload);

        //  memasukan user input pada handler
        const { statusCode, body } = await supertest(app).post("/api/users").send(userInput);

        //  mengecek apakah function createUser terpanggil 1x
        expect(createUserServiceMock).toHaveBeenCalledTimes(1);
        //  mengecek apakah function createUser terpanggil dengan parameter userInput
        expect(createUserServiceMock).toHaveBeenCalledWith(userInput);
        //  mengecek handler apakah memiliki status code 200
        expect(statusCode).toBe(200);
        //  mengecek response handler, response-nya sudah kita mocking diatas menjadi userPayload
        expect(body).toEqual(userPayload);
      });
    });

    describe("given the password do not match", () => {
      it("should return a 400", async () => {
        // @ts-ignore
        const createUserServiceMock = jest.spyOn(UserService, "createUser").mockReturnValueOnce(userPayload);

        // test validasi jika password & passwordConfirmation does not match
        const { statusCode } = await supertest(app)
          .post("/api/users")
          .send({ ...userInput, passwordConfirmation: "doesnotmatch" });

        expect(statusCode).toBe(400);
        // test function createUser pada UserService harusnya tidak terpanggil
        expect(createUserServiceMock).not.toHaveBeenCalled();
      });
    });

    describe("given the user service throws", () => {
      it("should return a 409 error", async () => {
        const msgErr = "oh no! :(";

        // mocking fungsi create user seolah2 terjadi error dengan pesan error yang kita inginkan
        const createUserServiceMock = jest.spyOn(UserService, "createUser").mockRejectedValueOnce(msgErr);

        const { statusCode } = await supertest(app).post("/api/users").send(userInput);

        expect(statusCode).toBe(409);
        expect(createUserServiceMock).toHaveBeenCalled();
      });
    });
  });

  describe(`create user session`, () => {
    describe("given the username and password are valid", () => {
      it("should return a signed accessToken & refresh token", async () => {
        // @ts-ignore
        jest.spyOn(UserService, "validatePassword").mockReturnValue(userPayload);

        // @ts-ignore
        jest.spyOn(SessionService, "createSession").mockReturnValue(sessionPayload);

        // mocking request handler
        const req = {
          get: () => {
            return "a user agent";
          },
          body: {
            email: "test@example.com",
            password: "Password123",
          },
        };

        // mocking fungsi send pada response handler / controller
        const send = jest.fn();

        // mocking response handler
        const res = {
          send,
        };

        // memanggil session.controller/createUserSessionHandler
        // @ts-ignore
        await createUserSessionHandler(req, res);

        // mengecek fungsi send terpanggil dengan parameter object yang berisi accessToken & refreshToken
        expect(send).toHaveBeenCalledWith({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        });
      });
    });
  });
});
