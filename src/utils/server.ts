import deserializeUser from "../middleware/deserializeUser";
import express from "express";
import routes from "../routes";
import { MongoMemoryServer } from "mongodb-memory-server";

function createServer() {
  const app = express();

  app.use(express.json());

  app.use(deserializeUser);

  routes(app);

  return app;
}

export default createServer;
