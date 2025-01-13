import zod from 'zod';

export const sendSchema = zod.object({
  address: zod.string().trim(),
  amount: zod.number().min(0),
  tokenID: zod.number().optional(),
  weiGasPrice: zod.number().min(0).optional(),
  id: zod.coerce.number().positive().int(),
});

export const walletIdSchema = zod.object({
  id: zod.coerce.number().positive().int(),
});

export const walletCreateSchema = zod.object({
  mnemonic: zod.string().trim(),
});
