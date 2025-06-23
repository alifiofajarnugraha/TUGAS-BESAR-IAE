import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
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
  Alert,
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
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  Group,
  Cancel,
  CheckCircle,
  Pending,
  Payment,
  Refresh,
  Print,
  Download,
  Visibility,
  Edit,
  ErrorOutline,
  Schedule,
  AttachMoney,
  Person,
  Tour,
  Receipt,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import {
  bookingService,
  apiHelpers,
  QUERIES,
  MUTATIONS,
} from "../services/api";

// ✅ COMPLETE: Enhanced MyBookings with full debugging

function MyBookings() {
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    booking: null,
  });
  const [cancelReason, setCancelReason] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [debugInfo, setDebugInfo] = useState(null);

  // ✅ Get current user - enhanced error handling
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        // Use demo user if no user in localStorage
        return {
          id: "user123",
          name: "Demo User",
          email: "demo@example.com",
        };
      }
      return JSON.parse(userStr);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return {
        id: "user123",
        name: "Demo User",
        email: "demo@example.com",
      };
    }
  };

  const user = getCurrentUser();

  // ✅ Debug service connection on mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("🔍 Testing booking service...");

        const healthResponse = await fetch("http://localhost:3003/health");
        const healthData = await healthResponse.json();

        console.log("🏥 Health check:", healthData);
        setDebugInfo((prev) => ({ ...prev, health: healthData }));
      } catch (error) {
        console.error("❌ Service not reachable:", error);
        setDebugInfo((prev) => ({ ...prev, error: error.message }));
      }
    };

    testConnection();
  }, []);

  // ✅ Enhanced query with better error handling
  const { data, loading, error, refetch } = useQuery(
    QUERIES.GET_USER_BOOKINGS,
    {
      variables: { userId: user.id },
      client: bookingService,
      skip: !user.id,
      fetchPolicy: "no-cache", // ✅ Force fresh data
      onCompleted: (result) => {
        console.log("✅ Query completed:", result);
        setDebugInfo((prev) => ({ ...prev, queryResult: result }));
      },
      onError: (err) => {
        console.error("❌ Query failed:", err);
        setDebugInfo((prev) => ({ ...prev, queryError: err.message }));
      },
    }
  );

  // ✅ Cancel booking mutation
  const [cancelBooking, { loading: cancelling }] = useMutation(
    MUTATIONS.CANCEL_BOOKING,
    {
      client: bookingService,
      onCompleted: (result) => {
        console.log("✅ Booking cancelled:", result);
        setCancelDialog({ open: false, booking: null });
        setCancelReason("");
        refetch();
      },
      onError: (err) => {
        console.error("❌ Cancel booking error:", err);
      },
    }
  );

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

  // ✅ Enhanced status color mapping
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

  // ✅ Enhanced formatting functions
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

  // ✅ Debug info panel
  const showDebugInfo = process.env.NODE_ENV === "development";

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* ✅ Debug Panel */}
      {showDebugInfo && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: "grey.100" }}>
          <Typography variant="h6">🔧 Debug Info</Typography>
          <Typography variant="body2">
            User ID: {user.id}
            <br />
            Loading: {loading ? "YES" : "NO"}
            <br />
            Error: {error?.message || "NONE"}
            <br />
            Data:{" "}
            {data ? `${data?.getUserBookings?.length || 0} bookings` : "NONE"}
            <br />
            Service Health: {debugInfo?.health?.status || "UNKNOWN"}
          </Typography>
          <Button size="small" onClick={() => refetch()}>
            Retry Query
          </Button>
        </Paper>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
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
                Welcome back, {user.name}! Here are your travel bookings.
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

                        {/* ✅ Action Buttons */}
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
                                onClick={() =>
                                  navigate(
                                    `/booking/${booking.tourId}?bookingId=${booking.id}`
                                  )
                                }
                                startIcon={<Payment />}
                              >
                                Pay Now
                              </Button>
                            )}

                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() =>
                              navigate(`/booking-details/${booking.id}`)
                            }
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

        {/* ✅ Cancel Booking Dialog */}
        <Dialog
          open={cancelDialog.open}
          onClose={() => setCancelDialog({ open: false, booking: null })}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
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
