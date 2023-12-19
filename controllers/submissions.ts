import { Request, Response } from "express";
import { pool } from "../db/db";
import { UserRequest } from "../util/token";
import { OkPacketParams, ResultSetHeader, RowDataPacket } from "mysql2";

const createSubmission = async (req: UserRequest, res: Response) => {
  const user_id = req.user;

  const { repo_link, live_link, notes, is_private, challenge_id } = req.body;

  const submission_details = [
    [user_id, repo_link, live_link, notes, is_private, challenge_id],
  ];

  try {
    // Insert a new submission
    const newSubmissionQuery =
      "INSERT INTO submissions(user_id, repo_link, live_link, notes, is_private, challenge_id) VALUES ?";
    await pool.query<ResultSetHeader>(newSubmissionQuery, [submission_details]);

    return res
      .status(201)
      .json({ message: "Submission was created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const updateSubmission = async (req: UserRequest, res: Response) => {
  const submission_id = req.params.id;

  const user_id = req.user;

  const {
    repo_link,
    live_link,
    notes,
    private: is_private,
    challenge_id,
  } = req.body;

  const updated_submission_details = {
    repo_link,
    live_link,
    notes,
    is_private,
  };

  try {
    // Update a Submission
    const updatedSubmissionQuery =
      "UPDATE submissions SET ? WHERE id = ? AND challenge_id = ? AND user_id = ?";
    await pool.query<ResultSetHeader>(updatedSubmissionQuery, [
      updated_submission_details,
      submission_id,
      challenge_id,
      user_id,
    ]);

    return res
      .status(200)
      .json({ message: "Submission was updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getAllSubmissions = async (req: Request, res: Response) => {
  const { challenge, user } = req.query;

  let query = "SELECT * FROM submissions WHERE 1";
  const queryParams: string[] = [];

  // Add challenge_id to the query if provided
  if (challenge) {
    query += " AND challenge_id = ?";
    queryParams.push(challenge as string);
  }

  // Add user_id to the query if provided
  if (user) {
    query += " AND user_id = ?";
    queryParams.push(user as string);
  }

  try {
    const result = await pool.query<ResultSetHeader>(query, queryParams);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getOneSubmission = async (req: Request, res: Response) => {
  const submission_id = req.params.id;

  const query = "SELECT * FROM submissions WHERE id = ?";

  try {
    const result = await pool.query<ResultSetHeader>(query, [submission_id]);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteSubmission = async (req: UserRequest, res: Response) => {
  const submission_id = req.params.id;
  const user_id = req.user;

  // Check if submission exists
  const checkQuery = "SELECT * FROM submissions WHERE id = ?";

  const result = await pool.query<RowDataPacket[]>(checkQuery, [submission_id]);

  if (result[0].length === 0)
    return res.status(404).json({ message: "This submission doesn't exist!" });

  if (result[0][0].user_id !== user_id)
    return res
      .status(401)
      .json({ message: "You're not authorized to delete this submission!" });

  const deleteQuery = "DELETE FROM submissions WHERE id = ? AND user_id = ?";

  try {
    await pool.query<ResultSetHeader>(deleteQuery, [submission_id, user_id]);
    return res.status(200).json({ message: "Submission deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export {
  createSubmission,
  updateSubmission,
  getAllSubmissions,
  getOneSubmission,
  deleteSubmission,
};
