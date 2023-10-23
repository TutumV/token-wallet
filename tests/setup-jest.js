import {application} from '../src/app.js';
import {Sequelize} from 'sequelize';
import {config} from '../src/config.js';


export default async (globalConfig, projectConfig) => {
  const sequelize = new Sequelize(
    config.db.defaultDB, config.db.user, config.db.password,
    {
      host: config.db.host,
      dialect: config.db.engine,
    },
  );
  await sequelize.query(`DROP DATABASE IF EXISTS ${config.db.name}`);
  await sequelize.query(`CREATE DATABASE ${config.db.name} OWNER ${config.db.user}`);
  globalThis.app = await application.init();
}
