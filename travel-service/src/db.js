import { Pool } from 'pg';

// ✅ FIXED: Create specific pools for each database
const dbs = {
  mainDB: new Pool({
    host: process.env.MAINDB_HOST || 'postgres-travel-main',
    port: process.env.MAINDB_PORT || 5432,
    user: process.env.MAINDB_USER || 'admin',
    password: process.env.MAINDB_PASSWORD || 'admin',
    database: process.env.MAINDB_NAME || 'main_db',
  }),
  
  travelScheduleDB: new Pool({
    host: process.env.TRAVELSCHEDULEDB_HOST || 'postgres-travel-schedule',
    port: process.env.TRAVELSCHEDULEDB_PORT || 5432,
    user: process.env.TRAVELSCHEDULEDB_USER || 'admin',
    password: process.env.TRAVELSCHEDULEDB_PASSWORD || 'admin',
    database: process.env.TRAVELSCHEDULEDB_NAME || 'travelschedule_db',
  }),
  
  bookingDB: new Pool({
    host: process.env.BOOKINGDB_HOST || 'postgres-travel-booking',
    port: process.env.BOOKINGDB_PORT || 5432,
    user: process.env.BOOKINGDB_USER || 'admin',
    password: process.env.BOOKINGDB_PASSWORD || 'admin',
    database: process.env.BOOKINGDB_NAME || 'booking_db',
  }),
  
  travelHistoryDB: new Pool({
    host: process.env.TRAVELHISTORYDB_HOST || 'postgres-travel-history',
    port: process.env.TRAVELHISTORYDB_PORT || 5432,
    user: process.env.TRAVELHISTORYDB_USER || 'admin',
    password: process.env.TRAVELHISTORYDB_PASSWORD || 'admin',
    database: process.env.TRAVELHISTORYDB_NAME || 'travelhistory_db',
  }),
  
  refundRequestDB: new Pool({
    host: process.env.REFUNDREQUESTDB_HOST || 'postgres-travel-refund',
    port: process.env.REFUNDREQUESTDB_PORT || 5432,
    user: process.env.REFUNDREQUESTDB_USER || 'admin',
    password: process.env.REFUNDREQUESTDB_PASSWORD || 'admin',
    database: process.env.REFUNDREQUESTDB_NAME || 'refundrequest_db',
  }),
  
  recommendationDB: new Pool({
    host: process.env.RECOMMENDATIONDB_HOST || 'postgres-travel-recommendation',
    port: process.env.RECOMMENDATIONDB_PORT || 5432,
    user: process.env.RECOMMENDATIONDB_USER || 'admin',
    password: process.env.RECOMMENDATIONDB_PASSWORD || 'admin',
    database: process.env.RECOMMENDATIONDB_NAME || 'recommendation_db',
  }),
};

// ✅ Enhanced graceful shutdown
const gracefulShutdown = async () => {
  console.log('🔌 Closing PostgreSQL pools...');
  try {
    await Promise.all(Object.values(dbs).map(pool => pool.end()));
    console.log('✅ All PostgreSQL pools closed successfully.');
  } catch (error) {
    console.error('❌ Error closing PostgreSQL pools:', error);
  }
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

export default dbs;