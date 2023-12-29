import { NextFunction, Response } from "express";
import { UserRequest } from "../../util/token";
import { z } from "zod";

export const submissionValidation = (
  req: UserRequest,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    repo_link: z
      .string()
      .trim()
      .url()
      .min(3)
      .max(100)
      .regex(new RegExp(/^https:\/\/github\.com\//)),
    live_link: z.string().trim().url().min(3).max(100),
    notes: z.string().trim().min(3).max(500),
    is_private: z.boolean().optional(),
    challenge_id: z.number().min(1),
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
