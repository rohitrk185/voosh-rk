import express, {Request, Response} from "express";
import admin from "firebase-admin";
import * as functions from "firebase-functions";
import cors from "cors";
import rateLimiter from "express-rate-limit";

const app = express();
app.use(cors({origin: true}));
// parse json body content
app.use(express.json());

// Define a rate limiter for the whole app
const limiter = rateLimiter({
  validate: {
    ip: true,
  },
  windowMs: 1 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 100 requests per windowMs
  message: "We've received Too many requests!, Please try again in sometime...",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);

// Initialize the Firebase Admin SDK
admin.initializeApp();

import {authorizeRequest} from "./middlewares/index";
import {router as tasksRouter} from "./routers/tasks";
import {router as userRouter} from "./routers/users";

// Middleware to authorize requests
app.use(authorizeRequest);


app.get("/", (req: Request, res: Response) => {
  return res.status(200).send("Hi there what is up from Voosh!!!");
});

app.use("/tasks", tasksRouter); // router for tasks route
app.use("/user", userRouter);

// Error-handling middleware
app.use((err: Error, req: Request, res: Response) => {
  console.error(err.stack); // Log the error stack trace
  return res.status(500).json({
    message: "Internal server error",
    error: err.message,
  });
});

exports.api = functions.region("asia-south1").https.onRequest((request: functions.https.Request, response: Response) => {
  if (!request.path) {
    request.url = `/${request.url}`; // prepend '/' to keep query params if any
  }
  console.log(request.url, request.path);
  return app(request, response);
});
