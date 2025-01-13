import {Router} from 'express';
import routerV1 from './v1/index.js';

const router = Router();

router.use('/v1', routerV1);

export default router;
