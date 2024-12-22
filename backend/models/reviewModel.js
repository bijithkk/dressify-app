import mongoose from "mongoose";
import productModel from "./productModel.js";

const reviewSchema = new mongoose.Schema(
  {
    review: { type: String },
    rating: { type: Number },
    createdAt: { type: Date, default: Date.now() },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "product",
      require: [true, "Review must belong to a tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      require: [true, "review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });
 
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });

  next();
});
 
reviewSchema.statics.calcAverageRatings = async function (productId) {
  console.log("Calculating average ratings for product:", productId);
  const stats = await this.aggregate([
    {
      $match: { product: new mongoose.Types.ObjectId(productId) },
    },
    {
      $group: {
        _id: "$product",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  console.log("Aggregation results:", stats);

  if(stats.length > 0) {
    const updatedProduct = await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: stats[0].avgRating.toFixed(1),
      ratingsQuantity: stats[0].nRating,
  },{ new:true })
  console.log("Updated product:", updatedProduct);
  } else {
    const resetProduct = await productModel.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantity: 0,
  }, { new: true })
  console.log("Reset product to default values:", resetProduct);
  }  
};

reviewSchema.post('save', async function(){
    // this point to current review
    console.log("Post-save middleware triggered for product:", this.product);
    await this.constructor.calcAverageRatings(this.product);
})

const reviewModel = mongoose.model.review || mongoose.model("review", reviewSchema);

export default reviewModel;
 