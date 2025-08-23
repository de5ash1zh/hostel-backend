import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import groupRoutes from "./routes/group.routes.js";
import joinRequestRoutes from "./routes/joinRequest.routes.js";
import groupMembersRoutes from "./routes/groupMember.routes.js";
import groupPostRoutes from "./routes/groupPost.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();
const port = env.PORT;

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/", joinRequestRoutes);
app.use("/api", groupMembersRoutes);
app.use("/api", groupPostRoutes);

// Error Middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(` Server is running on http://localhost:${port}`);
});
