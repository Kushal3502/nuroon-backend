import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import {
  createChatbot,
  deleteChatbot,
  editChatbot,
  fetchAllChatbots,
  fetchChatbotById,
} from "./chatbot.controller";

const router = Router();

router.use(authMiddleware);

router.route("/").post(createChatbot).get(fetchAllChatbots);

router
  .route("/:chatbotId")
  .patch(editChatbot)
  .delete(deleteChatbot)
  .get(fetchChatbotById);

export default router;
