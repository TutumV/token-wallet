import joi from 'joi';


export const createTokenValidator = joi.object({
  address: joi.string().required(),
  coin: joi.string().required(),
  abi: joi.array().required(),
});
