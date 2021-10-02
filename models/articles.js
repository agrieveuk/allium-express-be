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
  author
}) => {
  const validColumns = [
    "article_id",
    "title",
    "body",
    "votes",
    "topic",
    "author",
    "created_at",
    "comment_count",
  ];

  const offset = limit * (page - 1);

  let selectArticlesQuery = `
    SELECT articles.*, count(comments) AS comment_count FROM articles
    LEFT JOIN comments
    ON articles.article_id = comments.article_id`;

  let countQuery = `SELECT count(*) FROM articles`;

  if (!validColumns.includes(sort_by) || limit === "0") {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  if (topic || author) {
    const topicExists = topic ? await checkExists(topic, "slug", "topics") : null;
    const authorExists = author ? await checkExists(author, "username", "users") : null;

    if ((topic && !topicExists) || (author && !authorExists)) {
      return Promise.reject({ status: 404, msg: "Sorry, that is not found" });
    }
    
    if (topic) {
      selectArticlesQuery += format(` WHERE topic = %L`, topic);
      countQuery += format(` WHERE topic = %L`, topic);

      if (author) {
        selectArticlesQuery += format(` AND articles.author = %L`, author);
        countQuery += format(` AND articles.author = %L`, author);
      }
    } else {
      selectArticlesQuery += format(` WHERE articles.author = %L`, author);
      countQuery += format(` WHERE articles.author = %L`, author);
    }
  }

  selectArticlesQuery += format(
    ` GROUP BY articles.article_id
    ORDER BY %I %s
    LIMIT %L OFFSET %L;`,
    sort_by,
    order,
    limit,
    offset
  );

  const [{ rows: articles }, { rows: countRows }] = await Promise.all([
    db.query(selectArticlesQuery),
    db.query(countQuery += `;`),
  ]);

  const total_count = countRows[0].count;

  if (parseInt(total_count) && !articles.length) {
    // Gone a page too far - no articles found on current page
    return Promise.reject({ status: 404, msg: "Sorry, that is not found" });
  } else {
    return [articles, total_count];
  }
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

exports.insertArticle = async ({ author, title, body, topic }) => {
  const allKeysStrings = [author, title, body, topic].every((variable) => {
    return typeof variable === "string";
  });

  if (!allKeysStrings) {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  const {
    rows: [{ article_id }],
  } = await db.query(
    `INSERT INTO articles
    (author, title, body, topic)
    VALUES
    ($1, $2, $3, $4)
    RETURNING article_id;`,
    [author, title, body, topic]
  );

  return article_id;
};
