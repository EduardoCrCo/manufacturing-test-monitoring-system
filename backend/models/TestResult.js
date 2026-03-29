const mongoose = require("mongoose");

const testResultSchema = new mongoose.Schema(
  {
    stationId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      ref: "Station",
    },
    boardSerial: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    result: {
      type: String,
      required: true,
      enum: ["PASS", "FAIL"],
      uppercase: true,
    },
    failureType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FailureType",
      required: function () {
        return this.result === "FAIL";
      },
    },
    failureDescription: {
      type: String,
      trim: true,
      required: function () {
        return this.result === "FAIL";
      },
    },
    testDuration: {
      type: Number, // in seconds
      min: 0,
    },
    testData: {
      type: mongoose.Schema.Types.Mixed, // For storing additional test parameters
    },
    operatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
testResultSchema.index({ stationId: 1, timestamp: -1 });
testResultSchema.index({ boardSerial: 1 });
testResultSchema.index({ result: 1 });
testResultSchema.index({ timestamp: -1 });

// Virtual for getting failure details
testResultSchema.virtual("isPass").get(function () {
  return this.result === "PASS";
});

module.exports = mongoose.model("TestResult", testResultSchema);
