import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";

const app = express();
const PORT = env.port;
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(` Server is running on http://localhost:${PORT}`);
});
