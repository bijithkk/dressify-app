import express from 'express';
import {placeOrder,placeOrderStripe,allOrders,userOrders,updateStatus,verifyStripe} from './../controllers/orderController.js';
import adminAuth from './../middleware/adminAuth.js';
import authUser from './../middleware/auth.js';
import {protect} from '../controllers/userController.js';


const orderRouter = express.Router();

// admin features
orderRouter.post('/list',adminAuth,allOrders);
orderRouter.post('/status',adminAuth,updateStatus);

// payment features
orderRouter.post('/place',protect,placeOrder);
orderRouter.post('/stripe',protect,placeOrderStripe);

// user features
orderRouter.post('/userorders',protect,userOrders);

// verify payment
orderRouter.post('/verifyStripe',protect,verifyStripe);

export default orderRouter;