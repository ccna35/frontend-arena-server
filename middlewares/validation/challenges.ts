import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const challengeValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const schema = z.object({
    challenge_title: z.string().trim().min(3).max(100),
    brief_description: z.string().trim().min(10).max(100),
    challenge_description: z.string().trim().min(10).max(500),
    extra_tips: z.string().trim().min(10).max(500),
    challenge_languages: z.string().trim().min(1),
    difficulty_level: z.string().trim().min(1),
    figma: z
      .string()
      .url()
      .min(10)
      .max(150)
      .regex(new RegExp(/^https:\/\/www\.figma\.com\/file\//)),
  });

  try {
    schema.parse(req.body);

    next();
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
};
