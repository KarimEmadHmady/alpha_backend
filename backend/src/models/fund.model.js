import con from "../config/index.js";

const Fund = {
  create: (fundData, callback) => {
    const query = "INSERT INTO funds SET ?";
    con.query(query, fundData, callback);
  },

  update: (id, fundData, callback) => {
    const query = "UPDATE funds SET ? WHERE id = ?";
    con.query(query, [fundData, id], callback);
  },

  updatePrice: (id, currentprice, newprice, callback) => {
    const query = "UPDATE funds SET currentprice = ?, newprice = ? WHERE id = ?";
    con.query(query, [currentprice, newprice, id], callback);
  },

  addPriceHistory: (historyData, callback) => {
    const query = "INSERT INTO history SET ?";
    con.query(query, historyData, callback);
  },

  updateStatus: (id, status, callback) => {
    const query = "UPDATE funds SET status = ? WHERE id = ?";
    con.query(query, [status, id], callback);
  },

  delete: (id, callback) => {
    const query = "DELETE FROM funds WHERE id = ?";
    con.query(query, [id], callback);
  },

  findByUser: (userId, limit, offset, callback) => {
    const query = "SELECT * FROM `funds` WHERE userid = ? LIMIT ? OFFSET ?";
    con.query(query, [userId, limit, offset], callback);
  },

  findAll: (limit, offset, callback) => {
    const countQuery = "SELECT COUNT(*) AS total FROM funds";
    const sqlQuery = `
      SELECT 
        funds.*, 
        COALESCE(users.username, 'Unknown') AS username,
        COALESCE(users.avatar, 'default-avatar.png') AS avatar,
        COALESCE(funds.image, 'default-image.png') AS image
      FROM funds
      LEFT JOIN users ON funds.userid = users.id 
      ORDER BY (funds.sort_order IS NULL), funds.sort_order ASC, funds.id DESC 
      LIMIT ? OFFSET ?
    `;
    
    con.query(countQuery, (err, countResult) => {
      if (err) return callback(err);
      const totalFunds = countResult[0].total;
      con.query(sqlQuery, [limit, offset], (err, rows) => {
        if (err) return callback(err);
        callback(null, { totalFunds, rows });
      });
    });
  },

  findAllNoPagination: (callback) => {
    const sqlQuery = `
      SELECT 
        funds.*, 
        COALESCE(users.username, 'Unknown') AS username,
        COALESCE(users.avatar, 'default-avatar.png') AS avatar,
        COALESCE(funds.image, 'default-image.png') AS image
      FROM funds
      LEFT JOIN users ON funds.userid = users.id
      ORDER BY (funds.sort_order IS NULL), funds.sort_order ASC, funds.id DESC
    `;
    con.query(sqlQuery, callback);
  },

reorder: (orderedIds, callback) => {
  if (!orderedIds.length) return callback(null, { affectedRows: 0 });

  const sql = `
    UPDATE funds
    SET sort_order = CASE id
      ${orderedIds.map((id, i) => `WHEN ${id} THEN ${i + 1}`).join(" ")}
    END
    WHERE id IN (${orderedIds.join(",")})
  `;
  con.query(sql, callback);
},


  findPending: (limit, offset, callback) => {
    const query = `
      SELECT 
        funds.*, 
        COALESCE(users.username, 'Unknown') AS username,
        COALESCE(users.avatar, 'default-avatar.png') AS avatar,
        COALESCE(funds.image, 'default-image.png') AS image
      FROM funds
      LEFT JOIN users ON funds.userid = users.id
      WHERE funds.status = 0
      LIMIT ? OFFSET ?
    `;
    con.query(query, [limit, offset], callback);
  },

  findApproved: (limit, offset, callback) => {
    const sql = `
      SELECT 
        f.*, 
        COALESCE(u.username, 'Unknown') AS username,
        COALESCE(u.avatar, 'default-avatar.png') AS avatar,
        COALESCE(h.price, 0) AS latest_price,
        h.created_at AS latest_price_date,
        h.userid AS updated_by,
        COALESCE(f.image, 'default-image.png') AS image
      FROM funds f
      LEFT JOIN users u ON f.userid = u.id
      LEFT JOIN (
        SELECT *
        FROM history h1
        WHERE id IN (
          SELECT MAX(id) FROM history GROUP BY fundid
        )
      ) h ON f.id = h.fundid
      WHERE f.status = 1
      ORDER BY h.created_at IS NULL, h.created_at DESC
      LIMIT ? OFFSET ?
    `;
    con.query(sql, [limit, offset], callback);
  },

  findById: (id, callback) => {
    const sql = `
      SELECT 
        f.*, 
        COALESCE(h.price, 0) AS latest_price, 
        h.created_at AS latest_price_date,
        COALESCE(u.username, 'Unknown') AS username, 
        COALESCE(u.bio, '') AS bio, 
        COALESCE(u.avatar, 'default-avatar.png') AS avatar,
        COALESCE(c.name, '') AS categoryName,
        COALESCE(f.image, 'default-image.png') AS image
      FROM funds f
      LEFT JOIN users u ON f.userid = u.id
      LEFT JOIN category c ON f.catid = c.id
      LEFT JOIN history h ON h.id = (
        SELECT MAX(id) 
        FROM history 
        WHERE fundid = f.id
      )
      WHERE f.id = ?
    `;
    con.query(sql, [id], callback);
  },

  findFundForEmail: (id, callback) => {
    const query = `
      SELECT 
        funds.name AS fundname, 
        COALESCE(users.username, 'Unknown') AS username, 
        users.email
      FROM funds
      LEFT JOIN users ON funds.userid = users.id
      WHERE funds.id = ?
    `;
    con.query(query, [id], callback);
  }
};

export default Fund;
