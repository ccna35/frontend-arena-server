import { Request, Response } from "express";
import { connection } from "../db/db";
import { UserRequest } from "../util/token";
import { ResultSetHeader } from "mysql2";

const createCategory = (req: UserRequest, res: Response) => {
  console.log(req.user);

  const user_id = req.user;

  const { category_name } = req.body;

  const category_details = [[user_id, category_name]];

  const checkQuery =
    "SELECT * FROM categories WHERE category_name = ? AND user_id = ?";

  connection.query<ResultSetHeader[]>(
    checkQuery,
    [category_name, user_id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }

      if (results.length > 0) {
        res.status(400).json({ message: "This category already exists" });
      } else {
        const query = "INSERT INTO categories(user_id, category_name) VALUES ?";

        connection.query(query, [category_details], (err, results, fields) => {
          if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
          } else {
            console.log("results", results);
            res
              .status(200)
              .json({ message: "Category was created successfully" });
          }
        });
      }
    }
  );
};

const updateCategoryName = (req: UserRequest, res: Response) => {
  console.log("Update controller");

  console.log("req.body: ", req.body);

  const category_id = req.params.id;

  const { category_name } = req.body;

  const user_id = req.user;

  const checkQuery =
    "SELECT * FROM categories WHERE NOT id = ? AND category_name = ? AND user_id = ?";

  connection.query<ResultSetHeader[]>(
    checkQuery,
    [category_id, category_name, user_id],
    (err, results) => {
      if (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
      }
      if (results.length > 0) {
        res.status(400).json({ message: "This category already exists" });
      } else {
        const query =
          "UPDATE categories SET category_name = ? WHERE user_id = ? AND id = ?";

        const newData = [category_name, user_id, category_id];

        connection.query<ResultSetHeader>(query, newData, (err, result) => {
          if (err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
          } else if (result.affectedRows === 0) {
            res.status(404).json({ message: "Category not found" });
          } else {
            res
              .status(200)
              .json({ message: "Category was updated successfully" });
          }
        });
      }
    }
  );
};

const deleteCategory = (req: UserRequest, res: Response) => {
  const category_id = req.params.id;
  const user_id = req.user;

  const deleteQuery = "DELETE FROM categories WHERE id = ? AND user_id = ?";

  connection.query<ResultSetHeader>(
    deleteQuery,
    [category_id, user_id],
    (err, result) => {
      if (err) {
        res.status(500).json({ message: err });
      } else if (result.affectedRows === 0) {
        res.status(404).json({ message: "Category not found" });
      } else {
        res.status(200).json({ message: "Category deleted successfully" });
      }
    }
  );
};

const getAllCategories = (req: UserRequest, res: Response) => {
  const user = req.user;

  const user_id = [[user]];

  const query = "SELECT * FROM `categories` WHERE user_id = ?";

  connection.query(query, [user_id], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json(results);
    }
  });
};

export { createCategory, getAllCategories, updateCategoryName, deleteCategory };
