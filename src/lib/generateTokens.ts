import jwt from 'jsonwebtoken';

export const getAccessToken = (payload: object) => {
  return jwt.sign(payload, String(process.env.ACCESS_TOKEN_SECRET), {
    expiresIn: '15m',
  });
};

export const getRefreshToken = (payload: object) => {
  return jwt.sign(payload, String(process.env.REFRESH_TOKEN_SECRET), {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret);
};
