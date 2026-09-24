import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";

const app: Application = express();

export default app;

// Security & Parsing Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // allows Scalar API Reference CDN resources
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (env.NODE_ENV !== "test") {
  app.use(morgan(env.NODE_ENV === "development" ? "dev" : "combined"));
}

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
