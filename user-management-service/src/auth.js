const jwt = require("jsonwebtoken");
const User = require("./models/User");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

module.exports = { generateToken, verifyToken };
