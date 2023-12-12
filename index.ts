import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import bodyParser from "body-parser";

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

// const cpUpload = upload.fields([
//   { name: "desktop", maxCount: 1 },
//   { name: "featured", maxCount: 1 },
//   { name: "tablet", maxCount: 1 },
//   { name: "mobile", maxCount: 1 },
// ]);

// app.post("/challenges", cpUpload, function (req, res, next) {
//   // req.body will hold the text fields, if there were any
//   console.log(req.files);
//   res.send("Done");
// });

// Routes
app.use("/users", users);
app.use("/challenges", challenges);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
