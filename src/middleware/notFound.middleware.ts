import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const err : Error & { status?: number } = new AppError('Not Found', 404);
    next(err);
}

export default notFoundMiddleware;