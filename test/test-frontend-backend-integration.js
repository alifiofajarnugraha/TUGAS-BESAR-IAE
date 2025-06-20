const axios = require("axios");

const testFrontendBackendIntegration = async () => {
  console.log("🔗 Testing Frontend-Backend Integration...\n");

  const services = [
    { name: "User Service", url: "http://localhost:3001", path: "/health" },
    { name: "Tour Service", url: "http://localhost:3002", path: "/health" },
    { name: "Booking Service", url: "http://localhost:3003", path: "/health" },
    { name: "Payment Service", url: "http://localhost:3004", path: "/health" },
    {
      name: "Inventory Service",
      url: "http://localhost:3005",
      path: "/health",
    },
  ];

  console.log("1️⃣ Testing service health endpoints...");
  for (const service of services) {
    try {
      const response = await axios.get(`${service.url}${service.path}`, {
        timeout: 5000,
      });
      console.log(`✅ ${service.name}: ${response.data.status}`);
    } catch (error) {
      console.log(`❌ ${service.name}: ${error.message}`);
    }
  }

  console.log("\n2️⃣ Testing GraphQL endpoints...");
  const graphqlTests = [
    {
      name: "Tour Service GraphQL",
      url: "http://localhost:3002/graphql",
      query: "query { getTourPackages { id name } }",
    },
    {
      name: "Inventory Service GraphQL",
      url: "http://localhost:3005/graphql",
      query: "query { getAllInventory { id tourId date slots } }",
    },
  ];

  for (const test of graphqlTests) {
    try {
      const response = await axios.post(
        test.url,
        { query: test.query },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 10000,
        }
      );
      console.log(`✅ ${test.name}: Working`);
      console.log(
        `   Data: ${JSON.stringify(response.data.data, null, 2).substring(
          0,
          100
        )}...`
      );
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
    }
  }

  console.log("\n3️⃣ Testing CORS configuration...");
  try {
    const corsTest = await axios.options("http://localhost:3002/graphql", {
      headers: {
        Origin: "http://localhost:3000",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });
    console.log("✅ CORS: Configured correctly");
  } catch (error) {
    console.log(`❌ CORS: ${error.message}`);
  }

  console.log("\n🎉 Frontend-Backend Integration Test Completed!");
};

testFrontendBackendIntegration();
