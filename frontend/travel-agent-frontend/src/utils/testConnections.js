import { testServiceConnections } from "../services/api";

export const runConnectionTests = async () => {
  console.log("🔗 Testing Frontend-Backend Connections...\n");

  try {
    const results = await testServiceConnections();

    console.log("📊 Connection Test Results:");
    console.log("==========================");

    Object.entries(results).forEach(([service, result]) => {
      console.log(`${service}: ${result.status}`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
      if (result.data) {
        console.log(`   Data: ${JSON.stringify(result.data, null, 2)}`);
      }
    });

    return results;
  } catch (error) {
    console.error("❌ Connection test failed:", error);
    return { error: error.message };
  }
};

// Usage in components
export const useConnectionTest = () => {
  const [connectionStatus, setConnectionStatus] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const testConnections = async () => {
    setLoading(true);
    try {
      const results = await runConnectionTests();
      setConnectionStatus(results);
    } catch (error) {
      setConnectionStatus({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return { connectionStatus, testConnections, loading };
};
