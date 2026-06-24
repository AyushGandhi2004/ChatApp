import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const jwt_secret = process.env.JWT_SECRET;
if(!jwt_secret){
    throw new Error("JWT_SECRET is required");
}

export const generateToken = (user:any) => {
    return jwt.sign({user}, jwt_secret , {expiresIn : "15d"});
}