import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import logger from '../../utils/logger';
import AppError from '../../utils/appError';

const handleValidationErrors = (req : Request, res : Response, next : NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorWithStatus = errors.array().find(error => error.msg.hasOwnProperty('statusCode'))
    if (errorWithStatus) {
        const { statusCode, message } = errorWithStatus.msg
        throw new AppError(message, statusCode)
    }
    logger.error(`Validation Errors:`, errors.array());
    return res.status(400).json({ status: 'error', errors: errors.array() })
  } else {
    next()
  }
}

export default handleValidationErrors