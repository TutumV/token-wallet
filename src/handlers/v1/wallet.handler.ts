import {Request, Response} from 'express';
import {WalletController} from '../../controllers/wallet.controller.js';
import {sendSchema, walletCreateSchema, walletIdSchema} from '../../schemas/wallet.schema.js';
import {prisma} from '../../service.js';

export const walletCreateHandler = async (req: Request, res: Response) => {
  try {
    const data = await walletCreateSchema.parseAsync(req.params);
    const instance = await WalletController.create(data.mnemonic);
    res.sendRes(10001, instance);
    return;
  } catch (e) {
    res.catchError(e);
  }
};

export const walletListHandler = async (req: Request, res: Response) => {
  try {
    const result = await prisma.wallet.findMany();
    res.sendRes(10000, result);
    return;
  } catch (e) {
    res.catchError(e);
  }
};

export const walletDetailHandler = async (req: Request, res: Response) => {
  try {
    const params = await walletIdSchema.parseAsync(req.params);
    const wallet = await prisma.wallet.findUniqueOrThrow({where: {id: params.id}});
    const walletBalance = await new WalletController(wallet).walletBalance();
    res.sendRes(10000, walletBalance);
    return;
  } catch (e) {
    res.catchError(e);
  }
};

export const walletSendHandler = async (req: Request, res: Response) => {
  try {
    const data = await sendSchema.parseAsync({...req.body, ...req.params});
    const wallet = await prisma.wallet.findUniqueOrThrow({where: {id: data.id}});
    const instance = await new WalletController(wallet).send(data);
    res.sendRes(10000, {txID: instance});
    return;
  } catch (e) {
    res.catchError(e);
  }
};
