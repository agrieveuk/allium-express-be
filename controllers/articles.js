const {
  selectArticleById,
  selectArticles,
  updateArticleVotes,
  insertArticle,
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
  const { sort_by, order, topic, limit, page, author } = req.query;
  selectArticles({ sort_by, order, topic, limit, page, author })
    .then(([articles, total_count]) => {
      res.status(200).send({ articles, total_count });
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

const postArticle = (req, res, next) => {
  const { author, title, body, topic } = req.body;

  insertArticle({ author, title, body, topic })
    .then((article_id) => {
      return selectArticleById(article_id);
    })
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch(next);
};

module.exports = {
  getArticleById,
  getArticles,
  patchArticleVotes,
  postArticle,
};
