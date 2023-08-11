import { NextFunction, Request, Response } from 'express'
import { validationResult } from 'express-validator'
import logger from '../../utils/logger';

const handleValidationErrors = (req : Request, res : Response, next : NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    logger.error(`Validation Errors:`, errors.array());
    return res.status(400).json({ status: 'error', errors: errors.array() })
  } else {
    next()
  }
}

export default handleValidationErrors