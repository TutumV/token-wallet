export interface SendData {
  address: string;
  amount: number;
  tokenID?: number;
  gasPrice?: bigint | number;
}

interface TokenBalanceInfo {
  id: number;
  coin: string;
  balance: string;
}

export interface WalletBalanceInfo {
  id: number;
  address: string;
  mnemonic: string;
  path: string;
  balance: string;
  tokens: TokenBalanceInfo[];
}
