import {ethers} from 'ethers';
import {TokenModel} from '../models/token.js';


export class WalletValidator {
  static async sendValidate(address, amount, tokenID) {
    if (!ethers.isAddress(address)) {
      throw Error('Not valid address');
    }
    if (typeof amount !== 'string') {
      throw Error('Amount must be string');
    }
    if (isNaN(Number(amount))) {
      throw Error('Amount is not a number');
    }
    if (tokenID) {
      const token = await TokenModel.findByPk(tokenID);
      if (!token) {
        throw Error('Token not found');
      }
      return token;
    }
  }

  static async createValidate(mnemonic) {
    if (mnemonic && !ethers.Mnemonic.isValidMnemonic(mnemonic)) {
      throw new Error('Invalid Mnemonic');
    }
  }
}
