const TestResult = require("../models/TestResult");
const Station = require("../models/Station");
const FailureType = require("../models/FailureType");

class TestResultService {
  // Create a new test result
  async createTestResult(testData) {
    const {
      stationId,
      boardSerial,
      result,
      failureType,
      failureDescription,
      testDuration,
      testData: additionalData,
      operatorId,
    } = testData;

    // Validate station exists
    const station = await Station.findOne({ stationId, isActive: true });
    if (!station) {
      throw new Error("Station not found or inactive");
    }

    // Validate failure type if result is FAIL
    if (result === "FAIL" && failureType) {
      const failureTypeDoc = await FailureType.findById(failureType);
      if (!failureTypeDoc) {
        throw new Error("Invalid failure type");
      }
    }

    // Check for duplicate board serial in the same day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingTest = await TestResult.findOne({
      boardSerial,
      stationId,
      timestamp: { $gte: today, $lt: tomorrow },
    });

    if (existingTest) {
      throw new Error("Board serial already tested at this station today");
    }

    // Create test result
    const testResult = new TestResult({
      stationId,
      boardSerial,
      result,
      failureType: result === "FAIL" ? failureType : undefined,
      failureDescription: result === "FAIL" ? failureDescription : undefined,
      testDuration,
      testData: additionalData,
      operatorId,
    });

    await testResult.save();

    // Populate references
    const populatedResult = await TestResult.findById(testResult._id)
      .populate("failureType", "code name description")
      .populate("operatorId", "username email");

    return populatedResult;
  }

  // Get test results with filters
  async getTestResults(filters = {}) {
    const {
      stationId,
      result,
      boardSerial,
      operator,
      failureType,
      startDate,
      endDate,
      page = 1,
      limit = 50,
      sortBy = "timestamp",
      sortOrder = "desc",
    } = filters;

    const query = {};

    if (stationId) query.stationId = stationId;
    if (result) query.result = result;
    if (boardSerial) query.boardSerial = { $regex: boardSerial, $options: "i" };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const skip = (page - 1) * limit;

    let results;

    if (operator || failureType) {
      // Use aggregation pipeline for operator and failureType filtering
      try {
        const pipeline = [
          { $match: query },
          {
            $lookup: {
              from: "users", // MongoDB collection name
              localField: "operatorId",
              foreignField: "_id",
              as: "operatorData",
            },
          },
          {
            $lookup: {
              from: "failuretypes", // MongoDB collection name
              localField: "failureType",
              foreignField: "_id",
              as: "failureTypeData",
            },
          },
        ];

        // Add operator filter if provided - handle empty arrays safely
        if (operator) {
          pipeline.push({
            $match: {
              $and: [
                { "operatorData.0": { $exists: true } }, // Ensure array has elements
                {
                  "operatorData.username": { $regex: operator, $options: "i" },
                },
              ],
            },
          });
        }

        // Add failureType filter if provided - handle empty arrays safely
        if (failureType) {
          pipeline.push({
            $match: {
              $and: [
                { "failureTypeData.0": { $exists: true } }, // Ensure array has elements
                {
                  $or: [
                    {
                      "failureTypeData.name": {
                        $regex: failureType,
                        $options: "i",
                      },
                    },
                    {
                      "failureTypeData.code": {
                        $regex: failureType,
                        $options: "i",
                      },
                    },
                  ],
                },
              ],
            },
          });
        }

        pipeline.push(
          { $sort: sort },
          { $skip: skip },
          { $limit: parseInt(limit) },
          {
            $project: {
              stationId: 1,
              boardSerial: 1,
              result: 1,
              testDuration: 1,
              timestamp: 1,
              failureDescription: 1,
              failureType: {
                $cond: {
                  if: { $gt: [{ $size: "$failureTypeData" }, 0] },
                  then: { $arrayElemAt: ["$failureTypeData", 0] },
                  else: null,
                },
              },
              operatorId: {
                $cond: {
                  if: { $gt: [{ $size: "$operatorData" }, 0] },
                  then: { $arrayElemAt: ["$operatorData", 0] },
                  else: null,
                },
              },
            },
          },
        );

        results = await TestResult.aggregate(pipeline);
      } catch (aggregationError) {
        console.error("Aggregation pipeline error:", aggregationError);
        // Fallback to simple query without operator/failureType filters
        console.log("Falling back to simple query...");
        results = await TestResult.find(query)
          .populate("failureType", "code name description category")
          .populate("operatorId", "username")
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit));
      }
    } else {
      results = await TestResult.find(query)
        .populate("failureType", "code name description category")
        .populate("operatorId", "username")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));
    }

    let total;

    if (operator || failureType) {
      // Count with operator and failureType filters using aggregation
      try {
        const countPipeline = [
          { $match: query },
          {
            $lookup: {
              from: "users",
              localField: "operatorId",
              foreignField: "_id",
              as: "operatorData",
            },
          },
          {
            $lookup: {
              from: "failuretypes",
              localField: "failureType",
              foreignField: "_id",
              as: "failureTypeData",
            },
          },
        ];

        // Add operator filter if provided - handle empty arrays safely
        if (operator) {
          countPipeline.push({
            $match: {
              $and: [
                { "operatorData.0": { $exists: true } }, // Ensure array has elements
                {
                  "operatorData.username": { $regex: operator, $options: "i" },
                },
              ],
            },
          });
        }

        // Add failureType filter if provided - handle empty arrays safely
        if (failureType) {
          countPipeline.push({
            $match: {
              $and: [
                { "failureTypeData.0": { $exists: true } }, // Ensure array has elements
                {
                  $or: [
                    {
                      "failureTypeData.name": {
                        $regex: failureType,
                        $options: "i",
                      },
                    },
                    {
                      "failureTypeData.code": {
                        $regex: failureType,
                        $options: "i",
                      },
                    },
                  ],
                },
              ],
            },
          });
        }

        countPipeline.push({ $count: "total" });

        const countResult = await TestResult.aggregate(countPipeline);
        total = countResult[0]?.total || 0;
      } catch (countError) {
        console.error("Count aggregation pipeline error:", countError);
        // Fallback to simple count
        total = await TestResult.countDocuments(query);
      }
    } else {
      total = await TestResult.countDocuments(query);
    }

    return {
      results,
      totalCount: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
    };
  }

  // Calculate dashboard metrics
  async getDashboardMetrics(filters = {}) {
    const { stationId, startDate, endDate } = filters;

    const matchQuery = {};

    if (stationId) matchQuery.stationId = stationId;
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    const metrics = await TestResult.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBoards: { $sum: 1 },
          passedBoards: {
            $sum: { $cond: [{ $eq: ["$result", "PASS"] }, 1, 0] },
          },
          failedBoards: {
            $sum: { $cond: [{ $eq: ["$result", "FAIL"] }, 1, 0] },
          },
        },
      },
    ]);

    const result = metrics[0] || {
      totalBoards: 0,
      passedBoards: 0,
      failedBoards: 0,
    };

    const fpy =
      result.totalBoards > 0
        ? Math.round((result.passedBoards / result.totalBoards) * 100 * 100) /
          100
        : 0;

    return {
      ...result,
      firstPassYield: fpy,
    };
  }

  // Get failure analysis data
  async getFailureAnalysis(filters = {}) {
    const { stationId, startDate, endDate } = filters;

    const matchQuery = { result: "FAIL" };

    if (stationId) matchQuery.stationId = stationId;
    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    const failuresByType = await TestResult.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "failuretypes",
          localField: "failureType",
          foreignField: "_id",
          as: "failureTypeInfo",
        },
      },
      { $unwind: "$failureTypeInfo" },
      {
        $group: {
          _id: "$failureType",
          count: { $sum: 1 },
          failureTypeName: { $first: "$failureTypeInfo.name" },
          failureTypeCode: { $first: "$failureTypeInfo.code" },
          category: { $first: "$failureTypeInfo.category" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return failuresByType;
  }

  // Get station performance metrics
  async getStationMetrics(stationId, filters = {}) {
    const { startDate, endDate } = filters;

    const matchQuery = { stationId };

    if (startDate || endDate) {
      matchQuery.timestamp = {};
      if (startDate) matchQuery.timestamp.$gte = new Date(startDate);
      if (endDate) matchQuery.timestamp.$lte = new Date(endDate);
    }

    const metrics = await this.getDashboardMetrics({
      stationId,
      startDate,
      endDate,
    });
    const failures = await this.getFailureAnalysis({
      stationId,
      startDate,
      endDate,
    });

    return {
      ...metrics,
      topFailureTypes: failures.slice(0, 5),
    };
  }

  // Get all unique stations that have test results
  async getAvailableStations() {
    try {
      // Get unique station IDs that have test results
      const stationIds = await TestResult.distinct("stationId");

      // Get Station records for those IDs
      const stations = await Station.find(
        { stationId: { $in: stationIds } },
        { stationId: 1, name: 1, _id: 0 },
      ).sort({ stationId: 1 });

      return stations; // Returns: [{ stationId: "ST-001", name: "Station Name" }]
    } catch (error) {
      throw new Error(`Error fetching available stations: ${error.message}`);
    }
  }
}

module.exports = new TestResultService();
