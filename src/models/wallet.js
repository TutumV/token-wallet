import {sequelize} from '../utils/db.js';
import {DataTypes} from 'sequelize';


export const WalletModel = sequelize.define('Wallet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  address: {
    type: DataTypes.STRING,
  },
  path: {
    type: DataTypes.STRING,
  },
  mnemonic: {
    type: DataTypes.STRING,
  },
  privateKey: {
    type: DataTypes.STRING,
  },
}, {});
