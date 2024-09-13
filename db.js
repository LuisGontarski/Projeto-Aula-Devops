// db.js
const Pool = require('pg').Pool;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'CLOUD',
  password: 'root',
  port: 5432,
});

module.exports = pool;
