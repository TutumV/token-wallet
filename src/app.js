import express from 'express';
import {config} from './config.js';
import {sequelize} from './utils/db.js';
import {WalletRouter} from './views/wallet.js';
import {TokenRouter} from './views/token.js';
import {setup, serve} from 'swagger-ui-express';
import {swaggerSpec} from './utils/openapi.js';
import cors from 'cors';

export class Application {
  constructor() {
    this.docsUrl = '/docs';
    this.baseUrl = `${config.app.schema}${config.app.host}:${config.app.port}`;
    this.app = express();
  }

  setupRoutes() {
    this.app.use(this.docsUrl, serve, setup(swaggerSpec));
    this.app.use('/wallet', WalletRouter);
    this.app.use('/token', TokenRouter);
  }

  async setupDatabases() {
    await sequelize.sync();
  }

  async init() {
    this.app.use(express.json());
    this.app.use(cors());
    this.setupRoutes();
    await this.setupDatabases();
    this.server = this.app.listen(config.app.port);
    console.log(`Server running at ${this.baseUrl}`);
    console.log(`Swagger started on ${this.baseUrl}${this.docsUrl}`);
    return this;
  }

  close() {
    this.server.close();
  }
}


export const application = new Application();
