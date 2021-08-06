const {
  selectArticleById,
  selectArticles,
  updateArticleVotes,
} = require("../models/articles");

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

const getArticles = (req, res, next) => {
  const { sort_by, order, topic } = req.query;
  selectArticles({ sort_by, order, topic })
    .then((articles) => {
      res.status(200).send({ articles });
    })
    .catch(next);
};

const patchArticleVotes = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;

  updateArticleVotes(inc_votes, article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch(next);
};

module.exports = { getArticleById, getArticles, patchArticleVotes };
