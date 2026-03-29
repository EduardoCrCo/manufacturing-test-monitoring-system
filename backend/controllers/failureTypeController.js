const FailureType = require("../models/FailureType");

class FailureTypeController {
  // Get all failure types
  async getFailureTypes(req, res) {
    try {
      const failureTypes = await FailureType.find({ isActive: true }).sort({
        category: 1,
        severity: -1,
        name: 1,
      });

      res.json({
        success: true,
        data: failureTypes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get failure types by category
  async getFailureTypesByCategory(req, res) {
    try {
      const { category } = req.params;
      const failureTypes = await FailureType.find({
        category,
        isActive: true,
      }).sort({ severity: -1, name: 1 });

      res.json({
        success: true,
        data: failureTypes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new FailureTypeController();
