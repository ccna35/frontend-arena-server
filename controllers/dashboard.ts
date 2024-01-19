import { ResultSetHeader } from "mysql2";
import { pool } from "../db/db";
import { Request, Response } from "express";

const quickStats = async (req: Request, res: Response) => {
  const query =
    "SELECT (SELECT COUNT(*) FROM challenges) AS challenges_count, (SELECT COUNT(*) FROM user_accounts) AS users_count,(SELECT COUNT(*) FROM feedbacks) AS feedbacks_count, (SELECT COUNT(*) FROM submissions) AS submissions_count";

  try {
    const result = await pool.query<ResultSetHeader>(query);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export { quickStats };
