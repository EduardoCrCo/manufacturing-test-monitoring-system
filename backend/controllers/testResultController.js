const testResultService = require("../services/testResultService");
const { validationResult } = require("express-validator");

class TestResultController {
  // Create new test result
  async createTestResult(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation errors",
          errors: errors.array(),
        });
      }

      // Add operator ID from authenticated user
      const testData = {
        ...req.body,
        operatorId: req.user._id,
      };

      const result = await testResultService.createTestResult(testData);

      res.status(201).json({
        success: true,
        message: "Test result created successfully",
        data: result,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get test results with filters
  async getTestResults(req, res) {
    try {
      const filters = {
        stationId: req.query.stationId,
        result: req.query.result,
        boardSerial: req.query.boardSerial,
        operator: req.query.operator,
        failureType: req.query.failureType,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder,
      };

      const results = await testResultService.getTestResults(filters);

      res.json({
        success: true,
        data: results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get dashboard metrics
  async getDashboardMetrics(req, res) {
    try {
      const filters = {
        stationId: req.query.stationId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const metrics = await testResultService.getDashboardMetrics(filters);

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get failure analysis
  async getFailureAnalysis(req, res) {
    try {
      const filters = {
        stationId: req.query.stationId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const analysis = await testResultService.getFailureAnalysis(filters);

      res.json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get station metrics
  async getStationMetrics(req, res) {
    try {
      const { stationId } = req.params;
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      };

      const metrics = await testResultService.getStationMetrics(
        stationId,
        filters,
      );

      res.json({
        success: true,
        data: metrics,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get recent test results for dashboard
  async getRecentResults(req, res) {
    try {
      const filters = {
        limit: req.query.limit || 10,
        sortBy: "timestamp",
        sortOrder: "desc",
      };

      const results = await testResultService.getTestResults(filters);

      res.json({
        success: true,
        data: results.results,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Get available stations with test results
  async getAvailableStations(req, res) {
    try {
      const stations = await testResultService.getAvailableStations();

      res.json({
        success: true,
        data: stations,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new TestResultController();
