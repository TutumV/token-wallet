import {ethers} from 'ethers';


export class TokenValidator {
  static createValidate(address, coin, abi) {
    if (!ethers.isAddress(address)) {
      throw Error('Not valid address');
    }
    if (typeof coin !== 'string') {
      throw Error('Coin must be string');
    }
    if (!Array.isArray(abi)) {
      throw Error('ABI must be array');
    }
  }
}
