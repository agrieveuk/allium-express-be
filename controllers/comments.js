const {
  selectArticleComments,
  insertComment,
  deleteFromComments,
  updateComment,
} = require("../models/comments");

const getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  const { limit, page } = req.query;

  selectArticleComments({ limit, page }, article_id)
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

const patchComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  updateComment(inc_votes, comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch(next);
};

module.exports = {
  getArticleComments,
  postComment,
  deleteComment,
  patchComment,
};
