import con from "../config/index.js";

export const UserModel = {
  getAll: () => new Promise((resolve, reject) => {
    con.query("SELECT * FROM `users`", (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  }),

  getById: (id) => new Promise((resolve, reject) => {
    con.query("SELECT * FROM `users` WHERE id = ?", [id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  }),

  getByEmail: (email) => new Promise((resolve, reject) => {
    con.query("SELECT * FROM `users` WHERE email = ?", [email], (err, rows) => {
      if (err) reject(err);
      else resolve(rows[0]);
    });
  }),

  create: (data) => new Promise((resolve, reject) => {
    con.query("INSERT INTO users SET ?", data, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  }),

  updateById: (id, data) => new Promise((resolve, reject) => {
    con.query("UPDATE users SET ? WHERE id = ?", [data, id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  }),

  deleteById: (id) => new Promise((resolve, reject) => {
    con.query("DELETE FROM users WHERE id = ?", [id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  }),
};
