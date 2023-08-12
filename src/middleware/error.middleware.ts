import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    logger.error(`[${req.method} ${req.url}] - ${err.message}`);


    res.status(status).json({
        status: 'error',
        message: message
    });
};

export default errorMiddleware;