const db = require("../db/connection.js");
const { checkExists } = require("./helpers.js");
const format = require("pg-format");

exports.selectArticleComments = async (
  { limit = 10, page = 1 },
  article_id
) => {
  if (limit === "0") return Promise.reject({ status: 400, msg: "Bad Request" });

  const offset = limit * (page - 1);
  const commentsQuery = format(
    `SELECT comment_id, votes, created_at, author, body FROM comments
    WHERE article_id = $1
    LIMIT %L OFFSET %L;`,
    limit,
    offset
  );

  const { rows } = await db.query(commentsQuery, [article_id]);

  if (!rows.length) {
    const articleExists = await checkExists(
      article_id,
      "article_id",
      "articles"
    );

    if (!articleExists || offset) {
      return Promise.reject({ status: 404, msg: "Sorry, that is not found" });
    }
  }

  return rows;
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
