const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const testResultRoutes = require("./routes/testResults");
const stationRoutes = require("./routes/stations");
const failureTypeRoutes = require("./routes/failureTypes");

// Create Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});
app.use(limiter);

// CORS configuration - GitHub Pages + Local Development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allowed origins for development and production
    const allowedOrigins = [
      // Local development
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",

      // Production - GitHub Pages
      "https://eduardocrco.github.io",

      // Environment variable for production
      process.env.FRONTEND_URL,
      process.env.ALLOWED_ORIGINS?.split(",").map((url) => url.trim()) || [],
    ]
      .flat()
      .filter(Boolean);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`,
  );
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Manufacturing Test Monitoring API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/test-results", testResultRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/failure-types", failureTypeRoutes);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT error
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
🚀 Manufacturing Test Monitoring API Server Started!
📡 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || "development"}
🕒 Started at: ${new Date().toISOString()}
📋 Health Check: http://localhost:${PORT}/health

📚 Available Endpoints:
   🔐 POST /api/auth/register - Register user
   🔐 POST /api/auth/login - Login user
   🔐 GET  /api/auth/profile - Get user profile
   
   📊 POST /api/test-results - Create test result
   📊 GET  /api/test-results - Get test results
   📊 GET  /api/test-results/metrics/dashboard - Get dashboard metrics
   📊 GET  /api/test-results/analysis/failures - Get failure analysis
   
   🏭 GET  /api/stations - Get all stations
   🏭 POST /api/stations - Create station (admin/supervisor)
   🏭 GET  /api/stations/:id - Get station by ID
  `);
});
