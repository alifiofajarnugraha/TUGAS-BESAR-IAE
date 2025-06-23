// ✅ CREATE: BookingDetails.js - Detailed booking information page

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@apollo/client";
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
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import {
  CalendarToday,
  Group,
  AttachMoney,
  Schedule,
  LocationOn,
  Hotel,
  DirectionsBus,
  Person,
  Notes,
  Payment,
  Receipt,
  Print,
  Download,
  ArrowBack,
  CheckCircle,
  Pending,
  Cancel,
  Tour,
  Info,
  Phone,
  Email,
  Map,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { bookingService, tourService, QUERIES } from "../services/api";

function BookingDetails() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Get booking data from navigation state (if available)
  const initialBooking = location.state?.booking;

  const [bookingData, setBookingData] = useState(initialBooking || null);

  // ✅ Fetch booking details if not provided in state
  const { data, loading, error } = useQuery(QUERIES.GET_BOOKING, {
    variables: { id: bookingId },
    client: bookingService,
    skip: !!initialBooking, // Skip if we already have booking data
    onCompleted: (result) => {
      setBookingData(result.getBooking);
    },
  });

  // ✅ Fetch tour details
  const { data: tourData, loading: tourLoading } = useQuery(
    QUERIES.GET_TOUR_PACKAGE,
    {
      variables: { id: bookingData?.tourId },
      client: tourService,
      skip: !bookingData?.tourId,
    }
  );

  // ✅ REDIRECT: If not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Status color mapping
  const getStatusColor = (status) => {
    const statusMap = {
      PENDING: "warning",
      CONFIRMED: "success",
      CANCELLED: "error",
      COMPLETED: "info",
    };
    return statusMap[status] || "default";
  };

  const getPaymentStatusColor = (status) => {
    const statusMap = {
      PENDING: "warning",
      PAID: "success",
      FAILED: "error",
      REFUNDED: "info",
    };
    return statusMap[status] || "default";
  };

  // ✅ Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Pending />;
      case "CONFIRMED":
        return <CheckCircle />;
      case "CANCELLED":
        return <Cancel />;
      case "COMPLETED":
        return <Tour />;
      default:
        return <Info />;
    }
  };

  // ✅ Loading state
  if (loading || tourLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
            <Grid item xs={6}>
              <Skeleton variant="rectangular" height={100} />
            </Grid>
          </Grid>
        </Paper>
      </Container>
    );
  }

  // ✅ Error state
  if (error || !bookingData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Cancel sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Booking Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The booking you're looking for doesn't exist or you don't have
            permission to view it.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/my-bookings")}
            sx={{ mr: 2 }}
          >
            Back to My Bookings
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const tour = tourData?.getTourPackage;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* ✅ Header with Back Button */}
        <Paper
          sx={{
            p: 4,
            mb: 4,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <IconButton
              onClick={() => navigate("/my-bookings")}
              sx={{ color: "white", mr: 2 }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              Booking Details
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Booking #{bookingData.id.slice(-8)} •{" "}
            {tour?.name || bookingData.tourId}
          </Typography>
        </Paper>

        {/* ✅ Status Banner */}
        <Alert
          severity={
            bookingData.status === "CONFIRMED" ||
            bookingData.status === "COMPLETED"
              ? "success"
              : bookingData.status === "CANCELLED"
              ? "error"
              : "warning"
          }
          sx={{ mb: 3 }}
          icon={getStatusIcon(bookingData.status)}
        >
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            Booking Status: {bookingData.status}
          </Typography>
          <Typography variant="body2">
            {bookingData.status === "PENDING" &&
              "Your booking is waiting for confirmation"}
            {bookingData.status === "CONFIRMED" &&
              "Your booking has been confirmed!"}
            {bookingData.status === "COMPLETED" &&
              "Your trip has been completed"}
            {bookingData.status === "CANCELLED" &&
              "This booking has been cancelled"}
          </Typography>
        </Alert>

        <Grid container spacing={4}>
          {/* ✅ Left Column - Booking Information */}
          <Grid item xs={12} md={8}>
            {/* Booking Summary */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "primary.main", mr: 2 }}>
                        <Receipt />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Booking ID
                        </Typography>
                        <Typography variant="h6">
                          #{bookingData.id.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "info.main", mr: 2 }}>
                        <Schedule />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Booking Date
                        </Typography>
                        <Typography variant="h6">
                          {formatDateTime(bookingData.bookingDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "success.main", mr: 2 }}>
                        <CalendarToday />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Departure Date
                        </Typography>
                        <Typography variant="h6">
                          {formatDate(bookingData.departureDate)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "warning.main", mr: 2 }}>
                        <Group />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Participants
                        </Typography>
                        <Typography variant="h6">
                          {bookingData.participants} person
                          {bookingData.participants > 1 ? "s" : ""}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Avatar sx={{ bgcolor: "error.main", mr: 2 }}>
                        <AttachMoney />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Total Cost
                        </Typography>
                        <Typography
                          variant="h4"
                          color="primary"
                          sx={{ fontWeight: 700 }}
                        >
                          {formatPrice(bookingData.totalCost)}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                {/* Notes */}
                {bookingData.notes && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                    >
                      <Notes sx={{ color: "text.secondary", mt: 0.5 }} />
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Special Notes
                        </Typography>
                        <Typography variant="body1">
                          {bookingData.notes}
                        </Typography>
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Tour Information */}
            {tour && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Tour Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <img
                        src={
                          tour.images?.[0] ||
                          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"
                        }
                        alt={tour.name}
                        style={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={8}>
                      <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                        {tour.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        {tour.shortDescription}
                      </Typography>

                      <List dense>
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <LocationOn />
                          </ListItemIcon>
                          <ListItemText
                            primary="Location"
                            secondary={`${tour.location.city}, ${tour.location.province}, ${tour.location.country}`}
                          />
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <Schedule />
                          </ListItemIcon>
                          <ListItemText
                            primary="Duration"
                            secondary={`${tour.duration.days} days, ${tour.duration.nights} nights`}
                          />
                        </ListItem>
                        <ListItem disablePadding>
                          <ListItemIcon>
                            <AttachMoney />
                          </ListItemIcon>
                          <ListItemText
                            primary="Base Price"
                            secondary={formatPrice(tour.price.amount)}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* ✅ Right Column - Status & Actions */}
          <Grid item xs={12} md={4}>
            {/* Status Card */}
            <Card sx={{ mb: 3, position: "sticky", top: 20 }}>
              <CardContent sx={{ textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  Booking Status
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <Chip
                    label={bookingData.status}
                    color={getStatusColor(bookingData.status)}
                    size="large"
                    sx={{ fontWeight: 600, fontSize: "1rem" }}
                  />
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Status
                  </Typography>
                  <Chip
                    label={bookingData.paymentStatus}
                    color={getPaymentStatusColor(bookingData.paymentStatus)}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Action Buttons */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {bookingData.status === "PENDING" &&
                    bookingData.paymentStatus === "PENDING" && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Payment />}
                        onClick={() => navigate(`/my-bookings`)}
                        fullWidth
                      >
                        Pay Now
                      </Button>
                    )}

                  {(bookingData.status === "CONFIRMED" ||
                    bookingData.status === "COMPLETED") && (
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<Receipt />}
                      fullWidth
                    >
                      Download Invoice
                    </Button>
                  )}

                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    onClick={() => window.print()}
                    fullWidth
                  >
                    Print Details
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/my-bookings")}
                    fullWidth
                  >
                    Back to My Bookings
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Need Help?
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <List dense>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="Customer Service"
                      secondary="+62 123 456 7890"
                    />
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email Support"
                      secondary="support@travelagent.com"
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Our customer service team is available 24/7 to assist you
                    with any questions about your booking.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </motion.div>
    </Container>
  );
}

export default BookingDetails;
