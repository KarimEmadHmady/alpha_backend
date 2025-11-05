import { UserService } from "../services/user.service.js";

export const UserController = {
  async getAll(req, res) {
    try {
      const users = await UserService.getAll();
      res.json(users);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  },

  async register(req, res) {
    try {
      const result = await UserService.register(req.body);
      res.status(201).json({ success: 1, data: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await UserService.login(email, password);
      res.json({
        success: 1,
        message: "Login successful",
        token,
        userId: user.id,
        username: user.username,
        role: user.role,
      });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async forgotPassword(req, res) {
    try {
      const result = await UserService.forgotPassword(req.body.email);
      res.json({ success: 1, message: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async resetPassword(req, res) {
    try {
      const { email, token, newPassword } = req.body;
      const result = await UserService.resetPassword(email, token, newPassword);
      res.json({ success: 1, message: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async updateAvatar(req, res) {
    try {
      const avatarUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      const result = await UserService.updateAvatar(req.user.id, avatarUrl);
      res.json({ success: 1, message: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async updateBio(req, res) {
    try {
      const result = await UserService.updateBio(req.user.id, req.body.bio);
      res.json({ success: 1, message: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async logout(req, res) {
    try {
      const result = await UserService.logout(req.user.id);
      res.json({ success: 1, message: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async logoutAll(req, res) {
    try {
      const result = await UserService.logoutAll();
      res.json({ success: 1, message: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async updateUser(req, res) {
    try {
      const result = await UserService.updateUser(req.params.id, req.body);
      res.json({ success: 1, message: "User updated successfully", result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async deleteUser(req, res) {
    try {
      const result = await UserService.deleteUser(req.params.id);
      res.json({ success: 1, message: result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  },

  async changeUserRole(req, res) {
    try {
      const result = await UserService.changeUserRole(req.params.id, req.body.role);
      res.json({ success: 1, message: "User role updated successfully", result });
    } catch (e) {
      res.status(400).json({ success: 0, message: e.message });
    }
  }
};