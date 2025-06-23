import { Pool } from "pg";
import fs from "fs";
import path from "path";

// ✅ FIXED: Database configurations with separate containers
const databases = [
  {
    name: "main_db",
    config: {
      host: process.env.MAINDB_HOST || "postgres-travel-main",
      port: process.env.MAINDB_PORT || 5432,
      user: process.env.MAINDB_USER || "admin",
      password: process.env.MAINDB_PASSWORD || "admin",
      database: process.env.MAINDB_NAME || "main_db",
    },
    initScript: "init.sql",
  },
  {
    name: "travelschedule_db",
    config: {
      host: process.env.TRAVELSCHEDULEDB_HOST || "postgres-travel-schedule",
      port: process.env.TRAVELSCHEDULEDB_PORT || 5432,
      user: process.env.TRAVELSCHEDULEDB_USER || "admin",
      password: process.env.TRAVELSCHEDULEDB_PASSWORD || "admin",
      database: process.env.TRAVELSCHEDULEDB_NAME || "travelschedule_db",
    },
    initScript: "init_travelschedule_db.sql",
  },
  {
    name: "booking_db",
    config: {
      host: process.env.BOOKINGDB_HOST || "postgres-travel-booking",
      port: process.env.BOOKINGDB_PORT || 5432,
      user: process.env.BOOKINGDB_USER || "admin",
      password: process.env.BOOKINGDB_PASSWORD || "admin",
      database: process.env.BOOKINGDB_NAME || "booking_db",
    },
    initScript: "init_booking_db.sql",
  },
  {
    name: "travelhistory_db",
    config: {
      host: process.env.TRAVELHISTORYDB_HOST || "postgres-travel-history",
      port: process.env.TRAVELHISTORYDB_PORT || 5432,
      user: process.env.TRAVELHISTORYDB_USER || "admin",
      password: process.env.TRAVELHISTORYDB_PASSWORD || "admin",
      database: process.env.TRAVELHISTORYDB_NAME || "travelhistory_db",
    },
    initScript: "init_travelhistory_db.sql",
  },
  {
    name: "refundrequest_db",
    config: {
      host: process.env.REFUNDREQUESTDB_HOST || "postgres-travel-refund",
      port: process.env.REFUNDREQUESTDB_PORT || 5432,
      user: process.env.REFUNDREQUESTDB_USER || "admin",
      password: process.env.REFUNDREQUESTDB_PASSWORD || "admin",
      database: process.env.REFUNDREQUESTDB_NAME || "refundrequest_db",
    },
    initScript: "init_refundrequest_db.sql",
  },
  {
    name: "recommendation_db",
    config: {
      host:
        process.env.RECOMMENDATIONDB_HOST || "postgres-travel-recommendation",
      port: process.env.RECOMMENDATIONDB_PORT || 5432,
      user: process.env.RECOMMENDATIONDB_USER || "admin",
      password: process.env.RECOMMENDATIONDB_PASSWORD || "admin",
      database: process.env.RECOMMENDATIONDB_NAME || "recommendation_db",
    },
    initScript: "init_recommendation_db.sql",
  },
];

// ✅ Wait for PostgreSQL to be ready
const waitForPostgres = async (config, maxRetries = 30) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const pool = new Pool(config);
      await pool.query("SELECT 1");
      await pool.end();
      console.log(`✅ ${config.host}:${config.port} is ready`);
      return true;
    } catch (error) {
      console.log(
        `⏳ Waiting for ${config.host}:${config.port}... (${
          i + 1
        }/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  throw new Error(
    `❌ ${config.host}:${config.port} not ready after ${maxRetries} attempts`
  );
};

// ✅ Run SQL file on specific database
const runSqlFileOnPg = async (config, sqlFilePath) => {
  const pool = new Pool(config);
  try {
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8");
    console.log(
      `📊 Executing SQL from ${sqlFilePath} on ${config.host}:${config.port}/${config.database}`
    );
    await pool.query(sqlContent);
    console.log(`✅ SQL executed successfully on ${config.database}`);
  } catch (error) {
    console.error(
      `❌ Error executing SQL on ${config.database}:`,
      error.message
    );
    throw error;
  } finally {
    await pool.end();
  }
};

// ✅ Initialize databases
const initializeDatabases = async () => {
  console.log("🚀 Starting PostgreSQL database initialization process...");

  for (const db of databases) {
    try {
      console.log(`🔧 Initializing ${db.name}...`);

      // Wait for specific PostgreSQL container to be ready
      await waitForPostgres(db.config);

      // Check if init script exists
      const scriptPath = path.join(process.cwd(), "db", db.initScript);
      if (!fs.existsSync(scriptPath)) {
        console.log(
          `⚠️ No init script found for ${db.name} at ${scriptPath}, skipping...`
        );
        continue;
      }

      // Run initialization script
      await runSqlFileOnPg(db.config, scriptPath);
      console.log(`✅ ${db.name} initialized successfully!`);
    } catch (error) {
      console.error(`❌ Error initializing ${db.name}:`, error);
      console.log(`⚠️ Failed to initialize ${db.name}.`);
      // Continue with other databases instead of stopping
    }
  }

  console.log("🎉 Database initialization process completed!");
};

// ✅ Main execution
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabases()
    .then(() => {
      console.log("✅ All database initializations completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Database initialization failed:", error);
      process.exit(1);
    });
}

export default initializeDatabases;
