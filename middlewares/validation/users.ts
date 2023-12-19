import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const userSignUpValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    firstName: z.string().trim().min(3).max(50),
    lastName: z.string().trim().min(3).max(50),
    email: z.string().trim().min(1).max(100).email(),
    username: z.string().trim().min(3).max(50).optional(),
    password: z
      .string()
      .min(8)
      .max(20)
      .regex(
        new RegExp(/^(?=.*[A-Z])(?=.*[\W])(?=.*[0-9])(?=.*[a-z]).{8,20}$/)
      ),
  });

  try {
    schema.parse(req.body);

    next();
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
};
export const userUpdateValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    firstName: z.string().trim().min(3).max(50),
    lastName: z.string().trim().min(3).max(50),
  });

  try {
    schema.parse(req.body);

    next();
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
};

export const userLoginValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    email: z.string().trim().email().min(1),
    password: z.string().trim().min(1),
  });

  try {
    schema.parse(req.body);

    next();
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
};
