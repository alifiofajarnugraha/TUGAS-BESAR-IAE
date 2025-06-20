const axios = require("axios");

const waitForService = async (url, serviceName, maxRetries = 10) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await axios.get(url, { timeout: 3000 });
      console.log(`✅ ${serviceName} is ready`);
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for ${serviceName}... (${i + 1}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
  console.log(`❌ ${serviceName} failed to start after ${maxRetries} retries`);
  return false;
};

const testServices = async () => {
  console.log("🧪 Testing Booking & Payment Services with Docker Compose...\n");

  // Wait for services to be ready
  console.log("⏳ Waiting for services to start...");
  const bookingReady = await waitForService(
    "http://localhost:3003/health",
    "Booking Service"
  );
  const paymentReady = await waitForService(
    "http://localhost:3004/health",
    "Payment Service"
  );

  if (!bookingReady || !paymentReady) {
    console.log("\n❌ Some services are not ready. Please check:");
    console.log("   - docker-compose ps");
    console.log("   - docker-compose logs booking-service");
    console.log("   - docker-compose logs payment-service");
    return;
  }

  // Test Booking Service Health
  console.log("\n1️⃣ Testing Booking Service Health...");
  try {
    const bookingHealth = await axios.get("http://localhost:3003/health");
    console.log("✅ Booking Service Health:", bookingHealth.data);
  } catch (error) {
    console.log("❌ Booking Service Error:", error.message);
    if (error.response) {
      console.log("   Response Status:", error.response.status);
      console.log("   Response Data:", error.response.data);
    }
  }

  // Test Payment Service Health
  console.log("\n2️⃣ Testing Payment Service Health...");
  try {
    const paymentHealth = await axios.get("http://localhost:3004/health");
    console.log("✅ Payment Service Health:", paymentHealth.data);
  } catch (error) {
    console.log("❌ Payment Service Error:", error.message);
  }

  // Test GraphQL Schema Availability
  console.log("\n3️⃣ Testing GraphQL Schemas...");
  try {
    const bookingSchema = await axios.post("http://localhost:3003/graphql", {
      query: `query { __schema { queryType { name } mutationType { name } } }`,
    });
    console.log("✅ Booking GraphQL Schema available");

    const paymentSchema = await axios.post("http://localhost:3004/graphql", {
      query: `query { __schema { queryType { name } mutationType { name } } }`,
    });
    console.log("✅ Payment GraphQL Schema available");
  } catch (error) {
    console.log("❌ GraphQL Schema Error:", error.message);
  }

  // Test Cross-Service Communication
  console.log("\n4️⃣ Testing Cross-Service Communication...");
  try {
    console.log("   📝 Creating booking...");
    const booking = await axios.post("http://localhost:3003/graphql", {
      query: `
        mutation {
          createBooking(input: {
            userId: "USER001"
            tourId: "TOUR001"
            departureDate: "2024-02-15"
            participants: 2
            notes: "Test booking from Docker Compose"
          }) {
            id
            userId
            tourId
            totalCost
            paymentStatus
            status
            departureDate
            participants
            notes
          }
        }
      `,
    });

    if (booking.data.errors) {
      console.log("❌ Booking GraphQL Errors:", booking.data.errors);
    } else if (booking.data.data?.createBooking) {
      const bookingData = booking.data.data.createBooking;
      console.log("✅ Booking Created:", {
        id: bookingData.id,
        totalCost: bookingData.totalCost,
        paymentStatus: bookingData.paymentStatus,
        status: bookingData.status,
      });

      // Process payment
      console.log("\n   💳 Processing payment...");
      const payment = await axios.post("http://localhost:3004/graphql", {
        query: `
          mutation {
            processPayment(input: {
              method: "credit card"
              amount: ${bookingData.totalCost}
              bookingId: "${bookingData.id}"
              userId: "${bookingData.userId}"
            }) {
              id
              method
              amount
              status
              invoiceNumber
              bookingId
              userId
              createdAt
            }
          }
        `,
      });

      if (payment.data.errors) {
        console.log("❌ Payment GraphQL Errors:", payment.data.errors);
      } else if (payment.data.data?.processPayment) {
        const paymentData = payment.data.data.processPayment;
        console.log("✅ Payment Processed:", {
          id: paymentData.id,
          amount: paymentData.amount,
          status: paymentData.status,
          invoiceNumber: paymentData.invoiceNumber,
          bookingId: paymentData.bookingId,
        });

        // Update payment status
        console.log("\n   📋 Updating payment status...");
        const updatePayment = await axios.post(
          "http://localhost:3004/graphql",
          {
            query: `
            mutation {
              updatePaymentStatus(paymentId: "${paymentData.id}", status: "completed") {
                id
                status
                message
                payment {
                  id
                  status
                  amount
                  bookingId
                }
              }
            }
          `,
          }
        );

        if (updatePayment.data.errors) {
          console.log("❌ Payment Update Errors:", updatePayment.data.errors);
        } else {
          console.log(
            "✅ Payment Status Updated:",
            updatePayment.data.data?.updatePaymentStatus
          );
        }

        // Verify final booking status
        console.log("\n   🔍 Verifying final booking status...");
        const finalBooking = await axios.post("http://localhost:3003/graphql", {
          query: `
            query {
              getBooking(id: "${bookingData.id}") {
                id
                status
                paymentStatus
                totalCost
              }
            }
          `,
        });

        if (finalBooking.data.data?.getBooking) {
          console.log(
            "✅ Final Booking Status:",
            finalBooking.data.data.getBooking
          );
        }
      }
    } else {
      console.log("❌ No booking data returned");
    }
  } catch (error) {
    console.log("❌ Cross-Service Error:", error.message);
    if (error.response?.data) {
      console.log("   Response Data:", error.response.data);
    }
  }

  // Test service discovery
  console.log("\n5️⃣ Testing Service Discovery...");
  try {
    const bookings = await axios.post("http://localhost:3003/graphql", {
      query: `query { getAllBookings { id status paymentStatus totalCost } }`,
    });

    const payments = await axios.post("http://localhost:3004/graphql", {
      query: `query { listPayments { id status amount bookingId } }`,
    });

    console.log(
      "✅ Total Bookings:",
      bookings.data.data?.getAllBookings?.length || 0
    );
    console.log(
      "✅ Total Payments:",
      payments.data.data?.listPayments?.length || 0
    );
  } catch (error) {
    console.log("❌ Service Discovery Error:", error.message);
  }

  console.log("\n🎉 Test completed!");
  console.log("\n💡 Debug commands:");
  console.log("   docker-compose ps");
  console.log("   docker-compose logs booking-service");
  console.log("   docker-compose logs payment-service");
  console.log("   docker-compose logs postgres-booking");
  console.log("   docker-compose logs mongo-payment");
};

// Handle script timeout
const timeout = setTimeout(() => {
  console.error("\n⏰ Test timeout after 60 seconds");
  process.exit(1);
}, 60000);

testServices()
  .then(() => {
    clearTimeout(timeout);
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error("\n💥 Test failed:", error.message);
    process.exit(1);
  });
