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
  if (typeof body !== "string" || typeof username !== "string") {
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

exports.deleteFromComments = async (comment_id) => {
  const { rowCount } = await db.query(
    `DELETE FROM comments
    WHERE comment_id = $1;`,
    [comment_id]
  );

  if (!rowCount)
    return Promise.reject({ status: 404, msg: "Sorry, that is not found" });
};

exports.updateComment = async (inc_votes, comment_id) => {
  const { rows } = await db.query(
    `UPDATE comments
    SET votes = votes + $1
    WHERE comment_id = $2
    RETURNING *;`,
    [inc_votes, comment_id]
  );

  return (
    rows[0] || Promise.reject({ status: 404, msg: "Sorry, that is not found" })
  );
};
