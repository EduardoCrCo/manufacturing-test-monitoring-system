const stationService = require("../services/stationService");
const { validationResult } = require("express-validator");

class StationController {
  // Get all stations
  async getAllStations(req, res) {
    try {
      const filters = {
        status: req.query.status,
        isActive: req.query.isActive !== "false",
      };

      const stations = await stationService.getAllStations(filters);

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

  // Get stations with metrics
  async getStationsWithMetrics(req, res) {
    try {
      const stations = await stationService.getStationsWithMetrics();

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

  // Get station by ID
  async getStationById(req, res) {
    try {
      const { stationId } = req.params;
      const station = await stationService.getStationById(stationId);

      res.json({
        success: true,
        data: station,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Create new station
  async createStation(req, res) {
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

      const station = await stationService.createStation(req.body);

      res.status(201).json({
        success: true,
        message: "Station created successfully",
        data: station,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update station
  async updateStation(req, res) {
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

      const { stationId } = req.params;
      const station = await stationService.updateStation(stationId, req.body);

      res.json({
        success: true,
        message: "Station updated successfully",
        data: station,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Update station status
  async updateStationStatus(req, res) {
    try {
      const { stationId } = req.params;
      const { status } = req.body;

      const station = await stationService.updateStationStatus(
        stationId,
        status,
      );

      res.json({
        success: true,
        message: "Station status updated successfully",
        data: station,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Delete station
  async deleteStation(req, res) {
    try {
      const { stationId } = req.params;
      const result = await stationService.deleteStation(stationId);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = new StationController();
