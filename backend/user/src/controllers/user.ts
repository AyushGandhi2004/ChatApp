import TryCatch from "../config/trycatch.js";
import { redisClient } from "../index.js";
import { publishToQueue } from "../config/rabbitmq.js";
import {User} from "../model/User.js";
import {generateToken} from "../config/generateToken.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";


export const loginUser = TryCatch(async (req, res) => {
    const {email} = req.body;
    if(!email){
        return res.status(400).json({message : "Email is required"});
    }
    const rateLimitKey = `otp:ratelimit:${email}`;
    const rateLimit = await redisClient.get(rateLimitKey);
    if(rateLimit){
        return res.status(429).json({message : "Too many requests. Please try again later."});
        return;
    }

    const otp = Math.floor(100000 + Math.random()*900000).toString();
    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, otp, {EX : 300});
    await redisClient.set(rateLimitKey, "true", {EX : 60});

    const message = {
        to : email,
        subject : "Your OTP for login",
        body : `Your OTP for login is ${otp}. It is valid for 5 minutes.`
    };

    await publishToQueue("send-otp", message);
    res.status(200).json({message : "OTP sent to your email"});
})


export const verifyUser = TryCatch(async(req,res) => {
    const {email, otp} = req.body;
    if(!email || !otp){
        return res.status(400).json({message : "Email and OTP are required"});
    }
    const otpKey = `otp:${email}`;
    const storedOtp = await redisClient.get(otpKey);
    if(!storedOtp || storedOtp!==otp){
        return res.status(400).json({message : "Invalid OTP"});
    }

    await redisClient.del(otpKey);
    let user = await User.findOne({email});
    if(!user){
        const name = email.split("@")[0];
        user = await User.create({email, name});
    }

    const token = generateToken(user);
    res.json({
        message : "User Verified",
        user,
        token
    });
})


export const myProfile = TryCatch(async(req : AuthenticatedRequest,res) => {
    const user = req.user;
    if(!user){
        return res.status(401).json({message : "Unauthorized"});
    }

    res.json(user);
})


export const updateName = TryCatch(async(req : AuthenticatedRequest,res) => {
    const user = await User.findById(req.user?._id);
    if(!user){
        return res.status(404).json({message: "User Not Found"});
    }

    user.name = req.body.name;
    await user.save();

    const token = generateToken(user);

    res.json({
        message : "Name updated successfully",
        user,
        token
    });

})


export const getAllUsers = TryCatch(async(req : AuthenticatedRequest,res) => {
    const users = await User.find();

    res.json(users);
});


export const getUserById = TryCatch(async(req : AuthenticatedRequest,res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if(!user){
        return res.status(404).json({message: "User Not Found"});
    }
    res.json(user);
})