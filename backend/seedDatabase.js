const mongoose = require("mongoose");
require("dotenv").config();

// Import models
const User = require("./models/User");
const Station = require("./models/Station");
const FailureType = require("./models/FailureType");
const TestResult = require("./models/TestResult");

const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://localhost:27017/manufacturing_test_monitoring",
    );
    console.log("MongoDB Connected for seeding...");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Station.deleteMany({});
    await FailureType.deleteMany({});
    await TestResult.deleteMany({});

    console.log("Cleared existing data...");

    // Create users
    const users = await User.create([
      {
        username: "admin",
        email: "admin@manufacturing.com",
        password: "Admin123!",
        role: "admin",
      },
      {
        username: "supervisor1",
        email: "supervisor@manufacturing.com",
        password: "Super123!",
        role: "supervisor",
      },
      {
        username: "operator1",
        email: "operator1@manufacturing.com",
        password: "Operator123!",
        role: "operator",
      },
      {
        username: "operator2",
        email: "operator2@manufacturing.com",
        password: "Operator123!",
        role: "operator",
      },
    ]);

    console.log("Created users...");

    // Create stations
    const stations = await Station.create([
      {
        stationId: "ST001",
        name: "Functional Test Station 1",
        location: "Production Line A",
        description: "Primary functional testing station for PCB boards",
        testCapabilities: [
          "Functional Test",
          "Basic Connectivity",
          "Power Test",
        ],
        status: "active",
      },
      {
        stationId: "ST002",
        name: "In-Circuit Test Station",
        location: "Production Line A",
        description: "In-circuit testing for component verification",
        testCapabilities: [
          "In-Circuit Test",
          "Component Verification",
          "Short/Open Test",
        ],
        status: "active",
      },
      {
        stationId: "ST003",
        name: "Final Test Station",
        location: "Production Line B",
        description: "Final comprehensive testing before packaging",
        testCapabilities: ["Final Test", "Full System Test", "Calibration"],
        status: "active",
      },
      {
        stationId: "ST004",
        name: "Environmental Test Station",
        location: "Quality Lab",
        description: "Environmental stress testing",
        testCapabilities: [
          "Temperature Test",
          "Humidity Test",
          "Vibration Test",
        ],
        status: "maintenance",
      },
    ]);

    console.log("Created stations...");

    // Create failure types
    const failureTypes = await FailureType.create([
      {
        code: "ELEC001",
        name: "Short Circuit",
        description: "e",
        category: "electrical",
        severity: "high",
      },
      {
        code: "ELEC002",
        name: "Open Circuit",
        description: "Open circuit detected in connections",
        category: "electrical",
        severity: "medium",
      },
      {
        code: "ELEC003",
        name: "Power Supply Failure",
        description: "Power supply not within specifications",
        category: "electrical",
        severity: "critical",
      },
      {
        code: "COMP001",
        name: "Component Missing",
        description: "Required component not present",
        category: "mechanical",
        severity: "high",
      },
      {
        code: "COMP002",
        name: "Component Misaligned",
        description: "Component not properly aligned or seated",
        category: "mechanical",
        severity: "medium",
      },
      {
        code: "SOFT001",
        name: "Firmware Not Responding",
        description: "Firmware not responding to commands",
        category: "software",
        severity: "high",
      },
      {
        code: "CALIB001",
        name: "Calibration Out of Range",
        description: "Device calibration outside acceptable range",
        category: "other",
        severity: "medium",
      },
    ]);

    console.log("Created failure types...");

    // Create sample test results
    const sampleResults = [];
    const boardSerials = [
      "BRD001001",
      "BRD001002",
      "BRD001003",
      "BRD001004",
      "BRD001005",
      "BRD001006",
      "BRD001007",
      "BRD001008",
    ];
    const stationIds = ["ST001", "ST002", "ST003"];

    // Generate test results for the last 7 days
    for (let day = 6; day >= 0; day--) {
      const date = new Date();
      date.setDate(date.getDate() - day);

      for (const serial of boardSerials) {
        for (const stationId of stationIds) {
          const testDate = new Date(date);
          testDate.setHours(
            8 + Math.floor(Math.random() * 10),
            Math.floor(Math.random() * 60),
          );

          const isPass = Math.random() > 0.15; // 85% pass rate

          const result = {
            stationId,
            boardSerial: `${serial}_${stationId}_${day}`,
            result: isPass ? "PASS" : "FAIL",
            testDuration: Math.floor(Math.random() * 300) + 30, // 30-330 seconds
            operatorId: users[Math.floor(Math.random() * 2) + 2]._id, // Random operator
            timestamp: testDate,
          };

          if (!isPass) {
            result.failureType =
              failureTypes[Math.floor(Math.random() * failureTypes.length)]._id;
            result.failureDescription =
              "Automated test failure - requires investigation";
          }

          sampleResults.push(result);
        }
      }
    }

    await TestResult.create(sampleResults);
    console.log(`Created ${sampleResults.length} test results...`);

    console.log("\n✅ Database seeded successfully!");
    console.log("\n📊 Created:");
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   🏭 Stations: ${stations.length}`);
    console.log(`   ❌ Failure Types: ${failureTypes.length}`);
    console.log(`   📋 Test Results: ${sampleResults.length}`);

    console.log("\n🔐 Login Credentials:");
    console.log("   Admin: admin@manufacturing.com / Admin123!");
    console.log("   Supervisor: supervisor@manufacturing.com / Super123!");
    console.log("   Operator1: operator1@manufacturing.com / Operator123!");
    console.log("   Operator2: operator2@manufacturing.com / Operator123!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
};

const runSeed = async () => {
  await connectDB();
  await seedData();
  await mongoose.connection.close();
  console.log("\nDatabase connection closed.");
  process.exit(0);
};

runSeed();
