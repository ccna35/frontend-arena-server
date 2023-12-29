import { Request, Response } from "express";
import { UserRequest } from "../util/token";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../db/db";

const createFeedback = async (req: UserRequest, res: Response) => {
  const user_id = req.user;
  const { content, submission_id } = req.body;

  const feedback_details = [[user_id, content, submission_id]];

  try {
    // Insert a new feedback
    const newFeedbackQuery =
      "INSERT INTO feedbacks(user_id, content, submission_id) VALUES ?";
    await pool.query<ResultSetHeader>(newFeedbackQuery, [feedback_details]);

    return res
      .status(201)
      .json({ message: "Feedback was created successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const updateFeedback = async (req: UserRequest, res: Response) => {
  const user_id = req.user;

  const { content } = req.body;

  const feedback_id = req.params.id;

  const updated_feedback_details = {
    content,
  };

  try {
    // Update a Feedback
    const updatedFeedbackQuery =
      "UPDATE feedbacks SET ? WHERE id = ? AND user_id = ?";
    await pool.query<ResultSetHeader>(updatedFeedbackQuery, [
      updated_feedback_details,
      feedback_id,
      user_id,
    ]);

    return res
      .status(200)
      .json({ message: "Feedback was updated successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getAllFeedbacksBySubmission = async (req: Request, res: Response) => {
  const { submission_id } = req.query;

  const query = "SELECT * FROM feedbacks WHERE submission_id = ?";

  try {
    const result = await pool.query<ResultSetHeader>(query, [submission_id]);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const getOneFeedback = async (req: Request, res: Response) => {
  const feedback_id = req.params.id;

  const query = "SELECT * FROM feedbacks WHERE id = ?";

  try {
    const result = await pool.query<ResultSetHeader>(query, [feedback_id]);

    return res.status(200).json(result[0]);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

const deleteFeedback = async (req: UserRequest, res: Response) => {
  const feedback_id = req.params.id;
  const user_id = req.user;

  // Check if feedback exists
  const checkQuery = "SELECT * FROM feedbacks WHERE id = ?";

  const result = await pool.query<RowDataPacket[]>(checkQuery, [feedback_id]);

  if (result[0].length === 0)
    return res.status(404).json({ message: "This feedback doesn't exist!" });

  if (result[0][0].user_id !== user_id)
    return res
      .status(401)
      .json({ message: "You're not authorized to delete this feedback!" });

  const deleteQuery = "DELETE FROM feedbacks WHERE id = ? AND user_id = ?";

  try {
    await pool.query<ResultSetHeader>(deleteQuery, [feedback_id, user_id]);
    return res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal Server Error");
  }
};

export {
  createFeedback,
  updateFeedback,
  getAllFeedbacksBySubmission,
  deleteFeedback,
  getOneFeedback,
};
