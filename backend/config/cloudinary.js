// import {vs as cloudinary} from 'cloudinary';
import pkg from 'cloudinary';
const cloudinary = pkg.v2;

const connectCloudinary = async () => {

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_SECRET_KEY
    })

}

export default connectCloudinary;