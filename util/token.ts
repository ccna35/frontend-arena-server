import jwt, { Secret } from "jsonwebtoken";
import { User } from "../types/types";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

const jwt_secret = process.env.JWT_SECRET as Secret;

const generateToken = async function (user_id: number) {
  const token = jwt.sign(
    {
      user_id,
    },
    jwt_secret,
    {
      expiresIn: "1d",
    }
  );

  return token;
};

export interface UserRequest extends Request {
  user?: number;
}

type MyToken = {
  user_id: number;
  iat: number;
  exp: number;
};

// Verify JWT token
const verifyToken = (req: UserRequest, res: Response, next: NextFunction) => {
  const { jwt: token } = req.cookies;

  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }

  try {
    const { user_id } = jwt.verify(token, jwt_secret) as MyToken;

    req.user = user_id;
    next();
  } catch (err) {
    res.status(401).send("Invalid Token");
  }
};

export { generateToken, verifyToken };
