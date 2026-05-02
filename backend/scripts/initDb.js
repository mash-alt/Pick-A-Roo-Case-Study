require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDb() {
  const dbName = process.env.DB_NAME || 'pickaroo';
  const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.query(`USE \`${dbName}\`; ${schemaSql}`);
    console.log(`Database "${dbName}" initialized successfully.`);
  } finally {
    await connection.end();
  }
}

initDb().catch((error) => {
  console.error('Database initialization failed:', error.message);
  process.exit(1);
});
