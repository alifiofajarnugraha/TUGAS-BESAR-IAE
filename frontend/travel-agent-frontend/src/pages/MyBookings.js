import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { useAuth } from "../context/AuthContext";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Alert,
} from "@mui/material";
import {
  CalendarToday,
  Group,
  Cancel,
  CheckCircle,
  Pending,
  Payment,
  Refresh,
  Visibility,
  ErrorOutline,
  Schedule,
  AttachMoney,
  Tour,
  Receipt,
  CreditCard,
  AccountBalanceWallet,
  CheckCircleOutline,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  bookingService,
  paymentService,
  QUERIES,
  MUTATIONS,
} from "../services/api";

function MyBookings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [paymentDialog, setPaymentDialog] = useState({
    open: false,
    booking: null,
  });
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");

  // ✅ REDIRECT: If not authenticated, redirect to login
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  // ✅ CLEAN: Use real user ID from AuthContext without debug logging
  const { data, loading, error, refetch } = useQuery(
    QUERIES.GET_USER_BOOKINGS,
    {
      variables: {
        userId: String(user?.id),
      },
      client: bookingService,
      skip: !user?.id,
      fetchPolicy: "cache-and-network",
    }
  );

  // ✅ Cancel booking mutation
  const [cancelBooking, { loading: cancelling }] = useMutation(
    MUTATIONS.CANCEL_BOOKING,
    {
      client: bookingService,
      onCompleted: () => {
        setCancelDialog({ open: false, booking: null });
        setCancelReason("");
        refetch();
      },
      onError: (err) => {
        console.error("Cancel booking error:", err);
      },
    }
  );

  // ✅ ADD: Create payment mutation
  const [createPayment, { loading: creatingPayment }] = useMutation(
    MUTATIONS.PROCESS_PAYMENT,
    {
      client: paymentService,
      onCompleted: (data) => {
        console.log("Payment created:", data.processPayment);
        setPaymentSuccess(
          `Payment created successfully! Invoice: ${data.processPayment.invoiceNumber}`
        );
        setPaymentError("");
        setPaymentDialog({ open: false, booking: null });
        refetch();
      },
      onError: (err) => {
        console.error("Payment creation error:", err);
        setPaymentError(`Failed to create payment: ${err.message}`);
      },
    }
  );

  // ✅ ADD: Complete payment mutation
  const [completePayment, { loading: completingPayment }] = useMutation(
    MUTATIONS.COMPLETE_PAYMENT,
    {
      client: paymentService,
      onCompleted: (data) => {
        console.log("Payment completed:", data.completePayment);
        setPaymentSuccess(
          "🎉 Payment completed successfully! Your booking is confirmed."
        );
        setPaymentError("");
        setPaymentDialog({ open: false, booking: null });
        refetch();
      },
      onError: (err) => {
        console.error("Payment completion error:", err);
        setPaymentError(`Failed to complete payment: ${err.message}`);
      },
    }
  );

  // ✅ Payment method options
  const paymentMethods = [
    { value: "transfer", label: "Bank Transfer", icon: <AttachMoney /> },
    { value: "e-wallet", label: "E-Wallet", icon: <AccountBalanceWallet /> },
    { value: "credit card", label: "Credit Card", icon: <CreditCard /> },
  ];

  // ✅ LOADING: Show loading while auth is loading
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Loading authentication...</Typography>
        </Paper>
      </Container>
    );
  }

  // ✅ NOT AUTHENTICATED
  if (!isAuthenticated || !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <ErrorOutline sx={{ fontSize: 64, color: "warning.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Please log in to view your bookings
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/login")}
            sx={{ mt: 2 }}
          >
            Go to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleCancelBooking = async () => {
    if (!cancelDialog.booking) return;

    try {
      await cancelBooking({
        variables: {
          id: cancelDialog.booking.id,
          reason: cancelReason || "Cancelled by user",
        },
      });
    } catch (err) {
      console.error("Cancel booking error:", err);
    }
  };

  // ✅ ADD: Payment handlers
  const handlePayNow = (booking) => {
    setPaymentDialog({ open: true, booking });
    setPaymentMethod("transfer");
    setPaymentError("");
    setPaymentSuccess("");
  };

  const handleCreatePayment = async () => {
    if (!paymentDialog.booking) return;

    try {
      const booking = paymentDialog.booking;

      const paymentInput = {
        method: paymentMethod,
        amount: parseFloat(booking.totalCost),
        bookingId: booking.id,
        userId: user.id,
      };

      await createPayment({
        variables: {
          input: paymentInput,
        },
      });
    } catch (error) {
      console.error("Payment creation failed:", error);
    }
  };

  const handleCompletePayment = async (paymentId) => {
    try {
      await completePayment({
        variables: { paymentId },
      });
    } catch (error) {
      console.error("Payment completion failed:", error);
    }
  };

  // ✅ ADD: View details handler
  const handleViewDetails = (booking) => {
    // Create a detailed booking info page or modal
    navigate(`/booking-details/${booking.id}`, {
      state: { booking },
    });
  };

  // ✅ Status color mapping
  const getStatusColor = (status) => {
    const statusMap = {
      PENDING: "warning",
      CONFIRMED: "success",
      CANCELLED: "error",
      COMPLETED: "info",
      default: "default",
    };
    return statusMap[status] || statusMap.default;
  };

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      PENDING: "warning",
      PAID: "success",
      FAILED: "error",
      REFUNDED: "info",
      default: "default",
    };
    return statusMap[status] || statusMap.default;
  };

  // ✅ Format functions
  const formatPrice = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ✅ Filter bookings by status
  const bookings = data?.getUserBookings || [];
  const filteredBookings = () => {
    switch (currentTab) {
      case 0:
        return bookings; // All
      case 1:
        return bookings.filter((b) => b.status === "PENDING");
      case 2:
        return bookings.filter((b) => b.status === "CONFIRMED");
      case 3:
        return bookings.filter((b) => b.status === "COMPLETED");
      case 4:
        return bookings.filter((b) => b.status === "CANCELLED");
      default:
        return bookings;
    }
  };

  // ✅ Get booking statistics
  const getBookingStats = () => {
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === "PENDING").length,
      confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
      completed: bookings.filter((b) => b.status === "COMPLETED").length,
      cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
      unpaid: bookings.filter((b) => b.paymentStatus === "PENDING").length,
    };
  };

  const stats = getBookingStats();

  // ✅ Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>Loading your bookings...</Typography>
          </Box>
          <LinearProgress />
        </Paper>
      </Container>
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <ErrorOutline sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Unable to Load Bookings
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {error.message}
          </Typography>
          <Button
            variant="contained"
            onClick={() => refetch()}
            startIcon={<Refresh />}
          >
            Try Again
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* ✅ Payment/Cancel Success Messages */}
        <AnimatePresence>
          {paymentSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                severity="success"
                sx={{ mb: 3 }}
                onClose={() => setPaymentSuccess("")}
              >
                {paymentSuccess}
              </Alert>
            </motion.div>
          )}
          {paymentError && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                onClose={() => setPaymentError("")}
              >
                {paymentError}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ✅ Header Section */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                My Bookings
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Welcome back, {user?.name}! Here are your travel bookings.
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h2" sx={{ fontWeight: 700 }}>
                {stats.total}
              </Typography>
              <Typography variant="body1">Total Bookings</Typography>
            </Box>
          </Box>
        </Paper>

        {/* ✅ Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Badge badgeContent={stats.pending} color="warning">
                <Pending sx={{ fontSize: 40, color: "warning.main" }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {stats.pending}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Badge badgeContent={stats.confirmed} color="success">
                <CheckCircle sx={{ fontSize: 40, color: "success.main" }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {stats.confirmed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Confirmed
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Badge badgeContent={stats.completed} color="info">
                <Tour sx={{ fontSize: 40, color: "info.main" }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {stats.completed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Completed
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Badge badgeContent={stats.cancelled} color="error">
                <Cancel sx={{ fontSize: 40, color: "error.main" }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {stats.cancelled}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Cancelled
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={6} sm={2.4}>
            <Card sx={{ textAlign: "center", p: 2 }}>
              <Badge badgeContent={stats.unpaid} color="warning">
                <Payment sx={{ fontSize: 40, color: "warning.main" }} />
              </Badge>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {stats.unpaid}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Unpaid
              </Typography>
            </Card>
          </Grid>
        </Grid>

        {/* ✅ Filter Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={`All (${stats.total})`} />
              <Tab label={`Pending (${stats.pending})`} />
              <Tab label={`Confirmed (${stats.confirmed})`} />
              <Tab label={`Completed (${stats.completed})`} />
              <Tab label={`Cancelled (${stats.cancelled})`} />
            </Tabs>
            <Box>
              <Tooltip title="Refresh">
                <IconButton onClick={() => refetch()}>
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* ✅ Bookings List */}
        {filteredBookings().length === 0 ? (
          <Paper sx={{ p: 4, textAlign: "center" }}>
            <Tour sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {currentTab === 0
                ? "No bookings found"
                : `No ${
                    ["", "pending", "confirmed", "completed", "cancelled"][
                      currentTab
                    ]
                  } bookings`}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {currentTab === 0
                ? "Start exploring our tour packages to make your first booking!"
                : "Try switching to a different tab to view other bookings."}
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate("/tours")}
              startIcon={<Tour />}
            >
              Browse Tours
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence>
              {filteredBookings().map((booking, index) => (
                <Grid item xs={12} lg={6} key={booking.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        "&:hover": {
                          boxShadow: 4,
                          transform: "translateY(-2px)",
                          transition: "all 0.3s ease",
                        },
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        {/* ✅ Booking Header */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            mb: 2,
                          }}
                        >
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Booking #{booking.id.slice(-8)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Tour ID: {booking.tourId}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: "right" }}>
                            <Chip
                              label={booking.status}
                              color={getStatusColor(booking.status)}
                              size="small"
                              sx={{ mb: 0.5, fontWeight: 600 }}
                            />
                            <br />
                            <Chip
                              label={booking.paymentStatus}
                              color={getPaymentStatusColor(
                                booking.paymentStatus
                              )}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        {/* ✅ Booking Details */}
                        <List dense>
                          <ListItem disablePadding>
                            <CalendarToday
                              sx={{
                                mr: 2,
                                color: "primary.main",
                                fontSize: 20,
                              }}
                            />
                            <ListItemText
                              primary="Departure Date"
                              secondary={formatDate(booking.departureDate)}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <Schedule
                              sx={{ mr: 2, color: "info.main", fontSize: 20 }}
                            />
                            <ListItemText
                              primary="Booking Date"
                              secondary={formatShortDate(booking.bookingDate)}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <Group
                              sx={{
                                mr: 2,
                                color: "success.main",
                                fontSize: 20,
                              }}
                            />
                            <ListItemText
                              primary="Participants"
                              secondary={`${booking.participants} person${
                                booking.participants > 1 ? "s" : ""
                              }`}
                            />
                          </ListItem>
                          <ListItem disablePadding>
                            <AttachMoney
                              sx={{
                                mr: 2,
                                color: "warning.main",
                                fontSize: 20,
                              }}
                            />
                            <ListItemText
                              primary="Total Cost"
                              secondary={formatPrice(booking.totalCost)}
                            />
                          </ListItem>
                        </List>

                        {/* ✅ Notes */}
                        {booking.notes && (
                          <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                              <strong>Notes:</strong> {booking.notes}
                            </Typography>
                          </>
                        )}

                        {/* ✅ FIXED: Action Buttons with working handlers */}
                        <Box
                          sx={{
                            mt: 3,
                            display: "flex",
                            gap: 1,
                            flexWrap: "wrap",
                          }}
                        >
                          {booking.status === "PENDING" && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() =>
                                setCancelDialog({ open: true, booking })
                              }
                              startIcon={<Cancel />}
                            >
                              Cancel
                            </Button>
                          )}

                          {(booking.status === "CONFIRMED" ||
                            booking.status === "PENDING") &&
                            booking.paymentStatus === "PENDING" && (
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handlePayNow(booking)} // ✅ FIXED: Use handlePayNow
                                startIcon={<Payment />}
                              >
                                Pay Now
                              </Button>
                            )}

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleViewDetails(booking)} // ✅ FIXED: Use handleViewDetails
                            startIcon={<Visibility />}
                          >
                            View Details
                          </Button>

                          {booking.status === "COMPLETED" && (
                            <Button
                              variant="outlined"
                              color="info"
                              size="small"
                              startIcon={<Receipt />}
                            >
                              Download Invoice
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </AnimatePresence>
          </Grid>
        )}

        {/* ✅ ADD: Payment Modal Dialog */}
        <Dialog
          open={paymentDialog.open}
          onClose={() => setPaymentDialog({ open: false, booking: null })}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Payment color="primary" />
              Complete Payment
            </Box>
          </DialogTitle>
          <DialogContent>
            {paymentDialog.booking && (
              <>
                {/* Booking Summary */}
                <Card sx={{ mb: 3, bgcolor: "primary.light" }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Booking Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Booking ID
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          #{paymentDialog.booking.id.slice(-8)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Tour ID
                        </Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {paymentDialog.booking.tourId}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Departure Date
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(paymentDialog.booking.departureDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Participants
                        </Typography>
                        <Typography variant="body1">
                          {paymentDialog.booking.participants} person
                          {paymentDialog.booking.participants > 1 ? "s" : ""}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Total Amount
                        </Typography>
                        <Typography
                          variant="h5"
                          color="primary"
                          fontWeight="bold"
                        >
                          {formatPrice(paymentDialog.booking.totalCost)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Method
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Select Payment Method</InputLabel>
                      <Select
                        value={paymentMethod}
                        label="Select Payment Method"
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      >
                        {paymentMethods.map((method) => (
                          <MenuItem key={method.value} value={method.value}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              {method.icon}
                              {method.label}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>

                {/* Payment Instructions */}
                <Alert severity="info">
                  <Typography variant="body2">
                    💡 <strong>Payment Instructions:</strong>
                    <br />
                    1. Click "Create Payment" to generate payment invoice
                    <br />
                    2. Complete the payment using your selected method
                    <br />
                    3. Your booking will be confirmed once payment is processed
                  </Typography>
                </Alert>
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setPaymentDialog({ open: false, booking: null })}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePayment}
              color="primary"
              variant="contained"
              disabled={creatingPayment}
              startIcon={
                creatingPayment ? <CircularProgress size={16} /> : <Payment />
              }
            >
              {creatingPayment ? "Creating Payment..." : "Create Payment"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ✅ Cancel Booking Dialog (unchanged) */}
        <Dialog
          open={cancelDialog.open}
          onClose={() => setCancelDialog({ open: false, booking: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Cancel color="error" />
              Cancel Booking
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Are you sure you want to cancel booking #
              {cancelDialog.booking?.id.slice(-8)}?
            </Typography>

            {cancelDialog.booking && (
              <Box
                sx={{
                  my: 2,
                  p: 2,
                  bgcolor: "error.light",
                  borderRadius: 1,
                }}
              >
                <Typography variant="body2">
                  <strong>Departure:</strong>{" "}
                  {formatDate(cancelDialog.booking.departureDate)}
                  <br />
                  <strong>Participants:</strong>{" "}
                  {cancelDialog.booking.participants}
                  <br />
                  <strong>Amount:</strong>{" "}
                  {formatPrice(cancelDialog.booking.totalCost)}
                </Typography>
              </Box>
            )}

            <TextField
              fullWidth
              label="Cancellation Reason (Optional)"
              multiline
              rows={3}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={() => setCancelDialog({ open: false, booking: null })}
              variant="outlined"
            >
              Keep Booking
            </Button>
            <Button
              onClick={handleCancelBooking}
              color="error"
              variant="contained"
              disabled={cancelling}
              startIcon={
                cancelling ? <CircularProgress size={16} /> : <Cancel />
              }
            >
              {cancelling ? "Cancelling..." : "Cancel Booking"}
            </Button>
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
}

export default MyBookings;
