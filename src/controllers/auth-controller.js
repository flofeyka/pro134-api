import config from "config";
import {jwtMakeToken} from "../lib/jwt-helpers/jwtMakeToken.js";

const jwtConfig = config.get('jwt')

export const login = async (req, res) => {
    const body = req.body;

    const adminData = config.get('admin')
    if (
        (adminData.login !== body.login) ||
        (adminData.password !== body.password)
    ) {
        res.status(401).json({
            "message": "неверный логин или пароль"
        })
        return
    }

    const token_id = Math.trunc(Math.random() * 10 ** 8)
    const accessToken = jwtMakeToken({id: token_id}, jwtConfig.access_expired)
    const refreshToken = jwtMakeToken({id: token_id}, jwtConfig.refresh_expired)

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true
    })

    res.json({
        "access_token": accessToken
    });
}

export const checkAuth = async (req, res) => {
    res.sendStatus(200)
}
