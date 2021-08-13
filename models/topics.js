const db = require("../db/connection.js");

exports.selectTopics = async () => {
  const topics = await db.query(`SELECT * FROM topics;`);

  return topics.rows;
};

exports.insertTopic = async ({ slug, description }) => {
  if (typeof slug !== "string" || typeof description !== "string") {
    return Promise.reject({ status: 400, msg: "Bad Request" });
  }

  const { rows } = await db.query(
    `INSERT INTO topics
    (slug, description)
    VALUES
    ($1, $2)
    RETURNING *;`,
    [slug, description]
  );

  return rows[0];
};
