const { Sequelize } = require("sequelize");
require("dotenv").config();

// ✅ Support both individual env vars and DATABASE_URL
let sequelize;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL if available (main docker-compose setup)
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: console.log, // Enable logging for debugging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    retry: {
      match: [
        /ECONNREFUSED/,
        /EHOSTUNREACH/,
        /ENOTFOUND/,
        /EAI_AGAIN/,
        /ECONNRESET/,
        /EPIPE/,
      ],
      max: 3,
    },
  });
} else {
  // Fallback to individual environment variables (standalone setup)
  sequelize = new Sequelize(
    process.env.DB_NAME || "userdb",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "password",
    {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      dialect: "postgres",
      logging: console.log,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      retry: {
        match: [
          /ECONNREFUSED/,
          /EHOSTUNREACH/,
          /ENOTFOUND/,
          /EAI_AGAIN/,
          /ECONNRESET/,
          /EPIPE/,
        ],
        max: 3,
      },
    }
  );
}

module.exports = sequelize;
