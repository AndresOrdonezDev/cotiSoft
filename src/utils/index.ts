import jwt from 'jsonwebtoken';

type UserPayload = {
    id: number
}

export const generateJWT = (payload: UserPayload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '5d'
    })
    return token
}