const db = require("../db/connection.js");
const format = require("pg-format");
const { checkExists } = require("./helpers.js");

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
  limit = 10,
  page = 1,
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

  const offset = limit * (page - 1);

  let selectArticlesQuery = `
    SELECT articles.*, count(comments) AS comment_count FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id`;

  let countQuery = `SELECT count(*) FROM articles`;

  if (!validColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  if (topic) {
    const topicExists = await checkExists(topic, "slug", "topics");

    if (topicExists) {
      selectArticlesQuery += format(` WHERE topic = %L`, topic);
      countQuery += format(` WHERE topic = %L;`, topic);
    } else {
      return Promise.reject({ status: 404, msg: "Sorry, that is not found" });
    }
  }

  selectArticlesQuery += format(
    ` GROUP BY articles.article_id
    ORDER BY articles.%I %s
    LIMIT %L OFFSET %L;`,
    sort_by,
    order,
    limit,
    offset
  );

  const [{ rows: articles }, { rows: countRows }] = await Promise.all([
    db.query(selectArticlesQuery),
    db.query(countQuery),
  ]);

  const total_count = countRows[0].count;

  return [articles, total_count];
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
