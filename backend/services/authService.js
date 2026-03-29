const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthService {
  // Generate JWT token
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET || "your-secret-key", {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });
  }

  // Register new user
  async registerUser(userData) {
    const { username, email, password, role } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      throw new Error("User with this email or username already exists");
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role,
    });

    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      token: this.generateToken(user._id),
    };
  }

  // Login user
  async loginUser(credentials) {
    const { email, password } = credentials;

    // Find user by email
    const user = await User.findOne({ email, isActive: true });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return {
      user: userResponse,
      token: this.generateToken(user._id),
    };
  }

  // Verify token
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  }

  // Get user by ID
  async getUserById(userId) {
    const user = await User.findById(userId).select("-password");

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

module.exports = new AuthService();
