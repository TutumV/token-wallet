import dotenv from 'dotenv';

dotenv.config({path: process.env.DOTENV_CONFIG || '.env'});

export const config = {
  db: {
    engine: process.env.POSTGRES_ENGINE,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    name: process.env.POSTGRES_NAME,
    dsn: process.env.POSTGRES_DSN,
    defaultDB: process.env.POSTGRES_DEFAULT_DB,
  },
  app: {
    schema: process.env.SCHEMA,
    host: process.env.HOST,
    port: process.env.PORT,
  },
  node: {
    url: process.env.NODE_URL,
    gasLimit: process.env.DEFAULT_GAS_LIMIT,
  },
};
