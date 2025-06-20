import React, { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import { runConnectionTests } from "../utils/testConnections";

export const TestConnection = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    const testResults = await runConnectionTests();
    setResults(testResults);
    setLoading(false);
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Service Connection Test
        </Typography>

        <Button
          variant="contained"
          onClick={handleTest}
          disabled={loading}
          fullWidth
          sx={{ mb: 2 }}
        >
          {loading ? "Testing..." : "Test All Connections"}
        </Button>

        {results && (
          <Box>
            {Object.entries(results).map(([service, result]) => (
              <Alert
                key={service}
                severity={result.status.includes("✅") ? "success" : "error"}
                sx={{ mb: 1 }}
              >
                <strong>{service}:</strong> {result.status}
                {result.error && <div>Error: {result.error}</div>}
              </Alert>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
