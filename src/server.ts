import express, {Request, Response, NextFunction} from 'express';
import cors from 'cors';
import {Server} from 'node:http';
import {pinoHttp} from 'pino-http';
import router from './handlers/index.js';
import {config, logger} from './service.js';
import {responseMatrix} from './const.js';
import {setup, serve, JsonObject} from 'swagger-ui-express';
import {CodeError} from './util.js';
import {ZodError} from 'zod';
import yaml from 'yaml';
import fs from 'fs';
import {ErrorRequestHandler} from 'express-serve-static-core';
import {ResponseBody} from './types/response.type.js';

export const server = (): Server => {
  const app = express();

  app.use(pinoHttp({logger}));
  app.use(express.json());
  app.use(cors());

  app.response.sendRes = function (code: number, body: Record<string, unknown> = {}) {
    const defaultErrorCode = 10005;
    if (!Object.hasOwn(responseMatrix, code)) {
      logger.info('Unknown Code: ', code);
      code = defaultErrorCode;
    }
    const {status, message} = responseMatrix[code];
    const resBody: ResponseBody = {code: code, body: body, message};
    this.status(status).send(resBody);
  };

  app.response.catchError = function (e: unknown) {
    if (e instanceof CodeError) {
      this.sendRes(e.code);
      return;
    }
    if (e instanceof ZodError) {
      this.sendRes(10006, e.issues);
      return;
    }
    logger.error(e);
    this.sendRes(10005);
  };

  const file = fs.readFileSync('./src/docs/openapi.yaml', 'utf8');
  const swaggerDocument = yaml.parse(file) as JsonObject;

  app.use('/api', router);
  app.use('/swagger', serve, setup(swaggerDocument));
  app.use('*', function (_req: express.Request, res: express.Response) {
    res.sendRes(10003);
    return;
  });
  app.use(((err: unknown, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) {
      res.status(500).send({code: 10005, body: {}, message: 'Internal Error'});
      return;
    }
    next();
  }) as unknown as ErrorRequestHandler);

  return app.listen(config.port, () => {
    logger.info(`app listen on port ${config.port}`);
  });
};
