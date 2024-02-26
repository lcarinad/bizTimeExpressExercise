/** Database setup for BizTime. */
const { Client } = require("pg");
let DB_URI;

DB_URI =
  process.env.NODE_ENV === "test"
    ? "postgresql:///biztimedb_test"
    : "postgresql:///biztimedb";

let db = new Client({ connectionString: DB_URI });

db.connect();

module.exports = db;
