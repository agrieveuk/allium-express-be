const db = require("../db/connection.js");

exports.selectArticleById = async (article_id) => {
  const { rows } = await db.query(
    `SELECT articles.*, count(comments) AS comment_count FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;`,
    [article_id]
  );
  return rows[0];
};

exports.selectArticles = async () => {
  const { rows } = await db.query(
    `SELECT articles.*, count(comments) AS comment_count FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id
    GROUP BY articles.article_id;`
  );
  return rows;
};

exports.updateArticleVotes = async (inc_votes, article_id) => {
  const { rows } = await db.query(
    `UPDATE articles
    SET votes = $1
    WHERE article_id = $2
    RETURNING *;`,
    [inc_votes, article_id]
  );

  return rows[0];
};
