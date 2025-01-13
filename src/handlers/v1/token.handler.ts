import {Request, Response} from 'express';
import {prisma} from '../../service.js';
import {createTokenSchema, tokenIdSchema} from '../../schemas/token.schema.js';

export const tokenCreateHandler = async (req: Request, res: Response) => {
  try {
    const data = await createTokenSchema.parseAsync(req.params);
    const instance = await prisma.token.create({data});
    res.sendRes(10001, instance);
    return;
  } catch (e) {
    res.catchError(e);
  }
};

export const tokenListHandler = async (req: Request, res: Response) => {
  try {
    const result = await prisma.token.findMany();
    res.sendRes(10000, result);
    return;
  } catch (e) {
    res.catchError(e);
  }
};

export const tokenDetailHandler = async (req: Request, res: Response) => {
  try {
    const params = await tokenIdSchema.parseAsync(req.params);
    const result = await prisma.token.findUniqueOrThrow({where: {id: params.id}});
    res.sendRes(10000, result);
    return;
  } catch (e) {
    res.catchError(e);
  }
};

export const tokenDeleteHandler = async (req: Request, res: Response) => {
  try {
    const params = await tokenIdSchema.parseAsync(req.params);
    await prisma.token.findUniqueOrThrow({where: {id: params.id}});
    await prisma.token.delete({where: {id: params.id}});
    res.sendRes(10000);
    return;
  } catch (e) {
    res.catchError(e);
  }
};
