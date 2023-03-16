import mongoose from "mongoose";
import supertest from "supertest";
import { createProduct } from "../service/product.service";
import { signJwt } from "../utils/jwt.utils";
import createServer from "../utils/server";

const app = createServer();

const userId = new mongoose.Types.ObjectId().toString();

export const productPayload = {
  user: userId,
  title: "Canon EOS 1500D DSLR Camera with 18-55mm Lens",
  description:
    "Designed for first-time DSLR owners who want impressive results straight out of the box, capture those magic moments no matter your level with the EOS 1500D. With easy to use automatic shooting modes, large 24.1 MP sensor, Canon Camera Connect app integration and built-in feature guide, EOS 1500D is always ready to go.",
  price: 879.99,
  image: "https://i.imgur.com/QlRphfQ.jpg",
};
export const userPayload = {
  _id: userId,
  email: "jane.doe@example.com",
  name: "Jane Doe",
};

describe("product", () => {
  describe("get product", () => {
    // describe.only ==> Only runs the tests inside this describe for the current file
    // describe.skip ==> Skips running the tests inside this describe for the current file
    describe("given the product does exist", () => {
      it("should return a 200 status and the product", async () => {
        // add product
        const product = await createProduct(productPayload);

        // call HTTP request to get products
        const { statusCode } = await supertest(app).get(`/api/products/${product.productId}`);

        // status code expected to be 200
        expect(statusCode).toBe(200);
      });
    });
  });

  describe("create product", () => {
    describe("given the user not logged in", () => {
      it("should return a 403", async () => {
        // call HTTP request without bearer token
        const { statusCode } = await supertest(app).post(`/api/products`);

        // expected to be unauthorized
        expect(statusCode).toBe(403);
      });
    });

    describe("given the user logged in", () => {
      it("should return a 200 and create product", async () => {
        // sign payload to get token
        const jwt = signJwt(userPayload);

        // call HTTP request with payload and bearer token
        const { statusCode, body } = await supertest(app)
          .post(`/api/products`)
          .set("Authorization", `Bearer ${jwt}`)
          .send(productPayload);

        // status code expected to be
        expect(statusCode).toBe(200);

        // response body expected have property title with value is productPayload.title
        expect(body).toHaveProperty("title", productPayload.title);
        // response body expected have property title with value is any string
        expect(body).toHaveProperty("_id", expect.any(String));
        // ======> Contoh Error
        // expect(received).toHaveProperty(path, value)

        // Expected path: "_id"

        // Expected value: Any<Number>
        // Received value: "640df4c9668f4fe330827907"
        // ======> End of Penjelasan Contoh Error dibawah ini
        // expect(body).toHaveProperty("_id", expect.any(Number));
      });
    });
  });
});
