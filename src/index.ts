import dotenv from 'dotenv'
import app from './server'
import logger from './utils/logger'

// initialize dotenv configuration
dotenv.config()

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    logger.info(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode.`);
})
