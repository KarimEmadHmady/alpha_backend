import FundService from "../services/fund.service.js";

const FundController = {
  createFund: async (req, res) => {
    try {
      const results = await FundService.createFund(req.body, req.files, req.user);
      res.status(201).json({ success: 1, message: "Fund created", data: results });
    } catch (e) {
      res.status(500).json({ success: 0, message: "Server error", error: e.message });
    }
  },

  updateFund: async (req, res) => {
    try {
      const results = await FundService.updateFund(req.params.id, req.body, req.files, req.user);
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: 0, message: "Fund not found" });
      }
      res.json({ success: 1, message: "Fund updated successfully", results });
    } catch (e) {
      res.status(500).json({ success: 0, message: "An unexpected error occurred", error: e.message });
    }
  },

  updateFundPrice: async (req, res) => {
    try {
      const { currentprice, newprice } = req.body;
      if (typeof currentprice === 'undefined' || typeof newprice === 'undefined') {
        return res.status(400).json({ success: 0, message: "Both currentprice and newprice are required." });
      }
      const results = await FundService.updateFundPrice(req.params.id, req.user.id, currentprice, newprice);
      if (results.affectedRows === 0) {
        return res.status(404).json({ success: 0, message: "Fund not found" });
      }
      res.json({ success: 1, message: "Fund price updated and history logged successfully", results });
    } catch (e) {
      res.status(500).json({ success: 0, message: "An unexpected error occurred", error: e.message });
    }
  },

  updateFundStatus: async (req, res) => {
    try {
      const status = Number(req.body.status);
      if (isNaN(status)) {
        return res.status(400).json({ error: "Status must be a number" });
      }
      await FundService.updateFundStatus(req.params.id, status, req.user.id);
      res.send('Success Edit');
    } catch (e) {
      res.status(400).send(e.message);
    }
  },

  declineFundStatus: async (req, res) => {
      try {
          const { message } = req.body;
          if(!message) return res.status(400).json({error: "Message is required"});
          await FundService.declineFundStatus(req.params.id, message);
          res.send('Success Edit Status');
      } catch (e) {
          res.status(400).send(e.message);
      }
  },

  deleteFund: async (req, res) => {
    try {
      await FundService.deleteFund(req.params.id);
      res.send('Delete fund success');
    } catch (e) {
      res.status(500).send({ error: "Internal Server Error" });
    }
  },

  getFundsForUser: async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      if (isNaN(page) || page < 1) {
        return res.status(400).send({ error: "Invalid page number" });
      }
      const funds = await FundService.getFundsForUser(req.user.id, page);
      res.send(funds);
    } catch (e) {
      res.status(500).send({ error: "Internal Server Error" });
    }
  },

  getAllFunds: async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page) : 1;
      if (isNaN(page) || page < 1) {
        return res.status(400).send({ error: "Invalid page number" });
      }
      const funds = await FundService.getAllFunds(page);
      res.send(funds);
    } catch (e) {
      res.status(500).send({ error: "Internal Server Error" });
    }
  },

  getAllFundsNoPagination: async (req, res) => {
    try {
      const funds = await FundService.getAllFundsNoPagination();
      res.send(funds);
    } catch (e) {
      res.status(500).send({ error: "Internal Server Error" });
    }
  },

  reorderFunds: async (req, res) => {
      try {
          const { orderedIds } = req.body;
          if(!Array.isArray(orderedIds) || !orderedIds.length){
              return res.status(400).json({ success: 0, message: 'orderedIds must be a non-empty array of integers' });
          }
          const result = await FundService.reorderFunds(orderedIds);
          if (result.affectedRows === 0) {
            return res.status(404).json({ success: 0, message: 'No rows were updated. Check if IDs exist in database.' });
          }
          res.json({ success: 1, updated: result.affectedRows });
      } catch (e) {
          res.status(500).json({ success: 0, message: 'Unexpected server error', detail: e.message });
      }
  },

  getPendingFunds: async (req, res) => {
      try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        if (isNaN(page) || page < 1) {
            return res.status(400).send({ error: "Invalid page number" });
        }
        const funds = await FundService.getPendingFunds(page);
        res.send(funds);
      } catch (e) {
        res.status(500).send({ error: "Internal Server Error" });
      }
  },

  getApprovedFunds: async (req, res) => {
      try {
        const page = req.query.page ? parseInt(req.query.page) : 1;
        if (isNaN(page) || page < 1) {
            return res.status(400).send({ error: "Invalid page number" });
        }
        const funds = await FundService.getApprovedFunds(page);
        res.send(funds);
      } catch (e) {
        res.status(500).send({ error: "Internal Server Error" });
      }
  },

  getFundDetails: async (req, res) => {
      try {
          const details = await FundService.getFundDetails(req.params.id);
          res.send(details);
      } catch (e) {
          res.status(500).send();
      }
  }
};

export default FundController;