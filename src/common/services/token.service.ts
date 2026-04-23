import jwt, { JwtPayload, Secret, SignOptions, VerifyOptions } from 'jsonwebtoken';


export const generateToken = ({ payload, secret_key, options = {} }: { payload: Object, secret_key: Secret, options?: SignOptions }): string => {
    return jwt.sign(payload, secret_key, options)
}

export const verifyToken = ({ token, secret_key, options = {} }: { token: string, secret_key: Secret, options?: VerifyOptions }): JwtPayload => {
    return jwt.verify(token, secret_key, options) as JwtPayload
}