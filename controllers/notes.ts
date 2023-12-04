import { Request, Response } from "express";
import { connection } from "../db/db";
import { UserRequest } from "../util/token";
import { ResultSetHeader } from "mysql2";

const createNote = (req: UserRequest, res: Response) => {
  console.log(req.body);

  const user_id = req.user;

  const { note_title, note_body, isPinned, category } = req.body;

  const note_details = [[user_id, note_title, note_body, isPinned, category]];

  const query =
    "INSERT INTO notes(user_id, note_title, note_body, isPinned, category) VALUES ?";

  connection.query(query, [note_details], (err, results, fields) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json({ message: "Note was created successfully" });
    }
  });
};

const updateNote = (req: UserRequest, res: Response) => {
  const note_id = req.params.id;
  const user_id = req.user;

  const { note_title, note_body, isPinned, category } = req.body;

  const query =
    "UPDATE notes SET note_title = ?, note_body = ?, isPinned = ?, category = ? WHERE user_id = ? AND id = ?";

  const newData = [note_title, note_body, isPinned, category, user_id, note_id];

  connection.query<ResultSetHeader>(query, newData, (err, result) => {
    if (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    } else if (result.affectedRows === 0) {
      res.status(404).json({ message: "Note not found" });
    } else {
      res.status(200).json({ message: "Note updated successfully" });
    }
  });
};

const deleteNote = (req: UserRequest, res: Response) => {
  const note_id = req.params.id;
  const user_id = req.user;

  console.log(user_id);

  const deleteQuery = "DELETE FROM notes WHERE id = ? AND user_id = ?";

  connection.query<ResultSetHeader>(
    deleteQuery,
    [note_id, user_id],
    (err, result) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else if (result.affectedRows === 0) {
        res.status(404).json({ message: "Note not found" });
      } else {
        res.status(200).json({ message: "Note deleted successfully" });
      }
    }
  );
};

const getAllNotesByUser = (req: UserRequest, res: Response) => {
  const user = req.params.id;

  const { search, isPinned, category } = req.query;

  const query = `SELECT n.id, n.user_id, n.note_title, n.note_body, n.isPinned, c.category_name, n.createdAt FROM notes AS n JOIN categories AS c ON n.category = c.id WHERE n.user_id = ${user} AND (n.note_title LIKE '%${search}%' OR n.note_body LIKE '%${search}%') ${
    !["0", ""].includes(category as string)
      ? "AND n.category = " + category
      : ""
  } ORDER BY n.createdAt DESC`;

  // AND n.isPinned = ${isPinned}

  connection.query(query, (err, results) => {
    if (err) {
      console.log(err);

      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json(results);
    }
  });
};

const getAllNotes = (req: Request, res: Response) => {
  const query = "SELECT * FROM `notes`";

  connection.query(query, (err, results) => {
    if (err) {
      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json(results);
    }
  });
};

const getNotesByCategory = (req: UserRequest, res: Response) => {
  const user_id = req.user;

  const category = req.params.id;

  const query = "SELECT * FROM `notes` WHERE user_id = ? AND category = ?";

  connection.query(query, [user_id, category], (err, results) => {
    if (err) {
      console.log(err);

      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json(results);
    }
  });
};

// const getNotesByQuery = (req: UserRequest, res: Response) => {
//   const user_id = req.user;

//   const searchQuery = req.query.search;

//   const query =
//     "SELECT * FROM `notes` WHERE user_id = ? AND title LIKE '%?%' OR body LIKE '%?'";

//   connection.query(query, [user_id, searchQuery], (err, results) => {
//     if (err) {
//       console.log(err);

//       res.status(500).send("Internal Server Error");
//     } else {
//       res.status(200).json(results);
//     }
//   });
// };

const getOneNote = (req: Request, res: Response) => {
  const note_id = req.params.id;

  console.log(req.params);

  const query = "SELECT * FROM `notes` WHERE id = ?";
  connection.query(query, [note_id], (err, results) => {
    if (err) {
      console.log(err);

      res.status(500).send("Internal Server Error");
    } else {
      res.status(200).json(results);
    }
  });
};

export {
  createNote,
  getAllNotes,
  updateNote,
  getOneNote,
  deleteNote,
  getNotesByCategory,
  getAllNotesByUser,
};
