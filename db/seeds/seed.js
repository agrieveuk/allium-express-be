const db = require("../connection.js");
const format = require("pg-format");
const {
  formatValues,
  makeLookup,
  updateKeyValue,
  renameKeys,
} = require("../utils/data-manipulation");

const seed = async (data) => {
  const { articleData, commentData, topicData, userData } = data;
  await db.query(`DROP TABLE IF EXISTS comments;`);
  await db.query(`DROP TABLE IF EXISTS articles;`);
  await Promise.all([
    db.query(`DROP TABLE IF EXISTS users;`),
    db.query(`DROP TABLE IF EXISTS topics;`),
  ]);

  await Promise.all([
    db.query(`CREATE TABLE topics (
      slug VARCHAR(100) PRIMARY KEY,
      description VARCHAR(300) NOT NULL
    );`),
    db.query(`CREATE TABLE users (
      username VARCHAR(100) PRIMARY KEY,
      avatar_url VARCHAR(230),
      name VARCHAR(100) NOT NULL
    );`),
  ]);

  await db.query(`CREATE TABLE articles (
    article_id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    body TEXT NOT NULL,
    votes INT DEFAULT 0 NOT NULL,
    topic VARCHAR(100) REFERENCES topics(slug) NOT NULL,
    author VARCHAR(100) REFERENCES users(username) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
  );`);

  await db.query(`CREATE TABLE comments (
    comment_id SERIAL PRIMARY KEY,
    author VARCHAR(100) REFERENCES users(username) NOT NULL,
    article_id INT REFERENCES articles(article_id) ON DELETE CASCADE NOT NULL,
    votes INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    body VARCHAR(500) NOT NULL
  );`);

  const topicInsertQuery = format(
    `INSERT INTO topics
    (slug, description)
    VALUES
    %L;`,
    formatValues(topicData, ["slug", "description"])
  );
  await db.query(topicInsertQuery);

  const userInsertQuery = format(
    `INSERT INTO users
    (username, avatar_url, name)
    VALUES
    %L;`,
    formatValues(userData, ["username", "avatar_url", "name"])
  );
  await db.query(userInsertQuery);

  const articleInsertQuery = format(
    `INSERT INTO articles
    (title, body, votes, topic, author, created_at)
    VALUES
    %L
    RETURNING article_id, title;`,
    formatValues(articleData, [
      "title",
      "body",
      "votes",
      "topic",
      "author",
      "created_at",
    ])
  );
  const articleInfo = await db.query(articleInsertQuery);

  const refObject = makeLookup(articleInfo.rows, "title", "article_id");
  const commentDataWithId = updateKeyValue(
    commentData,
    "belongs_to",
    "article_id",
    refObject
  );
  const formattedCommentDataWithId = renameKeys(
    commentDataWithId,
    "created_by",
    "author"
  );

  const commentInsertQuery = format(
    `INSERT INTO comments
    (author, article_id, votes, created_at, body)
    VALUES
    %L;`,
    formatValues(formattedCommentDataWithId, [
      "author",
      "article_id",
      "votes",
      "created_at",
      "body",
    ])
  );
  await db.query(commentInsertQuery);
};

module.exports = seed;
