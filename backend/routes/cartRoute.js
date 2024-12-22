import express from 'express';
import {addToCart,updateCart,getUserCart} from './../controllers/cartController.js';
import authUser from '../middleware/auth.js';
import {protect} from '../controllers/userController.js';

const cartRouter = express.Router();

cartRouter.post('/get',protect,getUserCart);
cartRouter.post('/add',protect,addToCart);
cartRouter.post('/update',protect,updateCart);

export default cartRouter;