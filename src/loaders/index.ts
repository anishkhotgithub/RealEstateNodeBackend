import { Container } from "typedi";
import loggerLoader from "./logger";
import dbLoader from "./db";
import models from "../api/model";
import config from "../api/config/config";

export default async () => {
  // 1. Logger
  const logger = loggerLoader();
  Container.set("logger", logger);

  // 2. Database connection (Mongo)
  const dbConnection = await dbLoader();
  Container.set("mongoConnection", dbConnection);

  // 3. Register models dynamically
  models.forEach((m) => {
    // Call the factory (your `auth.ts` returns a model factory)
    const modelInstance = m.model(config.communityName);
    Container.set(m.name, modelInstance);
  });

  //4. ThrowError
  const throwError = (message: string, statusCode: number) => {
    throw Object.assign(new Error(message), { statusCode } as {
      statusCode: number;
    });
  };

  Container.set("throwError", throwError);

  logger.info("✅ All loaders initialized & dependencies registered.");
};
