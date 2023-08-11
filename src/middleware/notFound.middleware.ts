import { NextFunction, Request, Response } from "express";

const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const err : Error & { status?: number } = new Error('Not Found');
    err.status = 404;
    next(err);
}

export default notFoundMiddleware;