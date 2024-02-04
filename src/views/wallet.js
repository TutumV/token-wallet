import {Router} from 'express';
import {WalletModel} from '../models/wallet.js';
import {WalletController} from '../controllers/wallet.js';
import {walletValidator, createWalletValidator} from '../validators/wallet.js';
import {ethers} from 'ethers';

const WalletRouter = Router();

/**
 * @openapi
 * /wallet:
 *   post:
 *     summary: Create Wallet View
 *     operationId: create_wallet_view_post
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               mnemonic:
 *                 anyOf:
 *                   - type: string
 *                   - type: 'null'
 *     responses:
 *       '201':
 *         description: Successful Response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 address:
 *                   type: string
 *                 privateKey:
 *                   type: string
 *                 mnemonic:
 *                   type: string
 *                 path:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Any Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                error:
 *                  type: string
 *   get:
 *     summary: Wallets List View
 *     operationId: wallets_view_get
 *     responses:
 *       '200':
 *         description: Successful Response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   address:
 *                     type: string
 *                   privateKey:
 *                     type: string
 *                   mnemonic:
 *                     type: string
 *                   path:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 */
WalletRouter.route('/')
  .get(async (req, res) => {
    const result = await WalletModel.findAll();
    return res.send(result);
  })
  .post(async (req, res) => {
    try {
      const data = await createWalletValidator.validateAsync(req.body);
      if (data.mnemonic && !ethers.Mnemonic.isValidMnemonic(data.mnemonic)) {
        return res.status(400).send({error: 'Invalid Mnemonic'});
      }
      const instance = await WalletController.create(data.mnemonic);
      return res.status(201).send(instance);
    } catch (err) {
      return res.status(400).send({error: err.message});
    }
  });

/**
 * @openapi
 * /wallet/detail/{id}:
 *   post:
 *     summary: Send From Wallet
 *     operationId: wallet_send_view_post
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               amount:
 *                 type: string
 *               weiGasPrice:
 *                 type: integer
 *               tokenID:
 *                 anyOf:
 *                   - type: integer
 *                   - type: 'null'
 *     responses:
 *       '201':
 *         description: Successful Response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 txID:
 *                   type: string
 *       '404':
 *         description: Wallet not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '400':
 *         description: Any Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 *
 *   get:
 *     summary: Wallet Detail
 *     operationId: wallet_detail_view_get
 *     parameters:
 *      - name: id
 *        in: path
 *        required: true
 *     responses:
 *       '200':
 *         description: Successful Response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 address:
 *                   type: string
 *                 mnemonic:
 *                   type: string
 *                 path:
 *                   type: string
 *                 balance:
 *                   type: string
 *                 tokens:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       coin:
 *                         type: string
 *                       balance:
 *                         type: string
 *       '404':
 *         description: Wallet Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                  type: string
 *       '400':
 *         description: Any Error
 *         content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                error:
 *                  type: string
 */
WalletRouter.route('/detail/:id')
  .get(async (req, res) => {
    try {
      const instance = await WalletModel.findByPk(req.params.id);
      if (!instance) {
        return res.status(404).send({error: 'Wallet not found'});
      }
      const walletBalance = await new WalletController(
        instance,
      ).walletBalance();
      return res.send(walletBalance);
    } catch (err) {
      res.status(400).send({error: err.message});
    }
  })
  .post(async (req, res) => {
    try {
      const data = await walletValidator.validateAsync(req.body);
      if (!ethers.isAddress(data.address)) {
        return res.status(400).send({error: 'Not valid address'});
      }
      const instance = await WalletModel.findByPk(req.params.id);
      if (!instance) {
        return res.status(404).send({error: 'Wallet not found'});
      }

      const result = await new WalletController(
        instance,
      ).send(data.address, data.amount.toString(), data.tokenID, data.weiGasPrice.toString());
      return res.status(201).send(result);
    } catch (err) {
      return res.status(400).send({error: err.message});
    }
  });


export {WalletRouter};
