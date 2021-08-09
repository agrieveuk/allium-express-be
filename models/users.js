const db = require("../db/connection");

exports.selectUsers = async () => {
  const { rows } = await db.query("SELECT username FROM users");

  return rows;
};

exports.selectUserByUsername = async (username) => {
  const { rows } = await db.query(
    `SELECT * FROM users
    WHERE username = $1;`,
    [username]
  );

  return (
    rows[0] || Promise.reject({ status: 404, msg: "Sorry, that is not found" })
  );
};
