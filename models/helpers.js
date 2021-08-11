const db = require("../db/connection.js");
const format = require("pg-format");

exports.checkExists = async (value, column, table) => {
  const queryString = format(
    `SELECT * FROM %I
    WHERE %I = $1;`,
    table,
    column
  );

  const { rows } = await db.query(queryString, [value]);

  return rows.length > 0;
};
