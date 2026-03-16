import express from "express";
import { chatWithRAG } from "../services/ragService.js";

const router = express.Router();

router.post("/", chatWithRAG);

export default router;