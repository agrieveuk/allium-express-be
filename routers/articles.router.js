const express = require("express");
const {
  getArticleById,
  getArticles,
  patchArticleVotes,
} = require("../controllers/articles");
const articlesRouter = express.Router();

//endpoints
articlesRouter.route("/").get(getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes);

module.exports = articlesRouter;
