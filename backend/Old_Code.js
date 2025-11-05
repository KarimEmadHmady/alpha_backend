

const upload = multer({
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
  fileFilter(req, file, cb) {
    const allowedExtensions = /\.(jpg|jpeg|png|webp|pdf|doc|docx|xls|xlsx|ppt|pptx|txt)$/i;

    if (!file.originalname.match(allowedExtensions)) {
      return cb(new Error("Please upload a valid file type"));
    }
    cb(undefined, true);
  },
});



// Create a new fund (admin/manager only), handles image and fund manager image upload
router.post(
  "",
  auth,
  authController.restrictTo("admin", "manager"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "fund_manager_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        name_arabic,
        description,
        description_arabic,
        currentprice,
        currency,
        currency_arabic,
        subscription_frequency,
        Subscription_frequency_arabic,
        redemption_frequency,
        Redemption_frequency_arabic,
        minimum_initial,
        Minimum_Initial_arabic,
        Minimum_redemption_amount,
        Minimum_redemption_amount_arabic,
        subscription_fee,
        Subscription_Fee_arabic,
        redemption_fee,
        Redemption_Fee_arabic,
        type,
        type_arabic,
        annualfee,
        catid,
        fund_manager_name,
        fund_manager_name_arabic,
        fund_link,
        created_at, 
      } = req.body;

      const user = req.user;
      const status = user.role === "admin" ? 1 : 0;

      // صور
      const url = req.protocol + "://" + req.get("host");

      let imagePath = null;
      if (req.files.image) {
        const imageFile = req.files.image[0];
        const imageFilename = `image-${Date.now()}.jpeg`;
        await sharp(imageFile.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`backend/images/${imageFilename}`);
        imagePath = `${url}/backend/images/${imageFilename}`;
      }

      let fundManagerImagePath = null;
      if (req.files.fund_manager_image) {
        const imageFile = req.files.fund_manager_image[0];
        const imageFilename = `fund_manager-${Date.now()}.jpeg`;
        await sharp(imageFile.buffer)
          .toFormat("jpeg")
          .jpeg({ quality: 90 })
          .toFile(`backend/images/${imageFilename}`);
        fundManagerImagePath = `${url}/backend/images/${imageFilename}`;
      }

      // التاريخ الحالي أو المرسل
      const datenow = created_at ? new Date(created_at) : new Date();
      const formattedDate = datenow.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

const values = {
  name,
  name_arabic,
  description,
  description_arabic,
  currentprice,
  currency,
  currency_arabic,
  Subscription_frequency: subscription_frequency || "N/A",
  Subscription_frequency_arabic,
  Redemption_frequency: redemption_frequency || "N/A",
  Redemption_frequency_arabic,
  Minimum_Initial: minimum_initial || "0",
  Minimum_Initial_arabic,
  Minimum_redemption_amount: Minimum_redemption_amount || "0",
  Minimum_redemption_amount_arabic,
  Subscription_Fee: subscription_fee || "0",
  Subscription_Fee_arabic,
  Redemption_Fee: redemption_fee || "0",
  Redemption_Fee_arabic,
  type,
  type_arabic,
  annualfee,
  catid,
  fund_manager_name: coerceNamesToJson(fund_manager_name),
  fund_manager_name_arabic: coerceNamesToJson(fund_manager_name_arabic),
  fund_manager_image: fundManagerImagePath,
  image: imagePath,
  fund_link,
  userid: user.id,
  status,
  created_at: datenow,
  langid: 2,
  en_id: 2,
  ar_id: 1,
};



      con.query("INSERT INTO funds SET ?", values, async (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: 0, message: "Database error", error: err });
        }

        res.status(201).json({ success: 1, message: "Fund created", data: values });

        // Send email
        const userName = user.name;
        const userEmail = user.email;
        const fundname = name;
        const Message = "Your fund has been added and is awaiting admin approval.";
        const Messageadmin = "A new fund has been added and is awaiting your approval.";

        sendFundStatusUpdateEmail(userName, userEmail, fundname, formattedDate, Message, Messageadmin);
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ success: 0, message: "Server error", error: e.message });
    }
  }
);

// Update fund price and status (admin/manager only), saves price history if admin
router.put("/:id(\\d+)", auth, authController.restrictTo('admin', 'manager'), upload.fields([
  { name: "image", maxCount: 1 },
  { name: "fund_manager_image", maxCount: 1 },
]), async (req, res) => {
  try {
    const fundId = req.params.id;
    const {
      name,
      name_arabic,
      description,
      description_arabic,
      currentprice,
      currency,
      currency_arabic,
      subscription_frequency,
      Subscription_frequency_arabic,
      redemption_frequency,
      Redemption_frequency_arabic,
      minimum_initial,
      Minimum_Initial_arabic,
      subscription_fee,
      Subscription_Fee_arabic,
      Minimum_redemption_amount,
      Minimum_redemption_amount_arabic,
      redemption_fee,
      Redemption_Fee_arabic,
      type,
      type_arabic,
      annualfee,
      catid,
      fund_manager_name,
      fund_manager_name_arabic,
      fund_link,
      created_at
    } = req.body;

    const user = req.user;
    const status = user.role === "admin" ? 1 : 0;
    const url = req.protocol + "://" + req.get("host");

    let imagePath = null;
    if (req.files.image) {
      const imageFile = req.files.image[0];
      const imageFilename = `image-${Date.now()}.jpeg`;
      await sharp(imageFile.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`backend/images/${imageFilename}`);
      imagePath = `${url}/backend/images/${imageFilename}`;
    }

    let fundManagerImagePath = null;
    if (req.files.fund_manager_image) {
      const imageFile = req.files.fund_manager_image[0];
      const imageFilename = `fund_manager-${Date.now()}.jpeg`;
      await sharp(imageFile.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`backend/images/${imageFilename}`);
      fundManagerImagePath = `${url}/backend/images/${imageFilename}`;
    }

    const datenow = created_at ? new Date(created_at) : new Date();
    const formattedDate = datenow.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const updateValues = {
      name,
      name_arabic,
      description,
      description_arabic,
      currentprice,
      currency,
      currency_arabic,
      subscription_frequency,
      Subscription_frequency_arabic,
      redemption_frequency,
      Redemption_frequency_arabic,
      minimum_initial,
      Minimum_Initial_arabic,
      subscription_fee,
      Subscription_Fee_arabic,
      Minimum_redemption_amount,
      Minimum_redemption_amount_arabic,
      redemption_fee,
      Redemption_Fee_arabic,
      type,
      type_arabic,
      annualfee,
      catid,
      fund_manager_name: coerceNamesForUpdate(fund_manager_name),
      fund_manager_name_arabic: coerceNamesForUpdate(fund_manager_name_arabic),
      fund_link,
      fund_manager_image: fundManagerImagePath,
      image: imagePath,
      userid: user.id,
      status,
      created_at: datenow,
      langid: 2,
      en_id: 2,
      ar_id: 1,
    };
    
    // Remove image fields from update if not uploading new ones
    if (!imagePath) {
      delete updateValues.image;
    }
    if (!fundManagerImagePath) {
      delete updateValues.fund_manager_image;
    }

    Object.keys(updateValues).forEach((key) => {
      if (
        updateValues[key] === undefined ||
        updateValues[key] === null ||
        updateValues[key] === ''
      ) {
        delete updateValues[key];
      }
    });

    const sql = "UPDATE funds SET ? WHERE id = ?";
    con.query(sql, [updateValues, fundId], function (err, results) {
      if (err) {
        console.error(err);
        return res.status(500).json({
          success: 0,
          message: "Database connection error",
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({
          success: 0,
          message: "Fund not found",
        });
      }

      res.json({
        success: 1,
        message: "Fund updated successfully",
        results,
      });

      // Send email notification
      const userName = user.name;
      const userEmail = user.email;
      const fundName = name;
      const message = "Your fund update is waiting for admin approval.";
      const messageAdmin = "A fund has been updated and is awaiting approval.";
      sendFundStatusUpdateEmail(userName, userEmail, fundName, formattedDate, message, messageAdmin);
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: 0,
      message: "An unexpected error occurred",
    });
  }
});

router.put(
  "/:id(\\d+)/price",
  auth,
  authController.restrictTo('admin', 'manager'),
  async (req, res) => {
    try {
      const fundId = req.params.id;
      const userId = req.user.id; // Assuming `auth` middleware adds user to req
      const { currentprice, newprice } = req.body;

      if (typeof currentprice === 'undefined' || typeof newprice === 'undefined') {
        return res.status(400).json({
          success: 0,
          message: "Both currentprice and newprice are required."
        });
      }

      // Step 1: Update fund price
      const sqlUpdate = "UPDATE funds SET currentprice = ?, newprice = ? WHERE id = ?";
      con.query(sqlUpdate, [currentprice, newprice, fundId], function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: 0,
            message: "Database connection error (updating fund)",
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: 0,
            message: "Fund not found",
          });
        }

        // Step 2: Insert price change into history table
        const sqlInsertHistory = "INSERT INTO history (price, userid, fundid) VALUES (?, ?, ?)";
        con.query(sqlInsertHistory, [newprice, userId, fundId], function (err2, result2) {
          if (err2) {
            console.error("Error inserting history:", err2);
            return res.status(500).json({
              success: 0,
              message: "Price updated but failed to log history",
            });
          }

          res.json({
            success: 1,
            message: "Fund price updated and history logged successfully",
            results
          });
        });
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: 0,
        message: "An unexpected error occurred",
      });
    }
  }
);

// Update fund (admin/manager only), uploads image and fund manager image
router.put(
  "/allfund/:id(\\d+)",
  auth,
  authController.restrictTo("admin", "manager"),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "fund_manager_image", maxCount: 1 },
  ]),
  async (req, res) => {
    const fundId = req.params.id;
    const userId = req.user.id;
    const status = req.user.role === "admin" ? 1 : 0;

    const datenow = Date.now();
    const formattedDate = new Date(datenow).toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    const url = req.protocol + "://" + req.get("host");

    // معالجة رفع الصور
    let imagePath = null;
    if (req.files.image) {
      const imageFile = req.files.image[0];
      const imageFilename = `image-${Date.now()}.jpeg`;
      await sharp(imageFile.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`backend/images/${imageFilename}`);
      imagePath = `${url}/backend/images/${imageFilename}`;
    }

    let fundManagerImagePath = null;
    if (req.files.fund_manager_image) {
      const fundManagerFile = req.files.fund_manager_image[0];
      const fundManagerFilename = `fund_manager_image-${Date.now()}.jpeg`;
      await sharp(fundManagerFile.buffer)
        .toFormat("jpeg")
        .jpeg({ quality: 90 })
        .toFile(`backend/images/${fundManagerFilename}`);
      fundManagerImagePath = `${url}/backend/images/${fundManagerFilename}`;
    }


    try {
      // إعداد القيم للتحديث
      const updateValues = {
        name: req.body.name,
        description: req.body.description,
        currency: req.body.currency,
        image: imagePath,
        fund_manager_image: fundManagerImagePath,
        userid: userId,
        fund_link: req.body.fund_link,
        subscription_frequency: req.body.subscription_frequency,
        redemption_frequency: req.body.redemption_frequency,
        minimum_initial: req.body.minimum_initial,
        minimum_initial_arabic: req.body.minimum_initial_arabic,
        subscription_fee: req.body.subscription_fee,
        Subscription_Fee_arabic: req.body.Subscription_Fee_arabic,
        Minimum_redemption_amount: req.body.Minimum_redemption_amount,
        Minimum_redemption_amount_arabic: req.body.Minimum_redemption_amount_arabic ,
        redemption_fee: req.body.redemption_fee,
        Redemption_Fee_arabic: req.body.Redemption_Fee_arabic,
        type: req.body.type,
        annualfee: req.body.annualfee,
        catid: req.body.catid,
        name_arabic: req.body.name_arabic,
        currency_arabic: req.body.currency_arabic,
        description_arabic: req.body.description_arabic,
        Subscription_frequency_arabic: req.body.Subscription_frequency_arabic,
        Redemption_frequency_arabic: req.body.Redemption_frequency_arabic,
        type_arabic: req.body.type_arabic,
        fund_manager_name_arabic: coerceNamesForUpdate(req.body.fund_manager_name_arabic),
        fund_manager_name: coerceNamesForUpdate(req.body.fund_manager_name),
        langid: 2,
        en_id: 2,
        ar_id: 1,
        status: status,
      };

      // لو فيه تاريخ مخصص
      if (req.body.created_at) {
        updateValues.created_at = req.body.created_at;
      }

      // لو مفيش صور جديدة ما تبعتش القيمة
      if (!imagePath) delete updateValues.image;
      if (!fundManagerImagePath) delete updateValues.fund_manager_image;

      // فلترة القيم الفاضية أو null أو undefined
      Object.keys(updateValues).forEach((key) => {
        if (
          updateValues[key] === undefined ||
          updateValues[key] === null ||
          updateValues[key] === ""
        ) {
          delete updateValues[key];
        }
      });

      // طباعة القيم قبل التحديث (للاختبار)
      console.log("Update Values Sent to DB:", updateValues);

      // تحديث في قاعدة البيانات
      const sql = "UPDATE funds SET ? WHERE id = ?";
      con.query(sql, [updateValues, fundId], function (err, results) {
        if (err) {
          console.error(err);
          return res.status(500).json({
            success: 0,
            message: "Database connection error",
          });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({
            success: 0,
            message: "Fund not found",
          });
        }

        res.json({
          success: 1,
          message: "Fund updated successfully",
          results,
        });

        // إرسال الإيميل لو الحالة Pending
        if (status === 0) {
          const userName = req.user.name;
          const userEmail = req.user.email;
          const fundName = req.body.name;
          const message = "Your fund update is waiting for admin approval.";
          const messageAdmin =
            "A fund has been updated and is awaiting approval.";
          sendFundStatusUpdateEmail(
            userName,
            userEmail,
            fundName,
            formattedDate,
            message,
            messageAdmin
          );
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: 0,
        message: "An unexpected error occurred",
      });
    }
  }
);


// Change fund status (admin only), accepts or refuses fund and sends notification
router.put("/status/:id(\\d+)", auth, authController.restrictTo('admin'), async (req, res) => {
  try {
    // تأكد أن status رقم
    const status = Number(req.body.status);
    const { id } = req.params;
    if (isNaN(status)) {
      return res.status(400).json({ error: "Status must be a number" });
    }
    console.log(status);
    // Fetch the current user ID from the authentication middleware
    var userId = req.user.id;
    // Update the status in the funds table مباشرة
    var updateSql = "UPDATE funds SET status = ? WHERE id = ?";
    con.query(updateSql, [status, id], function (err, results) {
      if (err) {
        return res.status(500).send({ error: 'An error occurred while updating the fund.' });
      }
      // Check if status is 1 before proceeding
      if (status === 1) {
        // Join funds table with users table and fetch current price, name, and email
        var getCurrentPriceSql = `
          SELECT funds.id,funds.currentprice, funds.name AS fundname, users.username, users.email, funds.userid
          FROM funds
          JOIN users ON funds.userid = users.id
          WHERE funds.id = ?`;
        con.query(getCurrentPriceSql, [id], function (err, fundResult) {
          if (err) {
            return res.status(500).send({ error: 'An error occurred while fetching the current price.' });
          }
          var fundid = fundResult[0].id;
          var currentPrice = fundResult[0].currentprice;
          var fundname = fundResult[0].fundname;
          var userName = fundResult[0].username;
          var userEmail = fundResult[0].email;
          var userId = fundResult[0].userid;
          console.log('Insert into history:', { fundid, userId, currentPrice }); // طباعة القيم
          // Format the current date
          var currentDate = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Cairo', // Egypt's time zone
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
          console.log('Your price accept');
          // Insert into history table
          const insertSql = "INSERT INTO history (fundid,userid, price) VALUES (?, ?, ?)";
          con.query(insertSql, [fundid,userId, currentPrice], function (err, historyResult) {
            if (err) {
              console.error('History Insert Error:', err); // طباعة الخطأ الحقيقي
              return res.status(500).send({ error: 'An error occurred while inserting into the history table.' });
            } else {
              res.send('Success Edit');
              var Message = 'Your fund price accepted from admin';
              var Messageadmin = 'Sucess Publish The fund for acceptance';
              sendFundStatusUpdateEmail(userName, userEmail, fundname, currentDate, Message, Messageadmin);
            }
          });
        });
      } else {
        // If status is not 1, do not insert into history
        var getCurrentPriceSql = `
                SELECT funds.currentprice, funds.name AS fundname, users.username, users.email, funds.userid
                FROM funds
                JOIN users ON funds.userid = users.id
                WHERE funds.id = ?`;
        con.query(getCurrentPriceSql, [id], function (err, fundResult) {
          if (err) {
            return res.status(500).send({ error: 'An error occurred while fetching the current price.' });
          }
          var currentPrice = fundResult[0].currentprice;
          var fundname = fundResult[0].fundname;
          var userName = fundResult[0].username;
          var userEmail = fundResult[0].email;
          var userId = fundResult[0].userid;
          var Message = 'Your fund price refused';
          console.log(currentPrice, fundname, userName, userEmail, userId);
          console.log('Your price refused');
          // Format the current date
          var currentDate = new Date().toLocaleString('en-US', {
            timeZone: 'Africa/Cairo', // Egypt's time zone
            month: 'short',
            day: '2-digit',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          });
          var Message = 'Your fund Not accepted from admin';
          var Messageadmin = 'Waiting to another edit for The fund';
          sendFundStatusUpdateEmail(userName, userEmail, fundname, currentDate, Message, Messageadmin);
        });
        res.send('Success Edit (Status is not 1)');
      }
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Decline fund status with a reason (admin only), sends notification to creator
router.put("/status/decline/:id(\\d+)", auth, authController.restrictTo('admin'), async (req, res) => {
  try {
    var message = req.body.message;
    const { id } = req.params;
    console.log('message');
    // Fetch the current user ID from the authentication middleware
    var userId = req.user.id;
    
    var checkStatusSql = "SELECT status FROM funds WHERE id = ?";
    con.query(checkStatusSql, [id], function (err, checkResult) {
      if (err) {
        return res.status(500).send({ error: 'An error occurred while checking the current status.' });
      }
            // Update the status in the funds table
            var updateSql = "UPDATE funds SET status = 0 WHERE id = ?";
            con.query(updateSql, [id], function (err, results) {
              if (err) {
                return res.status(500).send({ error: 'An error occurred while updating the fund.' });
              }
                // If status is not 1, do not insert into history
                var getCurrentPriceSql = `
                        SELECT funds.currentprice, funds.name AS fundname, users.username, users.email, funds.userid
                        FROM funds
                        JOIN users ON funds.userid = users.id
                        WHERE funds.id = ?`;
              
                        con.query(getCurrentPriceSql, [id], function (err, fundResult) {
                          if (err) {
                            return res.status(500).send({ error: 'An error occurred while fetching the current price.' });
                          }
                
                          var currentPrice = fundResult[0].currentprice;
                          var fundname = fundResult[0].fundname;
                          var userName = fundResult[0].username;
                          var userEmail = fundResult[0].email;
                          var userId = fundResult[0].userid;
                          var Message = message;
                          console.log(currentPrice, fundname, userName, userEmail, userId);
                          console.log('Your price refused');
                          // Format the current date
                          var currentDate = new Date().toLocaleString('en-US', {
                            timeZone: 'Africa/Cairo', // Egypt's time zone
                            month: 'short',
                            day: '2-digit',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: 'numeric',
                            hour12: true,
                          });
                          var Messageadmin = 'We sent the reason for the fund creator';
                          sendFundStatusUpdateEmail(userName, userEmail, fundname, currentDate, Message, Messageadmin);
                        });
                res.send('Success Edit Status');
              
            });
            
    })
  } catch (e) {
    res.status(400).send(e);
  }
});




// Send email notification about fund status update
function sendFundStatusUpdateEmail(username,email,fundName, updateDate,Message,Messageadmin) {
  var resetURL = 'https://uwd.agency/clients/alpha/control-alpha/index.html';
  var logo = 'https://uwd.agency/clients/alpha/wp-content/uploads/2024/06/cropped-logo.png';
  console.log(logo)
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
    to: email,
    from: 'mail.alpha-odin.com',
    subject: Message,
    html: `
      <html>
        <head>
          <meta name="viewport" content="width=device-width" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        </head>
        <body>
          <table bgcolor="#fafafa" style="width: 100%!important; height: 100%; background-color: #fafafa; padding: 20px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 100%; line-height: 1.6;">
            <tr>
              <td></td>
              <td bgcolor="#FFFFFF" style="border: 1px solid #eeeeee; background-color: #ffffff; border-radius:5px; display:block!important; max-width:600px!important; margin:0 auto!important; clear:both!important;">
                <div style="padding:20px; max-width:600px; margin:0 auto; display:block;">
                  <table style="width: 100%;">
                    <tr>
                      <td>
                        <p style="text-align: center; display: block; padding-bottom:20px; margin-bottom:20px; border-bottom:1px solid #dddddd;">
                          <img style="width:150px" src="${logo}"/>
                        </p>
                        <p style="margin-bottom: 10px; font-weight: normal; font-size:16px; color: #333333;"><strong style="font-weight:600">${Message} - ${fundName}</p>
                        <h2 style="font-weight: 200; font-size: 16px; margin: 20px 0; color: #333333;"> Date: ${updateDate} </h2>
                        <p style="text-align: center; display: block; padding-top:20px; font-weight: bold; margin-top:30px; color: #666666; border-top:1px solid #dddddd;">
                          Click <a href="${resetURL}">here</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
              <td></td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  smtpTransport.sendMail(mailOptions1, function (err, data) {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Message sent:', data.response);
    }
  });


  var mailOptions2 = {
    to: 'info@alpha-odin.com', // add email manager or any other admin email to send copy from email
    from: process.env.EMAIL_USER,
    subject: Message,
    html: `
      <html>
        <head>
          <meta name="viewport" content="width=device-width" />
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        </head>
        <body>
          <table bgcolor="#fafafa" style="width: 100%!important; height: 100%; background-color: #fafafa; padding: 20px; font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 100%; line-height: 1.6;">
            <tr>
              <td></td>
              <td bgcolor="#FFFFFF" style="border: 1px solid #eeeeee; background-color: #ffffff; border-radius:5px; display:block!important; max-width:600px!important; margin:0 auto!important; clear:both!important;">
                <div style="padding:20px; max-width:600px; margin:0 auto; display:block;">
                  <table style="width: 100%;">
                    <tr>
                      <td>
                        <p style="text-align: center; display: block; padding-bottom:20px; margin-bottom:20px; border-bottom:1px solid #dddddd;">
                          <img style="width:150px" src="${logo}"/>
                        </p>
                        <p style="margin-bottom: 10px; font-weight: normal; font-size:16px; color: #333333;"><strong style="font-weight:600">${Messageadmin} called - ${fundName}</p>
                        <h2 style="font-weight: 200; font-size: 16px; margin: 20px 0; color: #333333;"> Date: ${updateDate} </h2>
                        <p style="text-align: center; display: block; padding-top:20px; font-weight: bold; margin-top:30px; color: #666666; border-top:1px solid #dddddd;">
                          Click <a href="${resetURL}">here</a>
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
              <td></td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };

  smtpTransport.sendMail(mailOptions2, function (err, data) {
    if (err) {
      console.error('Error sending email:', err);
    } else {
      console.log('Message sent:', data.response);
    }
  });

}

// Delete a fund by ID
router.delete('/:id(\\d+)', async (req, res) => {
    const _id = req.params.id;
    var sql = "DELETE FROM funds WHERE id ="+_id+"";
    con.query(sql, function (err, rows) {
      if (!err) res.send('Delete fund sucess');
      console.log('error')
    })
})

// Get funds for the current user (admin/manager only), paginated
router.get('/me', auth, authController.restrictTo('admin', 'manager'), async (req, res) => {
  const _id = req.user.id;
  const limit = 20;
  // page number
  const page = req.query.page ? parseInt(req.query.page) : 1;
  
  if (isNaN(page) || page < 1) {
    return res.status(400).send({ error: "Invalid page number" });
  }

  // calculate offset
  const offset = (page - 1) * limit;

  const sql = "SELECT * FROM `funds` WHERE userid = ? LIMIT ? OFFSET ?";
  
  con.query(sql, [_id, limit, offset], function (err, rows) {
    if (err) {
      console.error(err);
      return res.status(500).send({ error: "Internal Server Error" });
    }

    res.send({
      funds_page_count: rows.length,
      page_number: page,
      funds_all: rows,
    });
  });
});

// Get all funds with pagination, includes username
router.get("", async (req, res, next) => {
  try {
    const limit = 10; // Number of funds per page
    const page = req.query.page ? parseInt(req.query.page) : 1;

    if (isNaN(page) || page < 1) {
      return res.status(400).send({ error: "Invalid page number" });
    }

    const offset = (page - 1) * limit;

    // Query to get the total count of funds
    const countQuery = "SELECT COUNT(*) AS total FROM funds";
    const sqlQuery = `
      SELECT funds.*, users.username 
      FROM funds 
      JOIN users ON funds.userid = users.id 
      ORDER BY (funds.sort_order IS NULL), funds.sort_order ASC, funds.id DESC 
      LIMIT ? OFFSET ?`;

    ensureSortOrderColumn(() => {
      con.query(countQuery, [], (err, countResult) => {
        if (err) {
          console.error(err);
          return res.status(500).send({ error: "Internal Server Error", code: err.code, message: err.sqlMessage || err.message });
        }

        const totalFunds = countResult[0].total;

        const sendSuccess = (rows) => res.send({
          funds_page_count: rows.length,
          page_number: page,
          total_funds: totalFunds,
          funds_all: rows,
        });

        con.query(sqlQuery, [limit, offset], (err, rows) => {
          if (!err) return sendSuccess(rows);
          // Fallback if sort_order column doesn't exist or permission issue
          if (err && (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_FIELD')) {
            const fallbackSql = `
              SELECT funds.*, users.username
              FROM funds
              JOIN users ON funds.userid = users.id
              ORDER BY funds.id DESC
              LIMIT ? OFFSET ?`;
            return con.query(fallbackSql, [limit, offset], (fbErr, fbRows) => {
              if (fbErr) {
                console.error(fbErr);
                return res.status(500).send({ error: "Internal Server Error", code: fbErr.code, message: fbErr.sqlMessage || fbErr.message });
              }
              return sendSuccess(fbRows);
            });
          }
          console.error(err);
          return res.status(500).send({ error: "Internal Server Error", code: err.code, message: err.sqlMessage || err.message });
        });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Get all funds (no pagination), includes username
router.get("/all", async (req, res) => {
  try {
    const sqlQuery = `
      SELECT funds.*, users.username
      FROM funds
      JOIN users ON funds.userid = users.id
      ORDER BY (funds.sort_order IS NULL), funds.sort_order ASC, funds.id DESC`;

    ensureSortOrderColumn(() => {
      const sendSuccess = (rows) => res.send({ funds_all: rows, count: rows.length });
      con.query(sqlQuery, [], (err, rows) => {
        if (!err) return sendSuccess(rows);
        if (err && (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_FIELD')) {
          const fallbackSql = `
            SELECT funds.*, users.username
            FROM funds
            JOIN users ON funds.userid = users.id
            ORDER BY funds.id DESC`;
          return con.query(fallbackSql, [], (fbErr, fbRows) => {
            if (fbErr) {
              console.error(fbErr);
              return res.status(500).send({ error: "Internal Server Error", code: fbErr.code, message: fbErr.sqlMessage || fbErr.message });
            }
            return sendSuccess(fbRows);
          });
        }
        console.error(err);
        return res.status(500).send({ error: "Internal Server Error", code: err.code, message: err.sqlMessage || err.message });
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Reorder funds (admin only) by updating sort_order in bulk
router.put('/reorder', auth, authController.restrictTo('admin'), async (req, res) => {
  try {
    const rawIds = Array.isArray(req.body.orderedIds) ? req.body.orderedIds : [];
    const orderedIds = rawIds
      .map((v) => parseInt(v, 10))
      .filter((v) => Number.isInteger(v) && v > 0);

    if (!orderedIds.length) {
      return res.status(400).json({
        success: 0,
        message: 'orderedIds must be a non-empty array of integers',
      });
    }

    // Build single UPDATE with CASE for efficiency
    const cases = orderedIds.map((id, index) => `WHEN ${id} THEN ${index + 1}`).join(' ');
    const idsList = orderedIds.join(',');
    const updateSql = `
      UPDATE \`funds\`
      SET \`sort_order\` = CASE \`id\` ${cases} END
      WHERE \`id\` IN (${idsList})
    `;

    con.query(updateSql, [], (updateErr, result) => {
      if (updateErr) {
        console.error('Bulk reorder failed:', updateErr);
    
        // Send detailed error info
        return res.status(500).json({
          success: 0,
          message: 'Bulk update failed',
          code: updateErr.code,
          detail: updateErr.sqlMessage || updateErr.message,
          sql: updateSql,
        });
      }
    

      // If no rows updated, warn
      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: 0,
          message: 'No rows were updated. Check if IDs exist in database.',
        });
      }

      return res.json({
        success: 1,
        updated: result.affectedRows,
      });
    });
  } catch (e) {
    console.error('Unexpected error:', e);
    return res.status(500).json({
      success: 0,
      message: 'Unexpected server error',
      detail: e.message,
    });
  }
});


// Get all funds with status = 0 (pending), paginated
router.get("/status", async (req, res, next) => {
  try {
    const limit = 20;
    // page number
    const page = req.query.page ? parseInt(req.query.page) : 1;
    
    if (isNaN(page) || page < 1) {
      return res.status(400).send({ error: "Invalid page number" });
    }

    // calculate offset
    const offset = (page - 1) * limit;

    var sql = "SELECT funds.*, users.username FROM `funds` JOIN `users` ON funds.userid = users.id WHERE funds.status = 0 LIMIT ? OFFSET ?";
    
    con.query(sql, [limit, offset], function (err, rows) {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: "Internal Server Error" });
      }

      res.send({
        funds_page_count: rows.length,
        page_number: page,
        funds_all: rows,
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

// Get all funds with status = 1 (approved), paginated, with latest history date
router.get("/approved", async (req, res, next) => {
  try {
    const limit = 20;
    const page = req.query.page ? parseInt(req.query.page) : 1;

    if (isNaN(page) || page < 1) {
      return res.status(400).send({ error: "Invalid page number" });
    }

    const offset = (page - 1) * limit;

    const sql = `
    SELECT 
      f.*, 
      u.username,
      h.price AS latest_price,
      h.date AS latest_date,
      h.userid AS updated_by
    FROM funds f
    JOIN users u ON f.userid = u.id
    LEFT JOIN (
      SELECT *
      FROM history h1
      WHERE id IN (
        SELECT MAX(id) FROM history GROUP BY fundid
      )
    ) h ON f.id = h.fundid
    WHERE f.status = 1
    ORDER BY h.date IS NULL, h.date DESC
    LIMIT ? OFFSET ?
    `;

    con.query(sql, [limit, offset], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send({ error: "Internal Server Error" });
      }

      res.send({
        funds_page_count: rows.length,
        page_number: page,
        funds_all: rows,
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ error: "Internal Server Error" });
  }
});


// Get details for a specific fund by ID, includes history, documents, entities, user, and category info
router.get('/:id(\\d+)', async (req, res) => {
  const _id = req.params.id;

  try {
    var  sql = `
  SELECT funds.*, history.price, history.date,
  documents.id AS documentId, documents.document, 
  documents.linkdoc, documents.upload_time,
  entities.id AS entityId, entities.entname, 
  entities.link, entities.imageent,
  fm.id AS managerId, fm.name AS managerName, fm.name_arabic AS managerNameArabic, fm.image AS managerImage,
  users.username, users.bio, users.avatar,
  category.name AS categoryName, category.name_arabic AS categoryArabicName
  FROM funds
  LEFT JOIN history ON funds.id = history.fundid
  LEFT JOIN documents ON funds.id = documents.fundid
  LEFT JOIN entities ON funds.id = entities.fundid
  LEFT JOIN fund_managers fm ON funds.id = fm.fundid
  LEFT JOIN users ON funds.userid = users.id
  LEFT JOIN category ON funds.catid = category.id
  WHERE funds.id = ${_id}
`;

    con.query(sql, function (err, rows) {
      if (!err) {
        const prices = rows.map(row => row.price);
        const dates = rows.map(row => row.date);

        // Remove duplicate documents but include ID
        const documents = Array.from(new Map(
          rows
            .filter(row => row.document && row.linkdoc)
            .map(row => [
              `${row.document}_${row.linkdoc}`, 
              { 
                id: row.documentId,
                document: row.document, 
                linkdoc: row.linkdoc ,
                upload_time: row.upload_time // 👈 أضف السطر ده
              }
            ])
        ).values());

        // Remove duplicate entities but include ID
        const entities = Array.from(new Map(
          rows
            .filter(row => row.entname && row.link && row.imageent)
            .map(row => [
              `${row.entname}_${row.link}_${row.imageent}`, 
              { 
                id: row.entityId,
                entname: row.entname, 
                link: row.link, 
                imageent: row.imageent 
              }
            ])
        ).values());

        const fundDetails = {
          id: rows[0].id,
          name: rows[0].name,
          currentprice: rows[0].currentprice,
          currency: rows[0].currency,
          image: rows[0].image,
          fund_link: rows[0].fund_link,
          description: rows[0].description,
          Subscription_frequency: rows[0].Subscription_frequency,
          Redemption_frequency: rows[0].Redemption_frequency,
          Minimum_Initial: rows[0].Minimum_Initial,
          Minimum_Initiall_arabic: rows[0].Minimum_Initial_arabic,
          Subscription_Fee: rows[0].Subscription_Fee,
          Subscription_Fee_arabic: rows[0].Subscription_Fee_arabic,
          Minimum_redemption_amount: rows[0].Minimum_redemption_amount,
          Minimum_redemption_amount_arabic: rows[0].Minimum_redemption_amount_arabic,
          Redemption_Fee: rows[0].Redemption_Fee,
          Redemption_Fee_arabic: rows[0].Redemption_Fee_arabic,
          type: rows[0].type,
          annualfee: rows[0].annualfee,
          username: rows[0].username,
          bio: rows[0].bio,
          date: rows[0].date,
          created_at: rows[0].created_at,
          avatar: rows[0].avatar,
          name_arabic: rows[0].name_arabic,
          currency_arabic: rows[0].currency_arabic,
          description_arabic: rows[0].description_arabic,
          type_arabic: rows[0].type_arabic,
          fund_manager_name_arabic: rows[0].fund_manager_name_arabic,
          fund_manager_name: rows[0].fund_manager_name,
          fund_manager_names: parseNamesFromDb(rows[0].fund_manager_name),
          fund_manager_names_arabic: parseNamesFromDb(rows[0].fund_manager_name_arabic),
          fund_manager_image: rows[0].fund_manager_image,
          Subscription_frequency_arabic: rows[0].Subscription_frequency_arabic,
          Redemption_frequency_arabic: rows[0].Redemption_frequency_arabic,
          newprice: rows[0].newprice,
          categoryName: rows[0].categoryName,
          categoryArabicName: rows[0].categoryArabicName
        };

        // Managers list (name/en/ar + image), deduplicated by id
        const managers = Array.from(new Map(
          rows
            .filter(row => row.managerId || row.managerName || row.managerNameArabic || row.managerImage)
            .map(row => [
              row.managerId,
              {
                id: row.managerId,
                name: row.managerName,
                name_arabic: row.managerNameArabic,
                image: row.managerImage,
              }
            ])
        ).values());

        const result = {
          fundDetails: fundDetails,
          prices: prices,
          dates: dates,
          documents: documents,
          entities: entities,
          managers: managers
        };

        res.send(result);
      } else {
        console.error(err);
        res.status(500).send();
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).send();
  }
});