import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloudinary_cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
if(!cloudinary_cloud_name){
    throw new Error("CLOUDINARY_CLOUD_NAME is not defined in the environment variables");
}

const cloudinary_api_key = process.env.CLOUDINARY_API_KEY;
if(!cloudinary_api_key){
    throw new Error("CLOUDINARY_API_KEY is not defined in the environment variables");
}

const cloudinary_api_secret = process.env.CLOUDINARY_API_SECRET;
if(!cloudinary_api_secret){
    throw new Error("CLOUDINARY_API_SECRET is not defined in the environment variables");
}

cloudinary.config({
    cloud_name : cloudinary_cloud_name,
    api_key : cloudinary_api_key,
    api_secret : cloudinary_api_secret
})

export default cloudinary;