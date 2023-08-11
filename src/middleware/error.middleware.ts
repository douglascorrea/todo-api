import { Request, Response, NextFunction } from 'express';

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    // Log the error (this is where the logger utility comes in)
    console.error(err);  // Replace this with your logger

    res.status(status).json({
        status: 'error',
        message: message
    });
};

export default errorMiddleware;