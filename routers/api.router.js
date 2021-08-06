const express = require("express");
const apiRouter = express.Router();
const topicsRouter = require("./topics.router.js");
const articlesRouter = require("./articles.router.js");
const endpoints = require("../endpoints.json");
const commentsRouter = require("./comments.router.js");

apiRouter.route("/").get((req, res, next) => {
  res.status(200).send({ endpoints });
});

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);

module.exports = apiRouter;
