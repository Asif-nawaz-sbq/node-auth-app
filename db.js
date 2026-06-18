const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'database-1.c5y6og6c4mwx.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'YOUR_PASSWORD',
  database: 'nodeauthapp',
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.log('DB connection error:', err);
  } else {
    console.log('Connected to AWS RDS MariaDB');
  }
});

module.exports = db;
