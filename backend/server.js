import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";

import chatRoutes from "./routes/chatRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

// Ensure uploads directory exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/chat", chatRoutes);
app.use("/upload", uploadRoutes);

app.listen(5000, () => {
  console.log("Server running on port 5000");
});