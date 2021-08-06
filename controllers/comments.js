const { selectArticleComments, insertComment } = require("../models/comments");

const getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleComments(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

const postComment = (req, res, next) => {
  const { username, body } = req.body;
  const { article_id } = req.params;

  for (let key in req.body) {
    if (!["username", "body"].includes(key)) {
      return next({ status: 400, msg: "Bad Request" });
    }
  }

  insertComment({ username, body }, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

module.exports = { getArticleComments, postComment };
