import {Router} from 'express';
import {walletCreateHandler, walletListHandler, walletDetailHandler, walletSendHandler} from './wallet.handler.js';
import {tokenCreateHandler, tokenListHandler, tokenDeleteHandler, tokenDetailHandler} from './token.handler.js';

const routerV1 = Router();

routerV1.get('/token', tokenListHandler);
routerV1.post('/token', tokenCreateHandler);
routerV1.get('/token/:id', tokenDetailHandler);
routerV1.delete('/token/:id', tokenDeleteHandler);

routerV1.get('/wallet', walletListHandler);
routerV1.post('/wallet', walletCreateHandler);
routerV1.get('/wallet/:id', walletDetailHandler);
routerV1.post('/wallet/:id', walletSendHandler);

export default routerV1;
