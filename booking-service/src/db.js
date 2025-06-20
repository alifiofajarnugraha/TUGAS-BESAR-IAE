const { Pool } = require("pg");
require("dotenv").config();

console.log("🔧 Loading database configuration...");
console.log(`   NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(
  `   DATABASE_URL: ${process.env.DATABASE_URL ? "configured" : "not set"}`
);

// ✅ FIXED: Database configuration untuk Docker dan Local
let dbConfig;

if (process.env.DATABASE_URL) {
  // Use DATABASE_URL (Docker environment)
  console.log("📊 Using DATABASE_URL for connection");
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: false,
  };
} else {
  // Local development configuration
  console.log("📊 Using individual environment variables");
  dbConfig = {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 5433,
    database: process.env.DB_NAME || "bookingdb",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "bookingpassword",
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: false,
  };
}

console.log("🔗 Database connection config:");
if (process.env.DATABASE_URL) {
  console.log(`   Using: DATABASE_URL (Docker)`);
} else {
  console.log(`   Host: ${dbConfig.host}`);
  console.log(`   Port: ${dbConfig.port}`);
  console.log(`   Database: ${dbConfig.database}`);
  console.log(`   User: ${dbConfig.user}`);
}

const pool = new Pool(dbConfig);

// ✅ Enhanced event handlers
pool.on("connect", (client) => {
  console.log("🗄️ ✅ PostgreSQL connection established");
  console.log(`📊 Active connections: ${pool.totalCount}/${pool.options.max}`);
});

pool.on("error", (err, client) => {
  console.error("❌ PostgreSQL pool error:", err.message);
  console.error("💡 Troubleshooting:");

  if (process.env.NODE_ENV === "production") {
    console.error(
      "   1. Check if postgres-booking container is running: docker ps | grep postgres-booking"
    );
    console.error("   2. Check DATABASE_URL environment variable");
    console.error(
      "   3. Test connection: docker exec booking-service pg_isready -h postgres-booking -p 5432"
    );
  } else {
    console.error(
      "   1. Check if PostgreSQL is running: docker ps | grep postgres"
    );
    console.error("   2. Verify .env configuration");
    console.error(
      "   3. Test connection: psql postgresql://postgres:bookingpassword@localhost:5433/bookingdb"
    );
  }
});

// ✅ Test connection function
const testConnection = async () => {
  let client;
  try {
    console.log("🔍 Testing database connection...");
    client = await pool.connect();

    const result = await client.query(
      "SELECT NOW() as current_time, version() as version"
    );
    console.log("✅ Database connection successful!");
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].version.split(" ")[0]}`);

    // Check if bookings table exists
    const tableCheck = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'bookings'
    `);

    if (tableCheck.rows.length > 0) {
      const count = await client.query(
        "SELECT COUNT(*) as count FROM bookings"
      );
      console.log(
        `📋 Bookings table: ✅ found (${count.rows[0].count} records)`
      );
    } else {
      console.log("📋 Bookings table: ❌ not found - need migration");
    }

    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    if (process.env.NODE_ENV === "production") {
      console.error("💡 Docker troubleshooting:");
      console.error("   - Check if postgres-booking service is healthy");
      console.error("   - Verify DATABASE_URL points to postgres-booking:5432");
      console.error("   - Check Docker network connectivity");
    }

    return false;
  } finally {
    if (client) client.release();
  }
};

// ✅ Test on startup
testConnection();

// ✅ Export both pool and query method
module.exports = {
  pool,
  query: async (text, params) => {
    const client = await pool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } catch (error) {
      console.error("❌ Query error:", error.message);
      throw error;
    } finally {
      client.release();
    }
  },
  testConnection,
};
