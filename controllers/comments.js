const {
  selectArticleComments,
  insertComment,
  deleteFromComments,
} = require("../models/comments");

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

  insertComment({ username, body }, article_id)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

const deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteFromComments(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

module.exports = { getArticleComments, postComment, deleteComment };
