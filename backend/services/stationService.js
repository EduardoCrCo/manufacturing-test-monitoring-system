const Station = require("../models/Station");

class StationService {
  // Get all active stations
  async getAllStations(filters = {}) {
    const { status, isActive = true } = filters;

    const query = { isActive };
    if (status) query.status = status;

    const stations = await Station.find(query).sort({ stationId: 1 });
    return stations;
  }

  // Get station by ID
  async getStationById(stationId) {
    const station = await Station.findOne({ stationId, isActive: true });

    if (!station) {
      throw new Error("Station not found");
    }

    return station;
  }

  // Create new station
  async createStation(stationData) {
    const { stationId, name, location, description, testCapabilities } =
      stationData;

    // Check if station already exists
    const existingStation = await Station.findOne({ stationId });
    if (existingStation) {
      throw new Error("Station with this ID already exists");
    }

    const station = new Station({
      stationId: stationId.toUpperCase(),
      name,
      location,
      description,
      testCapabilities,
    });

    await station.save();
    return station;
  }

  // Update station
  async updateStation(stationId, updateData) {
    const station = await Station.findOne({ stationId, isActive: true });

    if (!station) {
      throw new Error("Station not found");
    }

    Object.assign(station, updateData);
    await station.save();

    return station;
  }

  // Update station status
  async updateStationStatus(stationId, status) {
    const validStatuses = ["active", "inactive", "maintenance"];

    if (!validStatuses.includes(status)) {
      throw new Error(
        "Invalid status. Must be: active, inactive, or maintenance",
      );
    }

    const station = await Station.findOne({ stationId, isActive: true });

    if (!station) {
      throw new Error("Station not found");
    }

    station.status = status;
    await station.save();

    return station;
  }

  // Soft delete station
  async deleteStation(stationId) {
    const station = await Station.findOne({ stationId, isActive: true });

    if (!station) {
      throw new Error("Station not found");
    }

    station.isActive = false;
    await station.save();

    return { message: "Station deleted successfully" };
  }

  // Get stations with basic metrics
  async getStationsWithMetrics() {
    const TestResult = require("../models/TestResult");

    const stations = await Station.find({ isActive: true }).sort({
      stationId: 1,
    });

    // Get metrics for each station
    const stationsWithMetrics = await Promise.all(
      stations.map(async (station) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayTests = await TestResult.countDocuments({
          stationId: station.stationId,
          timestamp: { $gte: today },
        });

        const todayPasses = await TestResult.countDocuments({
          stationId: station.stationId,
          result: "PASS",
          timestamp: { $gte: today },
        });

        const todayFPY =
          todayTests > 0
            ? Math.round((todayPasses / todayTests) * 100 * 100) / 100
            : 0;

        return {
          ...station.toObject(),
          metrics: {
            todayTests,
            todayPasses,
            todayFails: todayTests - todayPasses,
            todayFPY,
          },
        };
      }),
    );

    return stationsWithMetrics;
  }
}

module.exports = new StationService();
