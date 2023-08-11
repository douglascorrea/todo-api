import { PrismaClient } from '@prisma/client'
import logger from '../utils/logger'

/*
 * This function is used to get the PrismaClient instance.
 * There is a need to create 2 separate function depending on the environment,
 * because the PrismaClient instance receives different log configurations in each environment
 * and if we only split the prismaOptions into 2 different objects, there will be a typescript error
 * as described here: https://github.com/prisma/prisma/discussions/3541
 */

export const getPrismaClient = (): PrismaClient => {
  if (process.env.NODE_ENV === 'production') {
    return getPrismaClientForProduction()
  } else {
    return getPrismaClientForDevelopment()
  }
}

const getPrismaClientForProduction = (): PrismaClient => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'warn',
      },
      {
        emit: 'event',
        level: 'info',
      },
    ],
  })
  prisma.$on('error', (e) => {
    logger.error(`Prisma message ${e.message}`)
    logger.error(`Prisma target ${e.target}`)
    logger.error(`Prisma timestamp ${e.timestamp}`)
  })
  prisma.$on('warn', (e) => {
    logger.warn(`Prisma message ${e.message}`)
    logger.warn(`Prisma target ${e.target}`)
    logger.warn(`Prisma timestamp ${e.timestamp}`)
  })
  prisma.$on('info', (e) => {
    logger.info(`Prisma message ${e.message}`)
    logger.info(`Prisma target ${e.target}`)
    logger.info(`Prisma timestamp ${e.timestamp}`)
  })
  return prisma
}

const getPrismaClientForDevelopment = (): PrismaClient => {
  const prisma = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
      {
        emit: 'event',
        level: 'query',
      },
    ],
  })
  prisma.$on('error', (e) => {
    logger.error(`Prisma message ${e.message}`)
    logger.error(`Prisma target ${e.target}`)
    logger.error(`Prisma timestamp ${e.timestamp}`)
  })
  prisma.$on('warn', (e) => {
    logger.warn(`Prisma message ${e.message}`)
    logger.warn(`Prisma target ${e.target}`)
    logger.warn(`Prisma timestamp ${e.timestamp}`)
  })
  prisma.$on('info', (e) => {
    logger.info(`Prisma message ${e.message}`)
    logger.info(`Prisma target ${e.target}`)
    logger.info(`Prisma timestamp ${e.timestamp}`)
  })
  prisma.$on('query', (e) => {
    logger.debug(`Query: ${e.query}`)
    logger.debug('Params: ' + e.params)
    logger.debug(`Duration: ${e.duration}ms`)
  })
  return prisma
}
const prisma = getPrismaClient()
export default prisma
