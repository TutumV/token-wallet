import zod from 'zod';

export const createTokenSchema = zod.object({
  address: zod.string().trim(),
  coin: zod.string().trim(),
  abi: zod.string().array(),
});

export const tokenIdSchema = zod.object({
  id: zod.coerce.number().positive().int(),
});
