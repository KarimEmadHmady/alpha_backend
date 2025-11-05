import con from "../config/index.js";

export const CategoryModel = {
  create: async (data) => {
    return new Promise((resolve, reject) => {
      const sql = "INSERT INTO category SET ?";
      con.query(sql, data, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  update: async (id, name) => {
    return new Promise((resolve, reject) => {
      const sql = "UPDATE category SET name = ? WHERE id = ?";
      con.query(sql, [name, id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  delete: async (id) => {
    return new Promise((resolve, reject) => {
      const sql = "DELETE FROM category WHERE id = ?";
      con.query(sql, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getAll: async () => {
    return new Promise((resolve, reject) => {
      const sql = "SELECT * FROM category";
      con.query(sql, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
};