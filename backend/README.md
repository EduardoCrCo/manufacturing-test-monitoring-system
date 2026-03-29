# Manufacturing Test Monitoring System - Backend API

A Node.js/Express API for monitoring manufacturing test results with real-time analytics and failure tracking.

## 🏗️ Architecture

This backend follows **clean architecture principles** with:

- **Separation of Concerns**: Business logic in services, thin controllers
- **Service Layer**: All business logic isolated in service classes
- **Repository Pattern**: Mongoose models handle data access
- **Middleware**: Authentication, validation, error handling
- **Low Coupling**: Modular design for maintainability

## 📁 Project Structure

```
backend/
├── config/          # Database connection
├── controllers/     # Thin controllers (request/response only)
├── models/          # Mongoose schemas
├── routes/          # API route definitions
├── services/        # Business logic layer
├── middleware/      # Auth, validation, error handling
├── server.js        # Express app configuration
├── seedDatabase.js  # Database seeding script
└── package.json     # Dependencies
```

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **helmet** - Security headers
- **cors** - Cross-origin resource sharing

## ⚡ Quick Start

### Prerequisites

- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your values
```

### 3. Start MongoDB

```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
# Update MONGODB_URI in .env
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

### 5. Start Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Test Results

- `POST /api/test-results` - Create test result
- `GET /api/test-results` - Get test results (with filters)
- `GET /api/test-results/recent` - Get recent results
- `GET /api/test-results/metrics/dashboard` - Dashboard metrics
- `GET /api/test-results/analysis/failures` - Failure analysis

### Stations

- `GET /api/stations` - Get all stations
- `GET /api/stations/metrics` - Stations with performance metrics
- `GET /api/stations/:id` - Get station by ID
- `POST /api/stations` - Create station (admin/supervisor)
- `PUT /api/stations/:id` - Update station (admin/supervisor)
- `PATCH /api/stations/:id/status` - Update status (admin/supervisor)

## 📊 Data Models

### User

```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: 'operator' | 'supervisor' | 'admin',
  isActive: Boolean
}
```

### Station

```javascript
{
  stationId: String (unique),
  name: String,
  location: String,
  status: 'active' | 'inactive' | 'maintenance',
  testCapabilities: [String],
  isActive: Boolean
}
```

### TestResult

```javascript
{
  stationId: String,
  boardSerial: String,
  result: 'PASS' | 'FAIL',
  failureType: ObjectId (if FAIL),
  failureDescription: String (if FAIL),
  testDuration: Number,
  operatorId: ObjectId,
  timestamp: Date
}
```

### FailureType

```javascript
{
  code: String (unique),
  name: String,
  description: String,
  category: 'electrical' | 'mechanical' | 'software' | 'environmental' | 'other',
  severity: 'low' | 'medium' | 'high' | 'critical'
}
```

## 📈 Key Metrics

### First Pass Yield (FPY)

```
FPY = (Boards Passed / Total Boards Tested) × 100
```

### Dashboard Metrics

- Total boards tested
- Pass/Fail counts
- First Pass Yield percentage
- Failure analysis by type

## 🔐 Authentication & Authorization

- **JWT Tokens** for stateless authentication
- **Role-based access control** (RBAC)
- **Password hashing** with bcrypt
- **Token expiration** configurable

### User Roles

- **Operator**: Create test results, view data
- **Supervisor**: + Manage stations, view all analytics
- **Admin**: + User management, system configuration

## 🛡️ Security Features

- **Helmet** for security headers
- **Rate limiting** to prevent abuse
- **Input validation** with express-validator
- **CORS** configuration
- **Password policies** enforced
- **SQL injection** protection via Mongoose

## 📝 Sample Data

Run the seed script to populate with:

- 4 Users (admin, supervisor, 2 operators)
- 4 Test stations
- 7 Failure types
- 168 Test results (last 7 days)

### Default Login Credentials

```
Admin: admin@manufacturing.com / Admin123!
Supervisor: supervisor@manufacturing.com / Super123!
Operator: operator1@manufacturing.com / Operator123!
```

## 🐛 Error Handling

Centralized error handling with:

- Validation error formatting
- Database constraint violations
- JWT token errors
- HTTP status code mapping
- Detailed error logging

## 📊 Performance Optimizations

- Database indexing on frequently queried fields
- Query result pagination
- Aggregation pipelines for analytics
- Connection pooling via Mongoose

## 🧪 Testing the API

### Health Check

```bash
curl http://localhost:5000/health
```

### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test123!",
    "role": "operator"
  }'
```

### Create Test Result

```bash
curl -X POST http://localhost:5000/api/test-results \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "stationId": "ST001",
    "boardSerial": "BOARD123",
    "result": "PASS",
    "testDuration": 145
  }'
```

## 🔄 Development Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed    # Seed database with sample data
```

## 📦 Production Deployment

1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure MongoDB Atlas or production MongoDB
4. Set up proper logging
5. Configure reverse proxy (nginx)
6. Enable SSL/TLS
7. Set up monitoring and alerting

## 🤝 Contributing

1. Follow the established architecture patterns
2. Keep controllers thin - business logic goes in services
3. Add input validation for new endpoints
4. Update this README for new features
5. Test endpoints before committing

---

**Phase 1 Complete!** ✅

This backend provides:

- ✅ Express server with proper security
- ✅ MongoDB connection with Mongoose
- ✅ User authentication with JWT
- ✅ Clean architecture with service layer
- ✅ Test result creation and analytics
- ✅ Station management
- ✅ FPY calculations and metrics
- ✅ Sample data seeding

Ready for **Phase 2** - Frontend development!
