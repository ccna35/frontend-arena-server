import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import bodyParser from "body-parser";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + file.originalname);
  },
});

const MAX_FILE_SIZE = 200000; // 200 KB

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
});

// routes
import users from "./routes/users";
import challenges from "./routes/challenges";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

// Middlewares
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

const cpUpload = upload.fields([
  { name: "desktop", maxCount: 1 },
  { name: "featured", maxCount: 1 },
  { name: "tablet", maxCount: 1 },
  { name: "mobile", maxCount: 1 },
]);

app.post("/profile", cpUpload, function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.files);
  res.send("Done");
});

app.get("/images/:id", (req, res) => {
  // res.send(fs.readFileSync("/uploads/170181381324116GB_RAM_Receipt.jpg"));
  fs.readFile(
    `./uploads/170181381324116GB_RAM_Receipt.jpg`,

    function (err, image) {
      if (err) {
        throw err;
      }
      console.log(image);

      res.setHeader("Content-Type", "image/jpg");
      // res.setHeader("Content-Length", ""); // Image size here
      // res.setHeader("Access-Control-Allow-Origin", "*"); // If needs to be public
      res.send(image);
    }
  );
});

// Routes
app.use("/users", users);
app.use("/challenges", challenges);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
