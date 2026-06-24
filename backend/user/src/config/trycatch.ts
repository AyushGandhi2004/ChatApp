// import { type RequestHandler, type NextFunction, type Request, type Response } from "express";

// const TryCatch = (handler : RequestHandler) => {
//     return async (req : Request, res : Response, next : NextFunction) => {
//         try{
//             await handler(req, res, next);
//         }catch(err : any){
//             res.status(500).json({
//                 message : `Here :${err.message}` || "Internal Server Error"
//             })
//         }
//     };
// };

// export default TryCatch;





import type {
    Request,
    Response,
    NextFunction,
    RequestHandler
} from "express";

const TryCatch = (handler: RequestHandler): RequestHandler => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await handler(req, res, next);
        } catch (err: any) {
            res.status(500).json({
                message : `Here :${err.message}` || "Internal Server Error"
            })
        }
    };
};

export default TryCatch;