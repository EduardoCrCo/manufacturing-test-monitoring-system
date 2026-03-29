const express = require("express");
const { body, param, query } = require("express-validator");
const testResultController = require("../controllers/testResultController");
const { authenticateToken, requireRole } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const createTestResultValidation = [
  body("stationId")
    .trim()
    .notEmpty()
    .withMessage("Station ID is required")
    .isLength({ min: 1, max: 20 })
    .withMessage("Station ID must be between 1 and 20 characters"),

  body("boardSerial")
    .trim()
    .notEmpty()
    .withMessage("Board serial is required")
    .isLength({ min: 1, max: 50 })
    .withMessage("Board serial must be between 1 and 50 characters"),

  body("result")
    .isIn(["PASS", "FAIL"])
    .withMessage("Result must be either PASS or FAIL"),

  body("failureType")
    .optional()
    .isMongoId()
    .withMessage("Invalid failure type ID"),

  body("failureDescription")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Failure description cannot exceed 500 characters"),

  body("testDuration")
    .optional()
    .isNumeric({ min: 0 })
    .withMessage("Test duration must be a positive number"),
];

const stationParamValidation = [
  param("stationId").trim().notEmpty().withMessage("Station ID is required"),
];

// Routes

// Create test result
router.post(
  "/",
  authenticateToken,
  createTestResultValidation,
  testResultController.createTestResult,
);

// Get test results with filters
router.get("/", authenticateToken, testResultController.getTestResults);

// Get recent test results for dashboard
router.get("/recent", authenticateToken, testResultController.getRecentResults);

// Get available stations
router.get(
  "/available-stations",
  authenticateToken,
  testResultController.getAvailableStations,
);

// Get dashboard metrics
router.get(
  "/metrics/dashboard",
  authenticateToken,
  testResultController.getDashboardMetrics,
);

// Get failure analysis
router.get(
  "/analysis/failures",
  authenticateToken,
  testResultController.getFailureAnalysis,
);

// Get station-specific metrics
router.get(
  "/metrics/station/:stationId",
  authenticateToken,
  stationParamValidation,
  testResultController.getStationMetrics,
);

module.exports = router;
