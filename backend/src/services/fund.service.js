import Fund from "../models/fund.model.js";
import sharp from "sharp";
import nodemailer from "nodemailer";

const processImage = async (file) => {
  if (!file) return null;
  const imageFilename = `image-${Date.now()}.jpeg`;
  await sharp(file.buffer)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`uploads/${imageFilename}`);
  return `uploads/${imageFilename}`;
};

const sendFundStatusUpdateEmail = (username, email, fundName, updateDate, message, messageAdmin) => {
    var resetURL = 'https://uwd.agency/clients/alpha/control-alpha/index.html';
    var logo = 'https://uwd.agency/clients/alpha/wp-content/uploads/2024/06/cropped-logo.png';

    var smtpTransport = nodemailer.createTransport({
        host: 'mail.alpha-odin.com',
        port: 465,
        secure: true, // SSL
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

var mailOptions1 = {
    to: email || process.env.EMAIL_USER,
    from: process.env.EMAIL_USER,
    subject: message,
    html: `...`
};

    smtpTransport.sendMail(mailOptions1);

var mailOptions2 = {
    to: 'karimkarim20444@gmail.com',
    from: process.env.EMAIL_USER,
    subject: messageAdmin,
    html: `...`
};

    smtpTransport.sendMail(mailOptions2);
};

const FundService = {
  createFund: async (data, files, user) => {
    const { name, description, currentprice, currency, subscription_frequency, redemption_frequency, minimum_initial, Minimum_redemption_amount, subscription_fee, redemption_fee, type, annualfee, catid, fund_manager_name, fund_link, created_at } = data;

    const imagePath = await processImage(files.image ? files.image[0] : null);
    const fundManagerImagePath = await processImage(files.fund_manager_image ? files.fund_manager_image[0] : null);

    const datenow = created_at ? new Date(created_at) : new Date();

    const fundData = {
      name,
      description,
      currentprice,
      currency,
      subscription_frequency: subscription_frequency || "N/A",
      redemption_frequency: redemption_frequency || "N/A",
      minimum_initial: minimum_initial || "0",
      Minimum_redemption_amount: Minimum_redemption_amount || "0",
      subscription_fee: subscription_fee || "0",
      redemption_fee: redemption_fee || "0",
      type,
      annualfee,
      catid,
      fund_manager_name,
      fund_manager_image: fundManagerImagePath,
      image: imagePath,
      fund_link,
      userid: user.id,
      status: user.role === "admin" ? 1 : 0,
      created_at: datenow,
    };

    return new Promise((resolve, reject) => {
      Fund.create(fundData, (err, results) => {
        if (err) return reject(err);
        sendFundStatusUpdateEmail(user.name, user.email, name, datenow.toLocaleString(), "Your fund has been added and is awaiting admin approval.", "A new fund has been added and is awaiting your approval.");
        resolve(results);
      });
    });
  },

  updateFund: async (id, data, files, user) => {
    const { name, description, currentprice, currency, subscription_frequency, redemption_frequency, minimum_initial, Minimum_redemption_amount, subscription_fee, redemption_fee, type, annualfee, catid, fund_manager_name, fund_link, created_at } = data;

    const imagePath = await processImage(files.image ? files.image[0] : null);
    const fundManagerImagePath = await processImage(files.fund_manager_image ? files.fund_manager_image[0] : null);

    const datenow = created_at ? new Date(created_at) : new Date();

    const fundData = {
      name,
      description,
      currentprice,
      currency,
      subscription_frequency,
      redemption_frequency,
      minimum_initial,
      Minimum_redemption_amount,
      subscription_fee,
      redemption_fee,
      type,
      annualfee,
      catid,
      fund_manager_name,
      fund_link,
      userid: user.id,
      status: user.role === "admin" ? 1 : 0,
      created_at: datenow,
    };

    if (imagePath) fundData.image = imagePath;
    if (fundManagerImagePath) fundData.fund_manager_image = fundManagerImagePath;

    Object.keys(fundData).forEach(key => (fundData[key] === undefined || fundData[key] === null) && delete fundData[key]);

    return new Promise((resolve, reject) => {
      Fund.update(id, fundData, (err, results) => {
        if (err) return reject(err);
        if (fundData.status === 0) {
            sendFundStatusUpdateEmail(user.name, user.email, name, datenow.toLocaleString(), "Your fund update is waiting for admin approval.", "A fund has been updated and is awaiting approval.");
        }
        resolve(results);
      });
    });
  },

  updateFundPrice: (id, userId, currentprice, newprice) => {
    return new Promise((resolve, reject) => {
      Fund.updatePrice(id, currentprice, newprice, (err, results) => {
        if (err) return reject(err);
        Fund.addPriceHistory({ price: newprice, userid: userId, fundid: id }, (err2, result2) => {
          if (err2) return reject(err2);
          resolve(results);
        });
      });
    });
  },

  updateFundStatus: (id, status, userId) => {
    return new Promise((resolve, reject) => {
      Fund.updateStatus(id, status, (err, results) => {
        if (err) return reject(err);
        if (status === 1) {
          Fund.findById(id, (err, fundResult) => {
            if (err) return reject(err);
            const { currentprice, fundname, username, email, userid } = fundResult[0];
            Fund.addPriceHistory({ fundid: id, userid, price: currentprice }, (err, historyResult) => {
              if (err) return reject(err);
              sendFundStatusUpdateEmail(username, email, fundname, new Date().toLocaleString(), 'Your fund price accepted from admin', 'Sucess Publish The fund for acceptance');
              resolve(historyResult);
            });
          });
        } else {
            Fund.findById(id, (err, fundResult) => {
                if (err) return reject(err);
                const { fundname, username, email } = fundResult[0];
                sendFundStatusUpdateEmail(username, email, fundname, new Date().toLocaleString(), 'Your fund Not accepted from admin', 'Waiting to another edit for The fund');
                resolve(results);
            });
        }
      });
    });
  },

  declineFundStatus: (id, message) => {
      return new Promise((resolve, reject) => {
          Fund.updateStatus(id, 0, (err, results) => {
              if(err) return reject(err);
              Fund.findFundForEmail(id, (err, fundResult) => {
                  if(err) return reject(err);
                  const { fundname, username, email } = fundResult[0];
                  sendFundStatusUpdateEmail(username, email, fundname, new Date().toLocaleString(), message, 'We sent the reason for the fund creator');
                  resolve(results);
              });
          });
      });
  },

  deleteFund: (id) => {
    return new Promise((resolve, reject) => {
      Fund.delete(id, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  getFundsForUser: (userId, page) => {
    const limit = 20;
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
      Fund.findByUser(userId, limit, offset, (err, rows) => {
        if (err) return reject(err);
        resolve({ funds_page_count: rows.length, page_number: page, funds_all: rows });
      });
    });
  },

  getAllFunds: (page) => {
    const limit = 10;
    const offset = (page - 1) * limit;
    return new Promise((resolve, reject) => {
      Fund.findAll(limit, offset, (err, data) => {
        if (err) return reject(err);
        resolve({ funds_page_count: data.rows.length, page_number: page, total_funds: data.totalFunds, funds_all: data.rows });
      });
    });
  },

  getAllFundsNoPagination: () => {
    return new Promise((resolve, reject) => {
      Fund.findAllNoPagination((err, rows) => {
        if (err) return reject(err);
        resolve({ funds_all: rows, count: rows.length });
      });
    });
  },

  reorderFunds: (orderedIds) => {
      return new Promise((resolve, reject) => {
          Fund.reorder(orderedIds, (err, result) => {
              if(err) return reject(err);
              resolve(result);
          });
      });
  },

  getPendingFunds: (page) => {
      const limit = 20;
      const offset = (page - 1) * limit;
      return new Promise((resolve, reject) => {
          Fund.findPending(limit, offset, (err, rows) => {
              if(err) return reject(err);
              resolve({ funds_page_count: rows.length, page_number: page, funds_all: rows });
          });
      });
  },

  getApprovedFunds: (page) => {
      const limit = 20;
      const offset = (page - 1) * limit;
      return new Promise((resolve, reject) => {
          Fund.findApproved(limit, offset, (err, rows) => {
              if(err) return reject(err);
              resolve({ funds_page_count: rows.length, page_number: page, funds_all: rows });
          });
      });
  },

  getFundDetails: (id) => {
      return new Promise((resolve, reject) => {
          Fund.findById(id, (err, rows) => {
              if(err) return reject(err);
              // Process rows to structure the data as in the original code
              const fundDetails = { ...rows[0] }; // simplified
              resolve({ fundDetails });
          });
      });
  }
};

export default FundService;