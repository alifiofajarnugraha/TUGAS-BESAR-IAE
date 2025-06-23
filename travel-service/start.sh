#!/bin/sh
set -e

echo "🚀 Starting Travel Service initialization..."

# ✅ Install pg_isready if not available
if ! command -v pg_isready &> /dev/null; then
    echo "Installing postgresql-client..."
    apk add --no-cache postgresql-client
fi

# ✅ Function to wait for a specific database
wait_for_db() {
    local host=$1
    local port=$2
    local db=$3
    local user=$4
    local max_attempts=30
    local attempt=0
    
    echo "⏳ Waiting for $host:$port/$db..."
    
    while [ $attempt -lt $max_attempts ]; do
        if pg_isready -h "$host" -p "$port" -d "$db" -U "$user" > /dev/null 2>&1; then
            echo "✅ $host:$port/$db is ready!"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo "⏳ Attempt $attempt/$max_attempts - Waiting for $host:$port/$db..."
        sleep 2
    done
    
    echo "❌ Failed to connect to $host:$port/$db after $max_attempts attempts"
    return 1
}

# ✅ Wait for all required databases
echo "⏳ Waiting for PostgreSQL databases to be ready..."
wait_for_db "postgres-travel-main" "5432" "main_db" "admin" || exit 1
wait_for_db "postgres-travel-schedule" "5432" "travelschedule_db" "admin" || exit 1
wait_for_db "postgres-travel-booking" "5432" "booking_db" "admin" || exit 1
wait_for_db "postgres-travel-history" "5432" "travelhistory_db" "admin" || exit 1
wait_for_db "postgres-travel-refund" "5432" "refundrequest_db" "admin" || exit 1
wait_for_db "postgres-travel-recommendation" "5432" "recommendation_db" "admin" || exit 1

echo "🔧 All databases are ready. Initializing..."

# ✅ Initialize databases with error handling
echo "📊 Running database initialization..."
if node src/init-db.js; then
    echo "✅ Database initialization completed successfully!"
else
    echo "❌ Database initialization failed!"
    exit 1
fi

# ✅ Seed databases with error handling (optional)
echo "🌱 Running database seeding..."
if [ "${SKIP_SEEDING}" = "true" ]; then
    echo "⏭️ Skipping database seeding (SKIP_SEEDING=true)"
else
    if node src/seed.js; then
        echo "✅ Database seeding completed successfully!"
    else
        echo "⚠️ Database seeding failed, but continuing with startup..."
        # Don't exit here, allow service to start even if seeding fails
    fi
fi

# ✅ Start the application
echo "🚀 Starting Travel Service application..."
exec node src/index.js