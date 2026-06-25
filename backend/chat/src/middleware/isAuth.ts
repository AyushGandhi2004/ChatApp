import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface IUser extends Document {
    _id : string;
    name : string;
    email : string;
}

export interface AuthenticatedRequest extends Request {
    user? : IUser | null;
}

export const isAuth = async (req : Request, res : Response, next : NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({message : "Unauthorized"});
            return;
        }

        const token = authHeader.split(" ")[1];
        const jwt_secret = process.env.JWT_SECRET;
        const decodedToken = jwt.verify(token as string, jwt_secret as string) as { user : IUser};
        
        if(!decodedToken || !decodedToken.user){
            res.status(401).json({ message : "Unauthorized" });
            return;
        }
        
        (req as Request & { user: any }).user = decodedToken.user;
        next();

    }catch(err){
        res.status(500).json({ message : `Internal Server Error : ${err}` });
    }
};

export default isAuth;