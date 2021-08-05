const express = require("express");
const {
  getArticleById,
  getArticles,
  patchArticleVotes,
} = require("../controllers/articles");
const { getArticleComments } = require("../controllers/comments");
const articlesRouter = express.Router();

//endpoints
articlesRouter.route("/").get(getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes);

articlesRouter.route("/:article_id/comments").get(getArticleComments);

module.exports = articlesRouter;
