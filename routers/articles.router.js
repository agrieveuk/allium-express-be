const express = require("express");
const { getArticleById, getArticles } = require("../controllers/articles");
const articlesRouter = express.Router();

//endpoints
articlesRouter.route("/").get(getArticles);
articlesRouter.route("/:article_id").get(getArticleById);

module.exports = articlesRouter;
