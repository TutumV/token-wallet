import {pino} from 'pino';
import {PrismaClient} from '@prisma/client';

export interface Config {
  port: string;
  logLevel: string;
  node: {
    url: string;
    tokenGasLimit: number;
    ethGasLimit: number;
  };
}

export const config: Config = {
  port: process.env.HTTP_PORT ?? '4000',
  logLevel: process.env.HTTP_LOG_LEVEL ?? 'info',
  node: {
    url: process.env.NODE_URL ?? '',
    tokenGasLimit: Number(process.env.DEFAULT_TOKEN_GAS_LIMIT ?? 300000),
    ethGasLimit: Number(process.env.DEFAULT_ETH_GAS_LIMIT ?? 21000),
  },
};

export const logger = pino({
  level: config.logLevel,
  transport: {
    target: 'pino-pretty',
  },
});

export const prisma = new PrismaClient();
