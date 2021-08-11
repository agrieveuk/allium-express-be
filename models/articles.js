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

  return (
    rows[0] || Promise.reject({ status: 404, msg: "Sorry, that is not found" })
  );
};

exports.selectArticles = async ({
  sort_by = "created_at",
  order = "DESC",
  topic,
}) => {
  const validColumns = [
    "article_id",
    "title",
    "body",
    "votes",
    "topic",
    "author",
    "created_at",
  ];

  let selectArticlesQuery = `
    SELECT articles.*, count(comments) AS comment_count FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id`;

  if (!validColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  if (topic) {
    if (["mitch", "cats", "paper"].includes(topic)) {
      selectArticlesQuery += ` WHERE topic = '${topic}'`;
    } else {
      return Promise.reject({ status: 404, msg: "Sorry, that is not found" });
    }
  }

  selectArticlesQuery += `
    GROUP BY articles.article_id
    ORDER BY articles.${sort_by} ${order};
  `;

  const { rows } = await db.query(selectArticlesQuery);

  return rows;
};

exports.updateArticleVotes = async (inc_votes, article_id) => {
  const { rows } = await db.query(
    `UPDATE articles
    SET votes = votes + $1
    WHERE article_id = $2
    RETURNING *;`,
    [inc_votes, article_id]
  );

  return (
    rows[0] || Promise.reject({ status: 404, msg: "Sorry, that is not found" })
  );
};
