import config from "config";
import jwt from "jsonwebtoken";
import { jwtMakeToken } from "../lib/jwt-helpers/jwtMakeToken.js";
import { logger } from "../lib/logger/logger.js";

const jwtConfig = config.get("jwt");

export const jwtMiddleware = (req, res, next) => {
  const secret = Buffer.from(jwtConfig.secret, "base64");
  const authHeader = req.headers.authorization;
  console.log(req.cookies);
  const refreshToken = req.cookies.refresh_token;

  try {
    if (!authHeader || !refreshToken) {
      throw new Error("token not provided");
    }

    const accessToken = authHeader.replace("Bearer ", "");
    let accessPayload, refreshPayload;

    jwt.verify(
      accessToken,
      secret,
      { algorithms: ["HS256"] },
      (err, decoded) => {
        if (err) {
          const now = Date.now();
          const tmp_decoded = jwt.decode(accessToken, secret);

          logger.info(tmp_decoded.exp);
          logger.info(now);

          throw err;
        }
        accessPayload = decoded;
      }
    );

    jwt.verify(
      refreshToken,
      secret,
      { algorithms: ["HS256"] },
      (err, decoded) => {
        ///TODO: если протух refresh token = 401
        if (err) {
          throw new Error("refresh token expired");
        }
        refreshPayload = decoded;
      }
    );

    if (accessPayload.id !== refreshPayload.id) {
      throw new Error("token id does not match");
    }
  } catch (e) {
    logger.error(e, "jwt error");
    const unauthorizedErrors = [
      "token not provided",
      "invalid token",
      "token id does not match",
      "refresh token expired",
    ];

    if (unauthorizedErrors.includes(e.message)) {
      return unauthorizedResponse(res);
    }

    if (e.message === "jwt expired") {
      const token_id = Math.trunc(Math.random() * 10 ** 8);
      const accessTokenNew = jwtMakeToken(
        { id: token_id },
        jwtConfig.access_expired
      );
      const refreshTokenNew = jwtMakeToken(
        { id: token_id },
        jwtConfig.refresh_expired
      );

      logger.info("Token has been refreshed!!!");
      logger.info(accessTokenNew, "new access token");
      logger.info(refreshTokenNew, "new refresh token");
      logger.info(token_id, "token_id");

      res.cookie("refresh_token", refreshTokenNew, {
        httpOnly: true,
      });
      res.setHeader("x-new-access-token", accessTokenNew);
    }
  }

  next();
};

const unauthorizedResponse = (res) => {
  return res.status(401).json({
    message: "Unauthorized",
  });
};
