import config from "config";
import dotenv from "dotenv";
import { Request, Response } from "express";
import responseTime from "response-time";
import connect from "./utils/connect";
import logger from "./utils/logger";
import { restResponseTimeHistogram, startMetricsServer } from "./utils/metrics";
import createServer from "./utils/server";
import swaggerDocs from "./utils/swagger";
dotenv.config();

const port = config.get<number>("port");

const app = createServer();

app.use(
  responseTime((req: Request, res: Response, time: number) => {
    if (req?.route?.path) {
      restResponseTimeHistogram.observe(
        {
          method: req.method,
          route: req.route.path,
          status_code: res.statusCode,
        },
        time * 1000
      );
    }
  })
);

app.listen(port, async () => {
  logger.info(`App is running at http://localhost:${port}`);

  await connect();

  startMetricsServer();

  swaggerDocs(app, port);
});
