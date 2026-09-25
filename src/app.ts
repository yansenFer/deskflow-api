import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env";
import { apiReference } from "@scalar/express-api-reference";
import openApiSpec from "./docs/openapi.json";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { authRoutes } from "./modules/auth/auth.routes";

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

app.get("/openapi.json", (_req: Request, res: Response) => {
  res.json(openApiSpec);
});

// Modern API Documentation with Scalar
app.use(
  "/docs",
  apiReference({
    spec: {
      content: openApiSpec,
    },
    theme: "purple",
    darkMode: true,
  }),
);

app.use("/api/v1/auth", authRoutes);

// Root route redirect to docs
app.get("/", (_req: Request, res: Response) => {
  res.redirect("/docs");
});

// 404 & Centralized Error Handler Middlewares
app.use(notFoundHandler);
app.use(errorHandler);
