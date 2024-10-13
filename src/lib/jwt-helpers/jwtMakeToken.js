import jwt from "jsonwebtoken";
import config from "config";

const jwtSecret = Buffer.from(config.get('jwt.secret'), "base64")

export const jwtMakeToken = (payload, expiresIn) => {
    return  jwt.sign(payload, jwtSecret, {
        algorithm: 'HS256',
        expiresIn: expiresIn,
    })
}

export const jwtGetPayload = (token) => {
    return jwt.decode(token, jwtSecret)
}