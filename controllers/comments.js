const { selectArticleComments } = require("../models/comments");

const getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleComments(article_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

module.exports = { getArticleComments };
