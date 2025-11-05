import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import validator from "validator";
import nodemailer from "nodemailer";
import { UserModel } from "../models/user.model.js";

export const UserService = {
  async getAll() {
    return await UserModel.getAll();
  },

  async register(userData) {
    const { username, email, password, role } = userData;

    if (!validator.isEmail(email)) throw new Error("Invalid email format");
    if (!validator.isLength(password, { min: 7 }))
      throw new Error("Password must be at least 7 characters");

    const existing = await UserModel.getByEmail(email);
    if (existing) throw new Error("Email already in use");

    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      confirmed: 1,
    };

    return UserModel.create(newUser);
  },

  async login(email, password) {
    const user = await UserModel.getByEmail(email);
    if (!user) throw new Error("Invalid email or password");

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) throw new Error("Invalid email or password");

    const token = jwt.sign({ id: user.id, role: user.role }, "cinbon", { expiresIn: "10d" });
    return { user, token };
  },

  async forgotPassword(email) {
    const user = await UserModel.getByEmail(email);
    if (!user) throw new Error("User not found");

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const tokenExpiry = new Date(Date.now() + 3600000);

    await UserModel.updateById(user.id, {
      resetToken: hashedToken,
      resetTokenExpiry: tokenExpiry,
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}&email=${email}`;

    const transporter = nodemailer.createTransport({
      host: "mail.uwd.agency", // ✅ من الـ cPanel
      port: 465, // ✅ SSL/TLS
      secure: true, // ✅ علشان port 465
      auth: {
        user: process.env.EMAIL_USER, // ex: reset@uwd.agency
        pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // ✅ مهم جدًا لو شغال Local
      }
    });
    
    await transporter.sendMail({
      to: email,
      from: `"UWD Support" <${process.env.EMAIL_USER}>`, // ✅ اسم + ايميل
      subject: "Password Reset",
      html: `
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
      `
    });

    return "Reset email sent successfully";
  },

  async resetPassword(email, token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  
    const user = await UserModel.getByEmail(email);
    if (!user) throw new Error("User not found");
  
    if (
      user.resetToken !== hashedToken ||
      new Date(user.resetTokenExpiry) < new Date()
    ) {
      throw new Error("Invalid or expired token");
    }
  
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
  
    await UserModel.updateById(user.id, {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    });
  
    return "Password reset successful";
  },
  
  async updateAvatar(userId, avatarUrl) {
    await UserModel.updateById(userId, { avatar: avatarUrl });
    return "Avatar updated successfully";
  },

  async updateBio(userId, bio) {
    await UserModel.updateById(userId, { bio });
    return "Bio updated successfully";
  },

  async logout(userId) {
    return "Logged out successfully";
  },

  async logoutAll() {
    return "Logged out all users (client must clear tokens)";
  },

  async updateUser(id, updates) {
    const { username, email, password, role } = updates;
    const data = {};

    if (username) data.username = username;
    if (email) {
      if (!validator.isEmail(email)) throw new Error("Invalid email");
      data.email = email;
    }
    if (role) data.role = role;
    if (password) {
      if (!validator.isLength(password, { min: 7 }))
        throw new Error("Password must be at least 7 characters");
      data.password = bcrypt.hashSync(password, 10);
    }

    return UserModel.updateById(id, data);
  },
  
  async deleteUser(id) {
    if (!id) throw new Error("User ID is required");
  
    const deleted = await UserModel.deleteById(id);
    if (!deleted) throw new Error("User not found");
  
    return "User deleted successfully";
  },

  async changeUserRole(id, newRole) {
    const allowedRoles = ['admin', 'manager', 'user'];
    if (!allowedRoles.includes(newRole)) {
      throw new Error("Invalid role. Allowed roles are: admin, manager, user.");
    }

    const data = { role: newRole };
    return UserModel.updateById(id, data);
  }
};
