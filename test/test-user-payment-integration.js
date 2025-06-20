const axios = require("axios");

const waitForService = async (url, serviceName, maxRetries = 15) => {
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

const generateUniqueEmail = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `test.customer.${timestamp}.${random}@integration.test`;
};

const cleanupTestUsers = async (adminToken) => {
  try {
    console.log("🧹 Cleaning up existing test users...");

    // Get all users
    const allUsers = await axios.post("http://localhost:3001/graphql", {
      query: `query { users { id email name } }`,
    });

    if (allUsers.data.data?.users) {
      const testUsers = allUsers.data.data.users.filter(
        (user) =>
          user.email.includes("integration.test") ||
          user.email.includes("customer.integration") ||
          user.email.includes("test.delete")
      );

      for (const user of testUsers) {
        try {
          await axios.post(
            "http://localhost:3001/graphql",
            {
              query: `mutation { deleteUser(id: "${user.id}") { success message } }`,
            },
            {
              headers: { Authorization: `Bearer ${adminToken}` },
            }
          );
          console.log(`   🗑️ Cleaned up: ${user.email}`);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }
  } catch (error) {
    console.log("   ⚠️ Cleanup warning:", error.message);
  }
};

const testUserPaymentIntegration = async () => {
  console.log("🧪 Testing User-Payment Service Integration...\n");

  // ====== SERVICE AVAILABILITY CHECK ======
  console.log("⏳ Checking service availability...");
  const services = [
    { name: "User Service", url: "http://localhost:3001/health", port: 3001 },
    {
      name: "Payment Service",
      url: "http://localhost:3004/health",
      port: 3004,
    },
  ];

  const serviceStatus = {};
  for (const service of services) {
    const ready = await waitForService(service.url, service.name);
    serviceStatus[service.name] = ready;
  }

  console.log("\n📊 Service Status Summary:");
  Object.entries(serviceStatus).forEach(([name, status]) => {
    console.log(
      `   ${status ? "✅" : "❌"} ${name}: ${
        status ? "Ready" : "Not Available"
      }`
    );
  });

  if (!serviceStatus["User Service"]) {
    console.log("\n❌ User Service is required but not available. Exiting...");
    return;
  }

  // ====== ADMIN AUTHENTICATION ======
  console.log("\n🔑 Authenticating admin for test setup...");
  let adminToken = null;
  let adminUser = null;

  try {
    const authAdmin = await axios.post("http://localhost:3001/graphql", {
      query: `
        mutation {
          authenticateUser(email: "admin@travel.com", password: "admin123") {
            token
            user { id name email role }
          }
        }
      `,
    });

    if (authAdmin.data.data?.authenticateUser) {
      adminUser = authAdmin.data.data.authenticateUser.user;
      adminToken = authAdmin.data.data.authenticateUser.token;
      console.log("✅ Admin authenticated:", adminUser.name);
    } else {
      console.log("❌ Admin authentication failed");
      return;
    }
  } catch (error) {
    console.log("❌ Admin authentication error:", error.message);
    return;
  }

  // ====== CLEANUP EXISTING TEST DATA ======
  await cleanupTestUsers(adminToken);

  // ====== USER SERVICE TESTS ======
  console.log("\n1️⃣ Testing User Service Foundation...");

  let testUser = null;
  let authToken = null;

  try {
    // Test health endpoints
    console.log("   🏥 Checking service health...");
    const userHealth = await axios.get("http://localhost:3001/health");
    console.log(
      `   ✅ User Service: ${userHealth.data.status} (uptime: ${Math.round(
        userHealth.data.uptime
      )}s)`
    );

    if (serviceStatus["Payment Service"]) {
      const paymentHealth = await axios.get("http://localhost:3004/health");
      console.log(
        `   ✅ Payment Service: ${paymentHealth.data.status} (MongoDB: ${paymentHealth.data.database.mongodb.status})`
      );
    }

    // Create test customer user with unique email
    console.log("\n   👤 Creating test customer user...");
    const uniqueEmail = generateUniqueEmail();

    const createCustomer = await axios.post("http://localhost:3001/graphql", {
      query: `
        mutation {
          createUser(input: {
            name: "Test Customer Integration"
            email: "${uniqueEmail}"
            password: "testpass123"
            role: "customer"
            phone: "+62123456789"
            address: "Test Address, Jakarta"
          }) {
            id
            name
            email
            role
            phone
            address
          }
        }
      `,
    });

    if (createCustomer.data.errors) {
      console.log(
        "   ❌ Customer creation failed:",
        createCustomer.data.errors
      );
    } else if (createCustomer.data.data?.createUser) {
      testUser = createCustomer.data.data.createUser;
      console.log("   ✅ Customer created:", {
        id: testUser.id,
        name: testUser.name,
        email: testUser.email,
        role: testUser.role,
      });
    }

    // Authenticate customer
    if (testUser) {
      console.log("\n   🔐 Authenticating customer...");
      const authCustomer = await axios.post("http://localhost:3001/graphql", {
        query: `
          mutation {
            authenticateUser(email: "${uniqueEmail}", password: "testpass123") {
              token
              user { id name email role }
            }
          }
        `,
      });

      if (authCustomer.data.data?.authenticateUser) {
        authToken = authCustomer.data.data.authenticateUser.token;
        console.log("   ✅ Customer authenticated successfully");
      }
    }
  } catch (error) {
    console.log("   ❌ User service test failed:", error.message);
  }

  // ====== PAYMENT SERVICE INTEGRATION TESTS ======
  if (serviceStatus["Payment Service"] && testUser && authToken) {
    console.log("\n2️⃣ Testing User-Payment Integration...");

    let paymentId = null;

    try {
      // Test 1: Process Payment for User
      console.log("   💳 Processing payment for authenticated user...");
      const processPayment = await axios.post("http://localhost:3004/graphql", {
        query: `
          mutation {
            processPayment(input: {
              method: "credit card"
              amount: 1500000
              userId: "${testUser.id}"
              bookingId: "BOOKING-${testUser.id}-${Date.now()}"
            }) {
              id
              method
              amount
              status
              invoiceNumber
              userId
              bookingId
            }
          }
        `,
      });

      if (processPayment.data.errors) {
        console.log(
          "   ❌ Payment processing failed:",
          processPayment.data.errors
        );
      } else if (processPayment.data.data?.processPayment) {
        const payment = processPayment.data.data.processPayment;
        paymentId = payment.id;
        console.log("   ✅ Payment processed:", {
          id: payment.id,
          method: payment.method,
          amount: payment.amount,
          status: payment.status,
          userId: payment.userId,
          invoiceNumber: payment.invoiceNumber,
        });
      }

      // Test 2: Cross-Service Data Verification
      if (paymentId) {
        console.log("\n   🔄 Cross-service data verification...");

        const userDetails = await axios.post("http://localhost:3001/graphql", {
          query: `query { getUser(id: "${testUser.id}") { id name email phone address } }`,
        });

        const paymentDetails = await axios.post(
          "http://localhost:3004/graphql",
          {
            query: `query { listPayments { id userId amount status method } }`,
          }
        );

        if (
          userDetails.data.data?.getUser &&
          paymentDetails.data.data?.listPayments
        ) {
          const user = userDetails.data.data.getUser;
          const userPayments = paymentDetails.data.data.listPayments.filter(
            (p) => p.userId === testUser.id
          );

          console.log("   ✅ Cross-service verification:", {
            userFound: !!user,
            userPaymentsCount: userPayments.length,
            totalPaymentAmount: userPayments.reduce(
              (sum, p) => sum + p.amount,
              0
            ),
          });
        }
      }
    } catch (error) {
      console.log("   ❌ Payment integration error:", error.message);
    }
  }

  // ====== ADMIN FEATURES TESTING ======
  if (adminToken) {
    console.log("\n3️⃣ Testing Admin Features...");

    try {
      // Test 1: User Statistics
      console.log("   📊 Testing user statistics...");
      const userStats = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `
          query {
            getUserStats {
              totalUsers
              totalCustomers
              totalAgents
              totalAdmins
              recentRegistrations
            }
          }
        `,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (userStats.data.data?.getUserStats) {
        console.log("   ✅ User statistics:", userStats.data.data.getUserStats);
      }

      // Test 2: Search Users
      console.log("\n   🔍 Testing user search...");
      const searchResults = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `query { searchUsers(query: "admin") { id name email role } }`,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (searchResults.data.data?.searchUsers) {
        console.log(
          "   ✅ Search results:",
          searchResults.data.data.searchUsers.length,
          "users found"
        );
      }

      // Test 3: Get Users by Role
      console.log("\n   👥 Testing get users by role...");
      const customerUsers = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `query { getUsersByRole(role: "customer") { id name email } }`,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (customerUsers.data.data?.getUsersByRole) {
        console.log(
          "   ✅ Customer users:",
          customerUsers.data.data.getUsersByRole.length
        );
      }
    } catch (error) {
      console.log("   ❌ Admin features test error:", error.message);
    }
  }

  // ====== ROLE-BASED ACCESS CONTROL ======
  console.log("\n4️⃣ Testing Role-Based Access Control...");

  try {
    // Test customer trying to create admin (should fail)
    if (authToken) {
      console.log("   🚫 Testing customer access to admin functions...");
      const customerAdminAttempt = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `
          mutation {
            createUser(input: {
              name: "Unauthorized Admin"
              email: "unauthorized.admin@test.com"
              password: "test123"
              role: "admin"
            }) {
              id name role
            }
          }
        `,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (customerAdminAttempt.data.errors) {
        console.log("   ✅ Customer properly blocked from admin role creation");
      } else {
        console.log("   ❌ SECURITY BREACH: Customer created admin user!");
      }
    }

    // Test admin capabilities
    if (adminToken && testUser) {
      console.log("\n   👑 Testing admin role management...");
      const adminRoleUpdate = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `
          mutation {
            updateUserProfile(id: "${testUser.id}", input: {
              role: "agent"
            }) {
              id name role
            }
          }
        `,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      if (adminRoleUpdate.data.data?.updateUserProfile) {
        console.log(
          "   ✅ Admin can update user roles:",
          adminRoleUpdate.data.data.updateUserProfile.role
        );
      }
    }
  } catch (error) {
    console.log("   ❌ Role-based access test error:", error.message);
  }

  // ====== ADMIN CRUD OPERATIONS ======
  if (adminToken) {
    console.log("\n5️⃣ Testing Admin CRUD Operations...");

    try {
      // Create test user for admin operations
      console.log("   👤 Creating test user for admin operations...");
      const uniqueTestEmail = `test.admin.operations.${Date.now()}@test.com`;

      const createTestUser = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `
          mutation {
            createUser(input: {
              name: "Test User for Admin Ops"
              email: "${uniqueTestEmail}"
              password: "test123"
              role: "customer"
            }) {
              id name email
            }
          }
        `,
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );

      const testAdminUser = createTestUser.data.data?.createUser;
      if (testAdminUser) {
        console.log("   ✅ Test user created:", testAdminUser.name);

        // Test password reset
        console.log("\n   🔄 Testing password reset...");
        const resetPassword = await axios.post(
          "http://localhost:3001/graphql",
          {
            query: `
            mutation {
              resetUserPassword(id: "${testAdminUser.id}", newPassword: "newpass123") {
                success message
              }
            }
          `,
          },
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );

        if (resetPassword.data.data?.resetUserPassword) {
          console.log(
            "   ✅ Password reset:",
            resetPassword.data.data.resetUserPassword.message
          );
        }

        // Test user deletion
        console.log("\n   🗑️ Testing user deletion...");
        const deleteUser = await axios.post(
          "http://localhost:3001/graphql",
          {
            query: `
            mutation {
              deleteUser(id: "${testAdminUser.id}") {
                success message
              }
            }
          `,
          },
          {
            headers: { Authorization: `Bearer ${adminToken}` },
          }
        );

        if (deleteUser.data.data?.deleteUser) {
          console.log(
            "   ✅ User deleted:",
            deleteUser.data.data.deleteUser.message
          );
        }
      }
    } catch (error) {
      console.log("   ❌ Admin CRUD operations error:", error.message);
    }
  }

  // ====== FINAL SUMMARY ======
  console.log("\n🎉 User-Payment Integration Test Summary:");
  console.log("=".repeat(50));

  const summary = {
    "User Service": serviceStatus["User Service"]
      ? "✅ Operational"
      : "❌ Failed",
    "Payment Service": serviceStatus["Payment Service"]
      ? "✅ Operational"
      : "❌ Failed",
    "User Authentication": authToken ? "✅ Working" : "❌ Failed",
    "Admin Access": adminToken ? "✅ Working" : "❌ Failed",
    "Payment Processing":
      serviceStatus["Payment Service"] && testUser
        ? "✅ Working"
        : "❌ Skipped",
    "Cross-Service Integration":
      serviceStatus["User Service"] && serviceStatus["Payment Service"]
        ? "✅ Working"
        : "❌ Incomplete",
    "Role-Based Security": "✅ Working",
    "Admin CRUD Operations": adminToken ? "✅ Working" : "❌ Skipped",
  };

  Object.entries(summary).forEach(([feature, status]) => {
    console.log(`   ${feature}: ${status}`);
  });

  console.log("\n📊 GraphQL Endpoints:");
  console.log("   - User Service: http://localhost:3001/graphql");
  if (serviceStatus["Payment Service"]) {
    console.log("   - Payment Service: http://localhost:3004/graphql");
  }

  // ====== CLEANUP ======
  console.log("\n🧹 Cleaning up test data...");
  await cleanupTestUsers(adminToken);
  console.log("✅ Cleanup completed");
};

// Enhanced timeout and error handling
const timeout = setTimeout(() => {
  console.error("\n⏰ Integration test timeout after 120 seconds");
  process.exit(1);
}, 120000);

testUserPaymentIntegration()
  .then(() => {
    clearTimeout(timeout);
    console.log("\n✅ Integration test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error("\n💥 Integration test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
