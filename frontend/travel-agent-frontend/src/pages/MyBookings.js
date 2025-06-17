import React from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Box,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { QUERIES, MUTATIONS, bookingService } from "../services/api";

function MyBookings() {
  const [cancelDialog, setCancelDialog] = React.useState({
    open: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = React.useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { data, loading, error, refetch } = useQuery(
    QUERIES.GET_USER_BOOKINGS,
    {
      variables: { userId: user.id },
      client: bookingService,
      skip: !user.id,
    }
  );

  const [cancelBooking, { loading: cancelling }] = useMutation(
    MUTATIONS.CANCEL_BOOKING,
    {
      client: bookingService,
      onCompleted: () => {
        setCancelDialog({ open: false, booking: null });
        setCancelReason("");
        refetch();
      },
    }
  );

  const handleCancelBooking = async () => {
    if (!cancelDialog.booking) return;

    try {
      await cancelBooking({
        variables: {
          id: cancelDialog.booking.id,
          reason: cancelReason,
        },
      });
    } catch (err) {
      console.error("Cancel booking error:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "CONFIRMED":
        return "success";
      case "CANCELLED":
        return "error";
      case "COMPLETED":
        return "info";
      default:
        return "default";
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "warning";
      case "PAID":
        return "success";
      case "FAILED":
        return "error";
      case "REFUNDED":
        return "info";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">Error loading bookings: {error.message}</Alert>
      </Container>
    );
  }

  const bookings = data?.getUserBookings || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Bookings
      </Typography>

      {bookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No bookings found
          </Typography>
          <Typography color="text.secondary">
            Start exploring our tour packages to make your first booking!
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {bookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <Card>
                <CardContent>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={2}
                  >
                    <Typography variant="h6">Booking #{booking.id}</Typography>
                    <Box>
                      <Chip
                        label={booking.status}
                        color={getStatusColor(booking.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={booking.paymentStatus}
                        color={getPaymentStatusColor(booking.paymentStatus)}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Booking Date:{" "}
                    {new Date(booking.bookingDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    <strong>Departure:</strong>{" "}
                    {new Date(booking.departureDate).toLocaleDateString()}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    <strong>Participants:</strong> {booking.participants}
                  </Typography>

                  <Typography variant="body1" gutterBottom>
                    <strong>Total Cost:</strong>{" "}
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(booking.totalCost)}
                  </Typography>

                  {booking.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      <strong>Notes:</strong> {booking.notes}
                    </Typography>
                  )}

                  <Box sx={{ mt: 2 }}>
                    {booking.status === "PENDING" && (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => setCancelDialog({ open: true, booking })}
                        size="small"
                      >
                        Cancel Booking
                      </Button>
                    )}
                    {booking.status === "CONFIRMED" &&
                      booking.paymentStatus === "PENDING" && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            /* Navigate to payment */
                          }}
                        >
                          Pay Now
                        </Button>
                      )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancel Booking Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, booking: null })}
      >
        <DialogTitle>Cancel Booking</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to cancel this booking?
          </Typography>
          <TextField
            fullWidth
            label="Cancellation Reason (Optional)"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialog({ open: false, booking: null })}
          >
            Keep Booking
          </Button>
          <Button
            onClick={handleCancelBooking}
            color="error"
            disabled={cancelling}
          >
            {cancelling ? "Cancelling..." : "Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default MyBookings;
