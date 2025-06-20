const axios = require("axios");

const testPaymentService = async () => {
  try {
    console.log("🧪 Testing Payment Service...\n");

    // 1. Health Check
    console.log("1️⃣ Health Check...");
    const healthResponse = await axios.get("http://localhost:3004/health");
    console.log("✅ Health Check:", healthResponse.data);

    // 2. Test listPayments
    console.log("\n2️⃣ Testing listPayments...");
    const listResponse = await axios.post("http://localhost:3004/graphql", {
      query: `
        query {
          listPayments {
            id
            method
            amount
            status
          }
        }
      `,
    });
    console.log("✅ List Payments:", listResponse.data);

    // 3. Test processPayment
    console.log("\n3️⃣ Testing processPayment...");
    const paymentResponse = await axios.post("http://localhost:3004/graphql", {
      query: `
        mutation {
          processPayment(input: {
            method: "credit card"
            amount: 1500000
            bookingId: "TEST123"
            userId: "USER001"
          }) {
            id
            method
            amount
            status
            invoiceNumber
          }
        }
      `,
    });
    console.log("✅ Process Payment:", paymentResponse.data);

    console.log("\n🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
};

testPaymentService();
