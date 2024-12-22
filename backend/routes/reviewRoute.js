import express from 'express';
import { createReview,getAllReview } from '../controllers/reviewController.js';
import { protect } from '../controllers/userController.js';

const reviewRouter = express.Router({ mergeParams: true });

reviewRouter.route('/').get(getAllReview).post(protect,createReview);

export default reviewRouter;   