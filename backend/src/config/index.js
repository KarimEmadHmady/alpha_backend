

import mysql from 'mysql';

const con = mysql.createConnection({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'aplod',
//   password: process.env.DB_PASSWORD || 'Fb;WjGbqrrxe',
//   database: process.env.DB_NAME || 'alphodincon'
  host: 'localhost',
  user:  'root',
  port: 10017,
  password:  'root',
  database:  'local'
});

con.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1); // Exit the process with an error code
  } else {
    console.log('Connected to the database');
  }
});

export default con; 
