import {Router} from 'express';
import {TokenModel} from '../models/token.js';
import {TokenValidator} from '../validators/token.js';

const TokenRouter = Router();

/**
 * @openapi
 * /token:
 *   get:
 *     summary: Token List View
 *     operationId: token_view_get
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
 *                   coin:
 *                     type: string
 *   post:
 *     summary: Create Token View
 *     operationId: create_token_view_post
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *               coin:
 *                 type: string
 *               abi:
 *                 type: array
 *                 items:
 *                   type: object
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
 *                 abi:
 *                   type: array
 *                   items:
 *                     type: object
 *                 address:
 *                   type: string
 *                 coin:
 *                   type: string
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       '400':
 *         description: Any Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
TokenRouter.route('/')
  .get(async (req, res) => {
    const result = await TokenModel.findAll(
      {attributes: ['id', 'address', 'coin']},
    );
    return res.send(result);
  })
  .post(async (req, res) => {
    try {
      const {address, coin, abi} = req.body;
      TokenValidator.createValidate(address, coin, abi);
      const [instance] = await TokenModel.findOrCreate({
        where: {coin},
        defaults: {
          abi,
          address,
        },
      });
      return res.status(201).send(instance);
    } catch (err) {
      return res.status(400).send({error: err.message});
    }
  });

/**
 * @openapi
 * /token/detail/{id}:
 *  delete:
 *    summary: Token Delete
 *    operationId: token_detail_view_delete
 *    parameters:
 *      - name: id
 *        in: path
 *        required: true
 *    responses:
 *      '204':
 *        description: Successful Response
 *  get:
 *     summary: Token Detail
 *     operationId: token_detail_view_get
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
 *                 abi:
 *                   type: array
 *                   items:
 *                     type: object
 *                 coin:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       '404':
 *         description: Token Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                  type: string
 */
TokenRouter.route('/detail/:id')
  .get(async (req, res) => {
    const instance = await TokenModel.findByPk(req.params.id);
    if (!instance) {
      return res.status(404).send({error: 'Token Not Found'});
    }
    return res.send(instance);
  })
  .delete(async (req, res) => {
    await TokenModel.destroy({where: {id: req.params.id}});
    return res.status(204).send();
  });

export {TokenRouter};
