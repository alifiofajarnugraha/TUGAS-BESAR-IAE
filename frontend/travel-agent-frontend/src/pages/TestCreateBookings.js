import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Add,
  CheckCircle,
  Error,
  Refresh,
  DataObject,
} from "@mui/icons-material";
import { bookingService, MUTATIONS } from "../services/api";

function TestCreateBookings() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ CREATE_BOOKING mutation
  const [createBooking, { loading: creating }] = useMutation(
    MUTATIONS.CREATE_BOOKING,
    {
      client: bookingService,
      onCompleted: (data) => {
        console.log("✅ Booking created:", data.createBooking);
        setResults((prev) => [
          ...prev,
          {
            status: "success",
            message: `Booking created: ${data.createBooking.id}`,
            data: data.createBooking,
          },
        ]);
      },
      onError: (error) => {
        console.error("❌ Create booking failed:", error);
        setResults((prev) => [
          ...prev,
          {
            status: "error",
            message: `Failed: ${error.message}`,
            error: error,
          },
        ]);
      },
    }
  );

  // ✅ Sample booking data untuk testing
  const sampleBookings = [
    {
      userId: "1", // Sesuai dengan User ID dari debug info
      tourId: "tour_bali_001",
      departureDate: "2024-07-15",
      participants: 2,
      totalCost: 5000000,
      notes: "🧪 Test booking #1 - Bali Adventure Package",
      paymentStatus: "PENDING",
    },
    {
      userId: "1",
      tourId: "tour_yogya_002",
      departureDate: "2024-08-10",
      participants: 4,
      totalCost: 8000000,
      notes: "🧪 Test booking #2 - Yogyakarta Cultural Tour",
      paymentStatus: "PENDING",
    },
    {
      userId: "1",
      tourId: "tour_lombok_003",
      departureDate: "2024-06-01", // Past date
      participants: 2,
      totalCost: 6500000,
      notes: "🧪 Test booking #3 - Lombok Beach Getaway (Completed)",
      paymentStatus: "PAID",
    },
    {
      userId: "1",
      tourId: "tour_bandung_004",
      departureDate: "2024-09-05",
      participants: 3,
      totalCost: 4500000,
      notes: "🧪 Test booking #4 - Bandung City Tour",
      paymentStatus: "PENDING",
    },
    {
      userId: "1",
      tourId: "tour_raja_ampat_005",
      departureDate: "2024-10-20",
      participants: 2,
      totalCost: 15000000,
      notes: "🧪 Test booking #5 - Raja Ampat Diving Expedition",
      paymentStatus: "PENDING",
    },
  ];

  // ✅ Create single booking
  const createSampleBooking = async (bookingData) => {
    try {
      setLoading(true);
      await createBooking({
        variables: {
          input: bookingData,
        },
      });
    } catch (error) {
      console.error("Create booking error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create all sample bookings
  const createAllSampleBookings = async () => {
    setResults([]);
    setLoading(true);

    for (let i = 0; i < sampleBookings.length; i++) {
      const booking = sampleBookings[i];
      console.log(`🔄 Creating booking ${i + 1}/${sampleBookings.length}...`);

      try {
        await createBooking({
          variables: {
            input: booking,
          },
        });

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to create booking ${i + 1}:`, error);
      }
    }

    setLoading(false);
  };

  // ✅ Clear results
  const clearResults = () => {
    setResults([]);
  };

  // ✅ Format currency
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper sx={{ p: 4, mb: 4, bgcolor: "primary.light" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          🧪 Test Create Booking Data
        </Typography>
        <Typography variant="h6">
          Create sample booking data untuk testing MyBookings page
        </Typography>
      </Paper>

      {/* Action Buttons */}
      <Box sx={{ mb: 4, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={createAllSampleBookings}
          disabled={loading || creating}
          startIcon={
            loading || creating ? <CircularProgress size={16} /> : <Add />
          }
          size="large"
        >
          {loading || creating
            ? "Creating Bookings..."
            : "Create All Sample Bookings"}
        </Button>

        <Button
          variant="outlined"
          onClick={clearResults}
          startIcon={<Refresh />}
        >
          Clear Results
        </Button>
      </Box>

      {/* Sample Data Preview */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📋 Sample Bookings to Create
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            User ID: <strong>1</strong> (sesuai dengan debug info)
          </Typography>

          <Grid container spacing={2}>
            {sampleBookings.map((booking, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        Booking #{index + 1}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => createSampleBooking(booking)}
                        disabled={loading || creating}
                      >
                        Create This
                      </Button>
                    </Box>

                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Tour:</strong> {booking.tourId}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Date:</strong> {booking.departureDate}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Participants:</strong> {booking.participants}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Cost:</strong> {formatPrice(booking.totalCost)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {booking.notes}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Creation Results
            </Typography>

            <List>
              {results.map((result, index) => (
                <Box key={index}>
                  <ListItem>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                      }}
                    >
                      {result.status === "success" ? (
                        <CheckCircle color="success" />
                      ) : (
                        <Error color="error" />
                      )}

                      <ListItemText
                        primary={result.message}
                        secondary={
                          result.data && (
                            <>
                              ID: {result.data.id} | Status:{" "}
                              {result.data.status} | Total:{" "}
                              {formatPrice(result.data.totalCost)}
                            </>
                          )
                        }
                      />
                    </Box>
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </Box>
              ))}
            </List>

            {results.filter((r) => r.status === "success").length > 0 && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ✅ {results.filter((r) => r.status === "success").length}{" "}
                  bookings created successfully!
                  <br />
                  💡 Now go to MyBookings page to see the data.
                </Typography>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: "grey.100" }}>
        <Typography variant="h6" gutterBottom>
          📋 Instructions
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          1. Click "Create All Sample Bookings" untuk membuat 5 booking test
          data
          <br />
          2. Tunggu hingga semua booking berhasil dibuat
          <br />
          3. Buka halaman MyBookings untuk melihat data yang baru dibuat
          <br />
          4. Data akan muncul dengan User ID: <strong>1</strong>
        </Typography>

        <Alert severity="info">
          <Typography variant="body2">
            💡 <strong>Tip:</strong> Jika masih tidak muncul data, coba refresh
            halaman MyBookings atau check User ID di localStorage.
          </Typography>
        </Alert>
      </Paper>
    </Container>
  );
}

export default TestCreateBookings;
