const express = require("express");
const {
  getArticleById,
  getArticles,
  patchArticleVotes,
  postArticle,
} = require("../controllers/articles");
const { getArticleComments, postComment } = require("../controllers/comments");
const articlesRouter = express.Router();

//endpoints
articlesRouter.route("/").get(getArticles).post(postArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVotes);

articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
