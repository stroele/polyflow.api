import "reflect-metadata";
import "dotenv/config";
import { ApolloServer } from "apollo-server-express";
import * as express from "express";
import * as session from "express-session";
import * as pino from "express-pino-logger";
import { createConnection } from "typeorm";

import { port } from "./config";
import logger from "./logger";
import schema from "./GraphQL";

const startServer = async () => {
  const server = new ApolloServer({
    schema,
    context: ({ req, res }: any) => ({ req, res })
  });

  await createConnection();

  const app = express();

  app.use(
    session({
      secret: "i5n31io13ip5h1p",
      resave: false,
      saveUninitialized: false
    })
  );

  app.use(pino({ logger }));

  server.applyMiddleware({
    app,
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL || "https://polyflow.yanmendes.dev"
    }
  });

  app.listen({ port }, () => console.log(`Server ready. Lestining on ${port}`));
};

startServer().catch(e => logger.error(e));
