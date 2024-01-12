import joi from 'joi';

export const walletValidator = joi.object({
  address: joi.string().trim().required(),
  amount: joi.number().min(0).required(),
  tokenID: joi.number(),
  weiGasPrice: joi.number().min(0),
});

export const createWalletValidator = joi.object({
  mnemonic: joi.string(),
});
