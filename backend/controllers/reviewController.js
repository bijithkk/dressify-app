import reviewModel from "../models/reviewModel.js";
import productModel from "../models/productModel.js";

const createReview = async (req, res) => {
  try {
    if(!req.body.product) req.body.product = req.params.productId;
    if(!req.body.user) req.body.user = req.body.userId;

    const existingReview = await reviewModel.findOne({
      user: req.body.user,
      product: req.body.product,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already added a review for this product.",
      });
    }
 
    const newReview = new reviewModel({
      review: req.body.userReview,
      rating: req.body.rating,
      product: req.body.product,
      user: req.body.user 
    });

    await newReview.save();

    await reviewModel.calcAverageRatings(req.body.product);

    const updatedProduct = await productModel.findById(req.body.product); 
    console.log("Updated product after review:", updatedProduct);

    const populateReview = await newReview.populate('user','name photo');

    res.json({
      success: true,
      newReview: populateReview,
      updatedRatings: {
        ratingsAverage: updatedProduct.ratingsAverage,
        ratingsQuantity: updatedProduct.ratingsQuantity,
      },
      message: "Review added..!!",
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllReview = async (req,res) => {
    try {
        console.log(req.params.productId); 
        let filter = {};
        if(req.params.productId) filter = {product: req.params.productId};
        const reviews = await reviewModel.find(filter);
        
        
        console.log(reviews);

        res.json({
            success: true,
            reviews
        })
    } catch (error) {
        
    }
}

export { createReview,getAllReview };
