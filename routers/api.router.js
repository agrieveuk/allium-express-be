const express = require("express");
const apiRouter = express.Router();
const topicsRouter = require("./topics.router.js");
const articlesRouter = require("./articles.router.js");
const endpoints = require("../endpoints.json");

apiRouter.route("/").get((req, res, next) => {
  res.status(200).send({ endpoints });
});

apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);

module.exports = apiRouter;
