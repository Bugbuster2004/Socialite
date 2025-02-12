import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  deleteMessage,
  editMessage,
  getChatMedia,
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.patch("/:id/edit", protectRoute, editMessage);
router.delete("/:id", protectRoute, deleteMessage);
router.get("/media/:id", protectRoute, getChatMedia);

export default router;
