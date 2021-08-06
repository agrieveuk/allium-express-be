const db = require("../db/connection.js");

exports.selectArticleComments = async (article_id) => {
  const { rows } = await db.query(
    `SELECT comment_id, votes, created_at, author, body FROM comments
    WHERE article_id = $1;`,
    [article_id]
  );

  if (!rows.length) {
    const articleExists = await checkArticleExists(article_id);
    if (!articleExists) {
      return Promise.reject({ status: 404, msg: "Sorry, that is not found" });
    }
  }

  return rows;
};

const checkArticleExists = async (article_id) => {
  const { rows } = await db.query(
    `SELECT * FROM articles
    WHERE article_id = $1;`,
    [article_id]
  );

  return rows.length > 0;
};

exports.insertComment = async ({ username, body }, article_id) => {
  if (typeof body !== "string") {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  const { rows } = await db.query(
    `INSERT INTO comments
    (author, article_id, body)
    VALUES
    ($1, $2, $3)
    RETURNING *;`,
    [username, article_id, body]
  );

  return rows[0];
};
