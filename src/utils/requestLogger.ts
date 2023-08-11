import morgan from 'morgan'
import logger from './logger'

const stream = {
  write: (message: string) => logger.info(message.trim()),
}
const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms', { stream })

export default requestLogger
