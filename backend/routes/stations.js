const express = require("express");
const { body, param } = require("express-validator");
const stationController = require("../controllers/stationController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const createStationValidation = [
  body("stationId")
    .trim()
    .notEmpty()
    .withMessage("Station ID is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Station ID must be between 1 and 20 characters")
    .matches(/^[A-Z0-9_-]+$/i)
    .withMessage(
      "Station ID can only contain letters, numbers, underscores, and hyphens",
    ),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Station name is required")
    .isLength({ min: 1, max: 100 })
    .withMessage("Station name must be between 1 and 100 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("testCapabilities")
    .optional()
    .isArray()
    .withMessage("Test capabilities must be an array"),

  body("testCapabilities.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Each test capability must be between 1 and 100 characters"),
];

const updateStationValidation = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Station name cannot be empty")
    .isLength({ min: 1, max: 100 })
    .withMessage("Station name must be between 1 and 100 characters"),

  body("location")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Location cannot exceed 200 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("testCapabilities")
    .optional()
    .isArray()
    .withMessage("Test capabilities must be an array"),

  body("testCapabilities.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Each test capability must be between 1 and 100 characters"),
];

const stationParamValidation = [
  param("stationId").trim().notEmpty().withMessage("Station ID is required"),
];

const statusValidation = [
  body("status")
    .isIn(["active", "inactive", "maintenance"])
    .withMessage("Status must be active, inactive, or maintenance"),
];

// Routes

// Get all stations
router.get("/", authenticateToken, stationController.getAllStations);

// Get all stations with metrics
router.get(
  "/metrics",
  authenticateToken,
  stationController.getStationsWithMetrics,
);

// Get station by ID
router.get(
  "/:stationId",
  authenticateToken,
  stationParamValidation,
  stationController.getStationById,
);

// Create new station (admin/supervisor only)
router.post(
  "/",
  authenticateToken,
  requireRole(["admin", "supervisor"]),
  createStationValidation,
  stationController.createStation,
);

// Update station (admin/supervisor only)
router.put(
  "/:stationId",
  authenticateToken,
  requireRole(["admin", "supervisor"]),
  stationParamValidation,
  updateStationValidation,
  stationController.updateStation,
);

// Update station status (admin/supervisor only)
router.patch(
  "/:stationId/status",
  authenticateToken,
  requireRole(["admin", "supervisor"]),
  stationParamValidation,
  statusValidation,
  stationController.updateStationStatus,
);

// Delete station (admin only)
router.delete(
  "/:stationId",
  authenticateToken,
  requireRole(["admin"]),
  stationParamValidation,
  stationController.deleteStation,
);

module.exports = router;
