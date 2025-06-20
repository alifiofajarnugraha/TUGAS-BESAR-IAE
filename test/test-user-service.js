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

const testUserService = async () => {
  console.log("🧪 Testing User Management Service with Docker Compose...\n");

  // Wait for services to be ready
  console.log("⏳ Waiting for services to start...");
  const userReady = await waitForService(
    "http://localhost:3001/health",
    "User Service"
  );

  if (!userReady) {
    console.log("\n❌ User service is not ready. Please check:");
    console.log("   - docker-compose ps");
    console.log("   - docker-compose logs user-service");
    console.log("   - docker-compose logs postgres-user");
    return;
  }

  // Test User Service Health
  console.log("\n1️⃣ Testing User Service Health...");
  try {
    const userHealth = await axios.get("http://localhost:3001/health");
    console.log("✅ User Service Health:", userHealth.data);
  } catch (error) {
    console.log("❌ User Service Error:", error.message);
    if (error.response) {
      console.log("   Response Status:", error.response.status);
      console.log("   Response Data:", error.response.data);
    }
  }

  // Test GraphQL Schema Availability
  console.log("\n2️⃣ Testing User GraphQL Schema...");
  try {
    const userSchema = await axios.post("http://localhost:3001/graphql", {
      query: `query { __schema { queryType { name } mutationType { name } } }`,
    });
    console.log("✅ User GraphQL Schema available");
    console.log("   Schema info:", userSchema.data.data.__schema);
  } catch (error) {
    console.log("❌ User GraphQL Schema Error:", error.message);
    if (error.response?.data) {
      console.log("   Response:", error.response.data);
    }
  }

  // Test User CRUD Operations
  console.log("\n3️⃣ Testing User CRUD Operations...");

  let createdUserId = null;
  let authToken = null;

  try {
    // 3.1 Create User
    console.log("   👤 Creating new user...");
    const createUser = await axios.post("http://localhost:3001/graphql", {
      query: `
        mutation {
          createUser(input: {
            name: "Test User"
            email: "testuser@example.com"
            password: "password123"
            role: "customer"
          }) {
            id
            name
            email
            role
          }
        }
      `,
    });

    if (createUser.data.errors) {
      console.log("❌ Create User Errors:", createUser.data.errors);
    } else if (createUser.data.data?.createUser) {
      const userData = createUser.data.data.createUser;
      createdUserId = userData.id;
      console.log("✅ User Created:", {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
    }

    // 3.2 Authenticate User
    console.log("\n   🔐 Authenticating user...");
    const authUser = await axios.post("http://localhost:3001/graphql", {
      query: `
        mutation {
          authenticateUser(email: "testuser@example.com", password: "password123") {
            token
            user {
              id
              name
              email
              role
            }
          }
        }
      `,
    });

    if (authUser.data.errors) {
      console.log("❌ Authentication Errors:", authUser.data.errors);
    } else if (authUser.data.data?.authenticateUser) {
      const authData = authUser.data.data.authenticateUser;
      authToken = authData.token;
      console.log("✅ User Authenticated:", {
        user: authData.user,
        tokenReceived: !!authData.token,
      });
    }

    // 3.3 Get Current User (with token)
    if (authToken) {
      console.log("\n   🔍 Getting current user with token...");
      const currentUser = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `
            query {
              getCurrentUser {
                id
                name
                email
                role
              }
            }
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (currentUser.data.errors) {
        console.log("❌ Get Current User Errors:", currentUser.data.errors);
      } else if (currentUser.data.data?.getCurrentUser) {
        console.log(
          "✅ Current User Retrieved:",
          currentUser.data.data.getCurrentUser
        );
      }
    }

    // 3.4 Get All Users
    console.log("\n   📋 Getting all users...");
    const allUsers = await axios.post("http://localhost:3001/graphql", {
      query: `
        query {
          users {
            id
            name
            email
            role
          }
        }
      `,
    });

    if (allUsers.data.errors) {
      console.log("❌ Get All Users Errors:", allUsers.data.errors);
    } else if (allUsers.data.data?.users) {
      console.log("✅ All Users Retrieved:", {
        totalUsers: allUsers.data.data.users.length,
        users: allUsers.data.data.users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
        })),
      });
    }

    // 3.5 Get Specific User
    if (createdUserId) {
      console.log("\n   🔍 Getting specific user...");
      const getUser = await axios.post("http://localhost:3001/graphql", {
        query: `
          query {
            getUser(id: "${createdUserId}") {
              id
              name
              email
              role
            }
          }
        `,
      });

      if (getUser.data.errors) {
        console.log("❌ Get User Errors:", getUser.data.errors);
      } else if (getUser.data.data?.getUser) {
        console.log("✅ Specific User Retrieved:", getUser.data.data.getUser);
      }
    }

    // 3.6 Update User Profile (with auth)
    if (createdUserId && authToken) {
      console.log("\n   ✏️ Updating user profile...");
      const updateUser = await axios.post(
        "http://localhost:3001/graphql",
        {
          query: `
            mutation {
              updateUserProfile(id: "${createdUserId}", input: {
                name: "Updated Test User"
              }) {
                id
                name
                email
                role
              }
            }
          `,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (updateUser.data.errors) {
        console.log("❌ Update User Errors:", updateUser.data.errors);
      } else if (updateUser.data.data?.updateUserProfile) {
        console.log(
          "✅ User Profile Updated:",
          updateUser.data.data.updateUserProfile
        );
      }
    }
  } catch (error) {
    console.log("❌ User CRUD Error:", error.message);
    if (error.response?.data) {
      console.log("   Response Data:", error.response.data);
    }
  }

  // Test Service Integration (Check if other services can call user service)
  console.log("\n4️⃣ Testing Service Integration...");

  // Check if user service can be reached from other services
  console.log("   🔗 Testing user service endpoints for other services...");
  try {
    // Test different user roles
    const testUsers = [
      { email: "admin@travel.com", role: "admin" },
      { email: "agent@travel.com", role: "agent" },
      { email: "customer@travel.com", role: "customer" },
    ];

    for (const testUser of testUsers) {
      console.log(`   Testing ${testUser.role} user: ${testUser.email}`);

      const userQuery = await axios.post("http://localhost:3001/graphql", {
        query: `
          query {
            users {
              id
              name
              email
              role
            }
          }
        `,
      });

      if (userQuery.data.data?.users) {
        const user = userQuery.data.data.users.find(
          (u) => u.email === testUser.email
        );
        if (user) {
          console.log(`   ✅ ${testUser.role} user found:`, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          });
        } else {
          console.log(
            `   ⚠️ ${testUser.role} user not found (sample data may not be loaded)`
          );
        }
      }
    }
  } catch (error) {
    console.log("❌ Service Integration Error:", error.message);
  }

  // Test Authentication and Authorization
  console.log("\n5️⃣ Testing Authentication & Authorization...");
  try {
    // Test invalid credentials
    console.log("   🔒 Testing invalid credentials...");
    const invalidAuth = await axios.post("http://localhost:3001/graphql", {
      query: `
        mutation {
          authenticateUser(email: "nonexistent@example.com", password: "wrongpassword") {
            token
            user {
              id
              name
            }
          }
        }
      `,
    });

    if (invalidAuth.data.errors) {
      console.log(
        "✅ Invalid credentials properly rejected:",
        invalidAuth.data.errors[0].message
      );
    } else {
      console.log("❌ Invalid credentials should have been rejected!");
    }

    // Test access without token
    console.log("\n   🚫 Testing protected endpoint without token...");
    const noTokenAccess = await axios.post("http://localhost:3001/graphql", {
      query: `
        query {
          getCurrentUser {
            id
            name
          }
        }
      `,
    });

    if (noTokenAccess.data.errors) {
      console.log(
        "✅ Protected endpoint properly secured:",
        noTokenAccess.data.errors[0].message
      );
    } else {
      console.log("❌ Protected endpoint should require authentication!");
    }
  } catch (error) {
    console.log("❌ Authentication Test Error:", error.message);
  }

  // Test Database Connection and Performance
  console.log("\n6️⃣ Testing Database Performance...");
  try {
    const startTime = Date.now();

    const performanceTest = await axios.post("http://localhost:3001/graphql", {
      query: `
        query {
          users {
            id
            name
            email
            role
          }
        }
      `,
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (performanceTest.data.data?.users) {
      console.log("✅ Database Performance Test:", {
        responseTime: `${responseTime}ms`,
        userCount: performanceTest.data.data.users.length,
        status:
          responseTime < 1000
            ? "Good"
            : responseTime < 3000
            ? "Acceptable"
            : "Slow",
      });
    }
  } catch (error) {
    console.log("❌ Database Performance Error:", error.message);
  }

  // Test Error Handling
  console.log("\n7️⃣ Testing Error Handling...");
  try {
    // Test duplicate email creation
    console.log("   📧 Testing duplicate email creation...");
    const duplicateUser = await axios.post("http://localhost:3001/graphql", {
      query: `
        mutation {
          createUser(input: {
            name: "Duplicate User"
            email: "testuser@example.com"
            password: "password123"
            role: "customer"
          }) {
            id
            name
            email
          }
        }
      `,
    });

    if (duplicateUser.data.errors) {
      console.log(
        "✅ Duplicate email properly handled:",
        duplicateUser.data.errors[0].message
      );
    } else {
      console.log("❌ Duplicate email should have been rejected!");
    }

    // Test invalid role
    console.log("\n   👥 Testing invalid role creation...");
    const invalidRole = await axios.post("http://localhost:3001/graphql", {
      query: `
        mutation {
          createUser(input: {
            name: "Invalid Role User"
            email: "invalidrole@example.com"
            password: "password123"
            role: "invalidrole"
          }) {
            id
            name
          }
        }
      `,
    });

    if (invalidRole.data.errors) {
      console.log(
        "✅ Invalid role properly handled:",
        invalidRole.data.errors[0].message
      );
    } else {
      console.log("❌ Invalid role should have been rejected!");
    }
  } catch (error) {
    console.log("❌ Error Handling Test Error:", error.message);
  }

  console.log("\n🎉 User Service Test Completed!");
  console.log("\n💡 Debug commands:");
  console.log("   docker-compose ps");
  console.log("   docker-compose logs user-service");
  console.log("   docker-compose logs postgres-user");
  console.log("\n📊 GraphQL Playground:");
  console.log("   http://localhost:3001/graphql");
};

// Handle script timeout
const timeout = setTimeout(() => {
  console.error("\n⏰ Test timeout after 60 seconds");
  process.exit(1);
}, 60000);

testUserService()
  .then(() => {
    clearTimeout(timeout);
    process.exit(0);
  })
  .catch((error) => {
    clearTimeout(timeout);
    console.error("\n💥 Test failed:", error.message);
    console.error(error.stack);
    process.exit(1);
  });
