import winston from 'winston'
import os from 'os'

// Determine log level based on the environment
let logLevel = 'info' // default
if (process.env.NODE_ENV === 'development') {
  logLevel = 'debug'
} else if (process.env.NODE_ENV === 'test') {
  // Don't log anything during tests since it's distracting
  logLevel = 'off'
} else if (process.env.NODE_ENV === 'production') {
  logLevel = 'warn'
}

const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level}: ${message}`
    })
  ),
  defaultMeta: {
    environment: process.env.NODE_ENV || 'development',
    serviceName: 'todo-api',
    serverName: os.hostname(),
  },
})

// If we're not in production, also log to the `console` with the format: `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}
if (process.env.NODE_ENV === 'production') {
  // If we're in production, log to the `error.log` and `combined.log` files
  logger.add(
    new winston.transports.File({ filename: 'log/error.log', level: 'error' })
  )
  logger.add(new winston.transports.File({ filename: 'log/combined.log' }))
}

export default logger
