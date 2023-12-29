import { NextFunction, Response } from "express";
import { UserRequest } from "../../util/token";
import { z } from "zod";

export const feedbackValidation = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    content: z.string().trim().min(3).max(500),
    submission_id: z.number().min(1),
  });

  try {
    const result = schema.parse(req.body);
    req.body = result;

    next();
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
};

export const feedbackUpdateValidation = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    content: z.string().trim().min(3).max(500),
  });

  try {
    const result = schema.parse(req.body);
    req.body = result;

    next();
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
};
