import config from "config";
import {jwtMakeToken} from "../lib/jwt-helpers/jwtMakeToken.js";
import authService from "../services/auth-service.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";

const login = async (req, res) => {
    const {login, password} = req.body
    const {accessToken, refreshToken} = await authService.login(login, password);

    res.cookie('refresh_token', refreshToken, {
        httpOnly: true
    })

    res.json({
        "access_token": accessToken
    });
}

const checkAuth = async (req, res) => {
    res.sendStatus(200)
}

export default {
    login: ctrlWrapper(login),
    checkAuth: ctrlWrapper(checkAuth)
}
