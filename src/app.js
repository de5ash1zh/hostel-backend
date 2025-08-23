import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();
const port = env.PORT;
// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "✅ Server is running" });
});

app.use("/api/auth", authRoutes);

// Start server
app.listen(port, () => {
  console.log(` Server is running on http://localhost:${port}`);
});
