import express from "express";
import type { Application, Request, Response } from "express";
import { AuthRoutes } from "./modules/auth/auth.route.js";
import { IssueRoutes } from "./modules/issues/issue.route.js";
import { errorMiddleware } from "./middleware/error.middleware.js";

const app: Application = express();

app.use(express.json());

app.use("/api/auth", AuthRoutes);
app.use("/api/issues", IssueRoutes);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Welcome to DevPulse API engine." });
});

app.use(errorMiddleware);

export default app;
