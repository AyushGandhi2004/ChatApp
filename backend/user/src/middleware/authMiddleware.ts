import type { Request, Response, NextFunction } from 'express';
import type { IUser } from '../model/User.js';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
    user?: IUser | null;
}

export const isAuth = (req : Request, res : Response, next : NextFunction): void => {
    try{
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')){
            res.status(401).json({ message : "Unauthorized" });
            return;
        }

        const token = authHeader.split(' ')[1];
        const jwt_secret = process.env.JWT_SECRET;
        const decodedToken = jwt.verify(token as string, jwt_secret as string) as { user : IUser};

        if(!decodedToken || !decodedToken.user){
            res.status(401).json({ message : "Unauthorized" });
            return;
        }

        (req as Request & { user: any }).user = decodedToken.user;
        next();

    }catch(err){
        res.status(401).json({ message : "Please Login" });
    }
}