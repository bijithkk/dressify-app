/* eslint-disable */
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import RelatedProducts from "../components/RelatedProducts";
import axios from "axios";
import { toast } from "react-toastify";


import Title from "../components/Title";
import Spinner from "../components/Spinner";
import { TiStarFullOutline } from "react-icons/ti";

const star = [1,2,3,4,5];
 
const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart,backendUrl,token } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [reviews,setReviews] = useState([]);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [rating,setRating] = useState(null);
  const [rateColor,setRateColor] = useState(null);
  const [userReview,setUserReview] = useState("");
  const [isLoading,setIsLoading] = useState(false); 

  const fetchProductData = async() => {
    try {
      setIsLoading(true);
      const response = await axios.get(backendUrl + `/api/product/${productId}/single`);
      if(response.data.success){
        console.log(response.data.product);
        setProductData(response.data.product);
        setImage(response.data.product.image[0]);
        setReviews(response.data.product.reviews);
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load product data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }
  console.log(productData);
  
  const uploadReview = async () => {
    const toastId = toast.loading("Review Uploading...");
    try {
      const response = await axios.post(backendUrl + `/api/product/${productId}/reviews`,{userReview,rating},{headers:{Authorization: `Bearer ${token}`}});
      if(response.data.success){
        console.log(response.data.newReview);
        setReviews((prevReviews) => [...prevReviews, response.data.newReview]);
        
        setProductData((prevData) => ({
          ...prevData,
          ratingsAverage: response.data.updatedRatings.ratingsAverage,
          ratingsQuantity: response.data.updatedRatings.ratingsQuantity,
        }));

        toast.update(toastId, {
          render: response.data.message,
          type: "success",
          isLoading: false,
          autoClose: 1000,
        });
      }
    } catch (error) {
      console.log(error);

      if (error.response && error.response.status === 400) {
        toast.update(toastId, {
          render: error.response.data.message,
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      } else {
        toast.update(toastId, {
          render: "Failed to upload review. Please try again.",
          type: "error",
          isLoading: false,
          autoClose: 2000,
        });
      }
    }
  }
  
  useEffect(() => {
    fetchProductData();
  }, [productId, products]);
  
  if (isLoading) {
    return (
      <Spinner/>
    );
  }

  if (!productData) {
    return (
      <div className="error-message">
        Product not found.
      </div>
    );
  }

  return (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/*--------- Product Data--------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/*--------- Product images--------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img src={image} className="w-full h-auto" alt="" />
          </div>
        </div>

        {/* ---------Product Info--------- */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
          {star.map((item,index) =>
              <img key={index} src={productData.ratingsAverage >= item ? assets.star_icon : assets.star_dull_icon } alt="" className="w-3 5" />
              )}
            <p className="pl-2">({productData.ratingsQuantity})</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price} 
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-300 ${
                    item === size ? "border-orange-500" : ""
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/*-------------Description & Review Section------------- */}
      <div className="my-24">
        <div className="text-center text-3xl py-2">
          <Title text1={`RE`} text2={`VIEWS`} />
        </div>
        {token && <div className="flex justify-center gap-2 mt-6">
          <input
            type="text"
            placeholder="Write Review"
            className="w-1/3 px-3 py-2 border border-gray-800"
            required
            onChange={(e) => setUserReview(e.target.value)}
          />
          <button
            onClick={uploadReview}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            Submit
          </button>
        </div> }

        {token && <div className="flex justify-center space-x-1 mt-6">
        {[...Array(5)].map((star,index) => {
          const currentState = index + 1;
          return (
              <label key={index}>
                <input type="radio" className="hidden" name="rate" value={currentState} onClick={() => setRating(currentState)}/>

                <TiStarFullOutline size={30} color={currentState <= (rateColor || rating) ? "yellow" : "grey"}/>
              </label>
          )
        })}
        </div>}
        
        {/* <!-- Container for the cards --> */}
        {reviews.length > 0 && <div className="grid md:grid-cols-2 gap-10 max-w-6xl max-md:gap-16 max-md:max-w-lg mx-auto mt-20 h-80 overflow-y-auto pt-8">
          {/* <!-- Testimonial Card 1 --> */}
          {reviews.map((review,index) => <div key={index} className="w-full p-6 rounded-lg mx-auto shadow-[0_4px_14px_-6px_rgba(93,96,127,0.4)] bg-white relative">
            <img
              src={review.user.photo}
              className="w-14 h-14 rounded-full absolute right-0 left-0 mx-auto -top-7"
            />
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-800 leading-relaxed">
              {review.review} 
              </p>
            </div>
            <div className="flex justify-center space-x-1 mt-6">
              {star.map((item,index) =>
              <img key={index} src={review.rating >= item ? assets.star_icon : assets.star_dull_icon } alt="" className="w-3 5" />
              )}
              {/* <!-- Add more stars here --> */}
            </div>
            <div className="mt-6 text-center">
              <h4 className="text-sm whitespace-nowrap font-bold">{review.user.name}</h4>
            </div>
          </div>)}
          {/* <!-- Add more Testimonial Cards here --> */}
        </div>}
      </div>
      {/*-----------display related products------------- */}
      <RelatedProducts
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  )
};

export default Product;
