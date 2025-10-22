import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorMiddleware } from "./middleware/error.middleware";

const app = express();

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.send("💤API is running..."));

// routes
import authRouter from "./modules/auth/auth.route";

app.use("/api/v1/auth", authRouter);

// app.use(errorMiddleware);

export default app;
