import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {type:String,require:true},
    description: {type:String,require:true},
    price: {type:Number,require:true},
    image: {type:Array,require:true},
    category: {type:String,require:true},
    subCategory: {type:String,require:true},
    sizes: {type:Array,require:true},
    ratingsAverage: { type: Number, default: 4.5, min: [1,'rating must be above 1.0'], max: [5,'Rating must be below 5.0'] },
    ratingsQuantity: { type: Number, default:0 },
    bestseller: {type:Boolean},
    date: {type:Number,require:true},    
},{
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
 
productSchema.virtual('reviews', {
    ref: 'review',
    foreignField: 'product',
    localField: '_id'
})

const productModel = mongoose.models.product || mongoose.model('product',productSchema);

export default productModel;