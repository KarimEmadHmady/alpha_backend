import jwt from "jsonwebtoken";

export const generateToken = (payload, secret, expiresIn = "1h") => {
  return jwt.sign(payload, secret, { expiresIn });
};

export const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};
