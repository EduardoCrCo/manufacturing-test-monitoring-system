const express = require("express");
const failureTypeController = require("../controllers/failureTypeController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Get all failure types
router.get("/", authenticateToken, failureTypeController.getFailureTypes);

// Get failure types by category
router.get(
  "/category/:category",
  authenticateToken,
  failureTypeController.getFailureTypesByCategory,
);

module.exports = router;
