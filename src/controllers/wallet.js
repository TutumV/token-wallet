import {ethers, Wallet} from 'ethers';
import {WalletModel} from '../models/wallet.js';
import {config} from '../config.js';
import {TokenModel} from '../models/token.js';
import Web3 from 'web3';


export class WalletController {
  constructor(instance) {
    this.instance = instance;
    this.web3 = new Web3(config.node.url);
  }

  async #sendToken(address, amount, tokenID, gasPrice) {
    const token = await TokenModel.findByPk(tokenID);
    if (!token.id) {
      throw new Error('Token Not Found');
    }
    const tokenBalance = await this.#tokenBalance(token);
    if (amount > tokenBalance) {
      throw new Error(
          `Balance less amount. amount:${amount} balance:${tokenBalance}`,
      );
    }

    const contract = new this.web3.eth.Contract(token.abi, token.address);
    const decimals = await contract.methods.decimals().call();
    if (!gasPrice) {
      gasPrice = await this.web3.eth.getGasPrice();
    }
    const gasLimit = config.node.gasLimit;
    await this.#checkFee(gasPrice, gasLimit);

    const tokenAmount = amount * (10 ** decimals);
    const data = contract.methods.transfer(address, tokenAmount).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(
        this.instance.address,
    );

    const signedTx = await this.web3.eth.accounts.signTransaction(
        {
          to: token.address,
          value: 0,
          gas: gasLimit,
          gasPrice: gasPrice,
          nonce: nonce,
          chainId: 1,
          data: data,
        },
        this.instance.privateKey,
    );

    const result = await this.web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
    );
    return {'txID': result.transactionHash};
  }

  async #sendETH(address, amount, gasPrice) {
    if (!gasPrice) {
      gasPrice = await this.web3.eth.getGasPrice();
    }
    const gasLimit = 21000;
    const weiAmount = this.web3.utils.toWei(amount);
    await this.#checkFee(gasPrice, gasLimit, weiAmount);

    const nonce = await this.web3.eth.getTransactionCount(
        this.instance.address,
    );
    const signedTx = await this.web3.eth.accounts.signTransaction(
        {
          to: address,
          value: weiAmount,
          gas: gasLimit,
          gasPrice: gasPrice,
          nonce: nonce,
          chainId: 1,
        },
        this.instance.privateKey,
    );
    const result = await this.web3.eth.sendSignedTransaction(
        signedTx.rawTransaction,
    );
    return {'txID': result.transactionHash};
  }

  async send(address, amount, tokenID, gasPrice) {
    if (!this.web3.utils.checkAddressChecksum(address)) {
      address = this.web3.utils.toChecksumAddress(address);
    }
    if (tokenID) {
      return await this.#sendToken(address, amount, tokenID, gasPrice);
    } else {
      return await this.#sendETH(address, amount, gasPrice);
    }
  }

  async #checkFee(gasPrice, gasLimit, weiAmount = '0') {
    const weiBalance = await this.web3.eth.getBalance(this.instance.address);
    const balance = this.web3.utils.fromWei(weiBalance, 'ether');

    const feeAmount = gasPrice * gasLimit;

    const weiRequired = feeAmount + weiAmount;
    const required = this.web3.utils.fromWei(weiRequired, 'ether');
    if (weiRequired > weiBalance) {
      throw new Error(
          `Insufficient funds required: ${required} balance: ${balance}`,
      );
    }
  }

  async #tokenBalance(token) {
    const contract = new this.web3.eth.Contract(token.abi, token.address);
    const result = await contract.methods.balanceOf(
        this.instance.address,
    ).call();
    const decimals = await contract.methods.decimals().call();
    return result / (10 ** decimals);
  }

  async #balance() {
    const weiBalance = await this.web3.eth.getBalance(this.instance.address);
    return this.web3.utils.fromWei(weiBalance, 'ether');
  }

  async walletBalance() {
    const tokens = await TokenModel.findAll();
    const tokenData = [];
    for (const token of tokens) {
      tokenData.push({
        id: token.id,
        coin: token.coin,
        balance: await this.#tokenBalance(token),
      });
    }
    return {
      id: this.instance.id,
      address: this.instance.address,
      mnemonic: this.instance.mnemonic,
      path: this.instance.path,
      balance: await this.#balance(),
      tokens: tokenData,
    };
  }

  static async create(mnemonic) {
    let walletData;
    if (!mnemonic) {
      walletData = Wallet.createRandom();
    } else {
      walletData = ethers.HDNodeWallet.fromPhrase(mnemonic);
    }
    const [wallet] = await WalletModel.findOrCreate({
      where: {mnemonic: walletData.mnemonic.phrase},
      defaults: {
        address: walletData.address,
        path: walletData.path,
        privateKey: walletData.privateKey,
      },
    });
    return wallet;
  }
}
