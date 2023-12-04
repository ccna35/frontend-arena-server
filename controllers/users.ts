import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { connection } from "../db/db";
import { generateToken } from "../util/token";
import { User } from "../types/types";
import { ResultSetHeader, RowDataPacket } from "mysql2";
require("dotenv").config();

const signup = async (req: Request, res: Response) => {
  const { firstName, lastName, email, username, password } = req.body;

  const checkQuery =
    "SELECT * FROM user_accounts WHERE email = ? OR username = ?";
  connection.query<RowDataPacket[]>(
    checkQuery,
    [email, username],
    (checkErr, checkResult) => {
      if (checkErr) {
        console.log(checkErr);

        res.status(500).send("Internal Server Error");
      } else if (checkResult.length > 0) {
        console.log("User with this email or username already exists");
        res.status(400).send("User with this email or username already exists");
      } else {
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user: User = {
          firstName,
          lastName,
          email,
          username,
          password: hashedPassword,
        };
        const values = [[firstName, lastName, email, username, hashedPassword]];
        const query = `INSERT INTO user_accounts(firstName,
      lastName,
      email,
      username,
      user_password) VALUES ?`;
        connection.query<ResultSetHeader>(
          query,
          [values],
          async (insertErr, insertResult) => {
            if (insertErr) {
              console.log(insertErr);
              res.status(500).send("Internal Server Error");
            } else {
              console.log("insertId: ", insertResult.insertId);

              // Add an uncategorized category every time a new user signs up
              const category_details = [
                [insertResult.insertId, "Uncategorized"],
              ];
              const uncategorizedQuery =
                "INSERT INTO categories(user_id, category_name) VALUES ?";

              connection.query(
                uncategorizedQuery,
                [category_details],
                async (err, results) => {
                  if (err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                  } else {
                    console.log("results", results);
                    const token = await generateToken(insertResult.insertId);

                    res.cookie("jwt", token, {
                      httpOnly: true,
                      secure: true,
                      sameSite: "none",
                      maxAge: 7 * 24 * 60 * 60 * 1000,
                    });
                    res.status(200).json({
                      message: "User signed up successfully",
                      user: {
                        id: insertResult.insertId,
                        firstName,
                        lastName,
                        username,
                        email,
                      },
                    });
                  }
                }
              );
            }
          }
        );
      }
    }
  );
};

const login = (req: Request, res: Response) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM user_accounts WHERE email = ?";
  connection.query<RowDataPacket[]>(query, [email], (err, result) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    }
    if (result.length === 0) {
      res.status(401).send("User not found");
    } else {
      console.log(result);

      const user = result[0];
      const { id, firstName, lastName, username, email, createdAt } = result[0];
      bcrypt.compare(password, user.user_password, async (err, isMatch) => {
        if (err) {
          throw err;
        }
        if (isMatch) {
          const token = await generateToken(id);

          res.cookie("jwt", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });

          res.status(200).send({
            message: "Login Successful",
            user: { id, firstName, lastName, username, email, createdAt },
          });
        } else {
          res.status(401).send("Invalid credentials");
        }
      });
    }
  });
};

const logout = (req: Request, res: Response) => {
  res.clearCookie("jwt");

  res.status(200).json({ message: "User logged out successfully" });
};

const updateUser = (req: Request, res: Response) => {
  const userId = req.params.id;

  console.log("userId", userId);

  const { firstName, lastName } = req.body;

  const newData = [firstName, lastName, userId];

  const query =
    "UPDATE user_accounts SET firstName = ?, lastName = ? WHERE id = ?";

  connection.query<ResultSetHeader>(query, newData, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else if (result.affectedRows === 0) {
      res.status(404).send("User not found");
    } else {
      res.status(200).send("User updated successfully");
    }
  });
};

const getAllUsers = (req: Request, res: Response) => {
  connection.query(
    "SELECT id, firstName, lastName, email, username, createdAt FROM `user_accounts`",
    (err, results) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        res.status(200).json(results);
      }
    }
  );
};

const getOneUser = (req: Request, res: Response) => {
  const { id: userId } = req.params;

  const query =
    "SELECT id, firstName, lastName, email, username, createdAt FROM `user_accounts` WHERE id = ?";

  connection.query(query, [userId], (err, results) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json(results);
    }
  });
};

export { login, signup, logout, updateUser, getAllUsers, getOneUser };
