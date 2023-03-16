import { Request, Response } from "express";
import { omit } from "lodash";
import { CreateUserInput } from "../schema/user.schema";
import { createUser } from "../service/user.service";
import logger from "../utils/logger";

export async function createUserHandler(req: Request<{}, {}, CreateUserInput["body"]>, res: Response) {
  try {
    const user = await createUser(req.body);
    // example response
    // {
    //   email: 'test@example.com',
    //   name: 'Jane Doe',
    //   _id: new ObjectId("640f3ffc2529a90e3c4b50a2"),
    //   createdAt: 2023-03-13T15:23:40.058Z,
    //   updatedAt: 2023-03-13T15:23:40.058Z,
    //   __v: 0
    // }
    return res.send(user);
  } catch (e: any) {
    logger.error(e);
    return res.status(409).send(e.message);
  }
}
