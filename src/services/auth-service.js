import config from "config";
import { jwtMakeToken } from "../lib/jwt-helpers/jwtMakeToken.js";

const jwtConfig = config.get('jwt')

export default new class authService {
  async login(login, password) {
    const adminData = config.get("admin");
    if (
      adminData.login !== login ||
      adminData.password !== password
    ) {
      res.status(401).json({
        message: "неверный логин или пароль",
      });
      return;
    }

    const token_id = Math.trunc(Math.random() * 10 ** 8);
    const accessToken = jwtMakeToken(
      { id: token_id },
      jwtConfig.access_expired
    );
    const refreshToken = jwtMakeToken(
      { id: token_id },
      jwtConfig.refresh_expired
    );
    return {
      accessToken,
      refreshToken,
    };
  }
}
