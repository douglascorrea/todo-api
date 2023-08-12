import { body, param} from 'express-validator'
import prisma from '../../config/database'

export const userValidations = (method: string) => {
    const create = [
        body('name')
            .isString()
            .withMessage('Name must be a string')
            .isLength({ min: 3 }),
        body('email')
            .custom(async (value) => {
                if(typeof value !== 'string') {
                    throw new Error('Email must be a string')
                }
                const user = await prisma.user.findUnique({
                    where: {
                        email: value,
                    },
                })
                if (user) {
                    throw new Error('Email already in use')
                }
            })
            .isEmail()
            .withMessage('Email must be a valid email')
    ]
    
    switch (method) {
        case 'create':
            return create
        default:
            return []
    }
}