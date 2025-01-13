import {ethers, Wallet as WalletEthers, HDNodeWallet} from 'ethers';
import {SendData, WalletBalanceInfo} from '../types/controller.type.js';
import {config, logger, prisma} from '../service.js';
import {Token, Wallet} from '@prisma/client';
import {ContractAbi, Web3} from 'web3';
import {Decimal} from 'decimal.js';
import {CodeError} from '../util.js';

export class WalletController {
  web3: Web3;
  instance: Wallet;

  constructor(wallet: Wallet) {
    this.instance = wallet;
    this.web3 = new Web3(config.node.url);
  }

  async sendToken(content: SendData) {
    const token = await prisma.token.findUniqueOrThrow({
      where: {
        id: content.tokenID,
      },
    });
    const tokenBalance = await this.tokenBalance(token, this.instance.address);
    if (new Decimal(content.amount).lessThan(tokenBalance)) {
      logger.error(`Balance less amount. amount:${content.amount.toString()} balance:${tokenBalance}`);
      throw new CodeError(10007);
    }

    const contract = new this.web3.eth.Contract(token.abi as unknown as ContractAbi, token.address);
    const decimals = await contract.methods.decimals().call();
    if (!content.gasPrice) {
      content.gasPrice = await this.web3.eth.getGasPrice();
    }
    const gasLimit = config.node.tokenGasLimit;
    await this.checkFee(content.gasPrice, gasLimit);

    const tokenAmount = new Decimal(content.amount).mul(10).pow(decimals as unknown as number);
    const data = contract.methods.transfer(content.address, tokenAmount).encodeABI();
    const nonce = await this.web3.eth.getTransactionCount(this.instance.address);

    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        to: token.address,
        value: 0,
        gas: gasLimit,
        gasPrice: content.gasPrice,
        nonce: nonce,
        chainId: 1,
        data: data,
      },
      this.instance.privateKey,
    );

    const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return result.transactionHash;
  }

  async sendETH(content: SendData) {
    if (!content.gasPrice) {
      content.gasPrice = await this.web3.eth.getGasPrice();
    }
    const gasLimit = config.node.ethGasLimit;
    const weiAmount = this.web3.utils.toWei(content.amount, 'ether');
    await this.checkFee(content.gasPrice, gasLimit, weiAmount);

    const nonce = await this.web3.eth.getTransactionCount(this.instance.address);
    const signedTx = await this.web3.eth.accounts.signTransaction(
      {
        to: content.address,
        value: weiAmount,
        gas: gasLimit,
        gasPrice: content.gasPrice,
        nonce: nonce,
        chainId: 1,
      },
      this.instance.privateKey,
    );
    const result = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    return result.transactionHash;
  }
  async send(data: SendData) {
    // eslint-disable-next-line
    if (!this.web3.utils.checkAddressCheckSum(data.address)) {
      data.address = this.web3.utils.toChecksumAddress(data.address);
    }
    if (data.tokenID) {
      return await this.sendToken(data);
    } else {
      return await this.sendETH(data);
    }
  }

  async checkFee(gasPrice: number | bigint, gasLimit: number, weiAmount = '0') {
    const weiBalance = await this.web3.eth.getBalance(this.instance.address);
    const balance = this.web3.utils.fromWei(weiBalance, 'ether');

    const feeAmount = new Decimal(gasPrice as number).mul(gasLimit);

    const weiRequired = feeAmount.plus(weiAmount);
    const required = this.web3.utils.fromWei(weiRequired.toString(), 'ether');
    if (weiRequired.greaterThan(weiBalance as unknown as number)) {
      logger.error(`Insufficient funds required: ${required} balance: ${balance}`);
      throw new CodeError(10007);
    }
  }

  async tokenBalance(token: Token, walletAddress: string) {
    const contract = new this.web3.eth.Contract(token.abi as unknown as ContractAbi, token.address);
    const result = await contract.methods.balanceOf(walletAddress).call();
    const decimals = await contract.methods.decimals().call();
    return new Decimal(result as unknown as number)
      .div(10)
      .mul(decimals as unknown as number)
      .toString();
  }

  async balance(address: string) {
    const weiBalance = await this.web3.eth.getBalance(address);
    return this.web3.utils.fromWei(weiBalance, 'ether');
  }

  async walletBalance(): Promise<WalletBalanceInfo> {
    const tokens = await prisma.token.findMany();
    const tokenData = [];
    for (const token of tokens) {
      tokenData.push({
        id: token.id,
        coin: token.coin,
        balance: await this.tokenBalance(token, this.instance.address),
      });
    }
    return {
      id: this.instance.id,
      address: this.instance.address,
      mnemonic: this.instance.mnemonic,
      path: this.instance.path,
      balance: await this.balance(this.instance.address),
      tokens: tokenData,
    };
  }

  static async create(mnemonic: string | null): Promise<Wallet> {
    let walletData: HDNodeWallet;
    if (!mnemonic) {
      walletData = WalletEthers.createRandom();
    } else {
      if (!ethers.Mnemonic.isValidMnemonic(mnemonic)) {
        throw new CodeError(10008);
      }
      walletData = ethers.HDNodeWallet.fromPhrase(mnemonic);
    }
    if (!walletData.mnemonic || !walletData.path) {
      throw new CodeError(10008);
    }
    let wallet = await prisma.wallet.findFirst({where: {mnemonic: walletData.mnemonic.phrase}});
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          mnemonic: walletData.mnemonic.phrase,
          address: walletData.address,
          path: walletData.path,
          privateKey: walletData.privateKey,
        },
      });
    }
    return wallet;
  }
}
