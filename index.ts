import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import bodyParser from "body-parser";

// routes
import users from "./routes/users";
import challenges from "./routes/challenges";
import submissions from "./routes/submissions";
import feedbacks from "./routes/feedbacks";

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
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// Routes
app.use("/api/users", users);
app.use("/api/challenges", challenges);
app.use("/api/submissions", submissions);
app.use("/api/feedbacks", feedbacks);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
