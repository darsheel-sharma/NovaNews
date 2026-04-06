import express from "express";
import { saveArticle, getArticles } from "../controllers/library.js";

const router = express.Router();

router.post("/save-article", saveArticle);
router.get("/get-articles/:userId", getArticles);
export default router;
