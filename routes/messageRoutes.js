import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { addMessage, getMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/:chatId/:messageId", authMiddleware, getMessage);
router.post("/:chatId", authMiddleware, addMessage);

export default router;
