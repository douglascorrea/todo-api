import { NextFunction, RequestHandler, Response, Request } from 'express'
import logger from './logger'

export function asyncHandler(fn: RequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      logger.error(`Error in handler: ${fn.name}`, {
        message: err.message,
        stack: err.stack,
      })
      next(err)
    })
  }
}
