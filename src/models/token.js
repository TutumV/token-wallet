import {sequelize} from '../utils/db.js';
import {DataTypes} from 'sequelize';


export const TokenModel = sequelize.define('Token', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  address: {
    type: DataTypes.STRING,
  },
  abi: {
    type: DataTypes.JSONB,
  },
  coin: {
    type: DataTypes.STRING,
  },
}, {});
