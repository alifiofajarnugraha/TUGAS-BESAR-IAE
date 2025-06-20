import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Badge,
  Skeleton,
} from "@mui/material";
import {
  CalendarToday,
  People,
  Hotel,
  DirectionsBus,
  CheckCircle,
  Cancel,
  Info,
  LocationOn,
  Schedule,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
  Payment as PaymentIcon,
  ExpandMore,
  Warning,
  CheckCircleOutline,
  ErrorOutline,
  AccessTime,
  EventAvailable,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { motion, AnimatePresence } from "framer-motion";
import {
  tourService,
  bookingService,
  inventoryService,
  paymentService,
  QUERIES,
  MUTATIONS,
} from "../services/api";

const steps = [
  "Tour Selection",
  "Date & Participants",
  "Review & Payment",
  "Confirmation",
];

const paymentMethods = [
  { value: "transfer", label: "Bank Transfer", icon: <AttachMoney /> },
  { value: "e-wallet", label: "E-Wallet", icon: <AccountBalanceWallet /> },
  { value: "credit card", label: "Credit Card", icon: <CreditCard /> },
];

function BookingPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get initial data from URL params (from TourDetail page)
  const initialDate = searchParams.get("date");
  const initialParticipants = parseInt(searchParams.get("participants")) || 2;

  const [activeStep, setActiveStep] = useState(1); // Start at step 1 since tour is already selected
  const [bookingData, setBookingData] = useState({
    date: initialDate ? new Date(initialDate) : null,
    participants: initialParticipants,
    notes: "",
    totalCost: 0,
    paymentMethod: "transfer",
  });
  const [costCalculation, setCostCalculation] = useState(null);
  const [availabilityData, setAvailabilityData] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [createdPayment, setCreatedPayment] = useState(null);

  // Date range for availability (next 6 months)
  const dateRange = useMemo(() => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 6);

    return {
      startDate: today.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, []);

  // ✅ Fetch tour details
  const {
    data: tourData,
    loading: tourLoading,
    error: tourError,
  } = useQuery(QUERIES.GET_TOUR_PACKAGE, {
    variables: { id: tourId },
    client: tourService,
    onError: (error) => {
      console.error("Tour fetch error:", error);
      setError("Failed to load tour details");
    },
  });

  // ✅ Fetch inventory for the tour
  const {
    data: inventoryData,
    loading: inventoryLoading,
    refetch: refetchInventory,
  } = useQuery(QUERIES.GET_TOUR_AVAILABILITY_RANGE, {
    variables: {
      tourId,
      ...dateRange,
    },
    client: inventoryService,
    skip: !tourId,
    onError: (error) => {
      console.error("Inventory fetch error:", error);
    },
  });

  // ✅ Lazy query for checking specific date availability
  const [checkAvailability, { loading: checkingAvailability }] = useLazyQuery(
    QUERIES.CHECK_AVAILABILITY,
    {
      client: bookingService, // ✅ Changed from inventoryService to bookingService
      onCompleted: (data) => {
        setAvailabilityData(data.checkAvailability);
        if (!data.checkAvailability.available) {
          setError(data.checkAvailability.message);
          return;
        }
        // If available, proceed to calculate cost
        calculateCost({
          variables: {
            tourId,
            participants: parseInt(bookingData.participants),
            departureDate: bookingData.date.toISOString().split("T")[0],
          },
        });
      },
      onError: (err) => {
        setError("Failed to check availability: " + err.message);
      },
    }
  );

  // ✅ Lazy query for cost calculation
  const [calculateCost, { loading: calculatingCost }] = useLazyQuery(
    QUERIES.CALCULATE_BOOKING_COST,
    {
      client: bookingService,
      onCompleted: (data) => {
        setCostCalculation(data.calculateBookingCost);
        setBookingData((prev) => ({
          ...prev,
          totalCost: data.calculateBookingCost.totalCost,
        }));
        setError("");
      },
      onError: (err) => {
        setError("Failed to calculate cost: " + err.message);
      },
    }
  );

  // ✅ Create booking mutation
  const [createBooking, { loading: creatingBooking }] = useMutation(
    MUTATIONS.CREATE_BOOKING,
    {
      client: bookingService,
      onCompleted: (data) => {
        console.log("Booking created:", data.createBooking);
        setCreatedBooking(data.createBooking);
        setSuccess("Booking created successfully!");

        // Auto-proceed to payment
        handleCreatePayment(data.createBooking.id);
      },
      onError: (err) => {
        setError("Failed to create booking: " + err.message);
      },
    }
  );

  // ✅ Create payment mutation
  const [createPayment, { loading: creatingPayment }] = useMutation(
    MUTATIONS.PROCESS_PAYMENT,
    {
      client: paymentService,
      onCompleted: (data) => {
        console.log("Payment created:", data.processPayment);
        setCreatedPayment(data.processPayment);
        setActiveStep(3); // Move to confirmation step
        setShowPaymentDialog(true);
      },
      onError: (err) => {
        setError("Failed to process payment: " + err.message);
      },
    }
  );

  // ✅ Process inventory data
  const inventorySummary = useMemo(() => {
    if (!inventoryData?.getTourAvailabilityRange)
      return {
        availableDates: [],
        totalSlots: 0,
        nearestDate: null,
        isAvailable: false,
      };

    const inventory = inventoryData.getTourAvailabilityRange;
    const availableDates = inventory.filter((inv) => inv.slotsLeft > 0);
    const totalSlots = inventory.reduce((sum, inv) => sum + inv.slotsLeft, 0);

    return {
      availableDates,
      totalSlots,
      nearestDate: availableDates[0]?.date || null,
      isAvailable: availableDates.length > 0,
    };
  }, [inventoryData]);

  // ✅ Effect to auto-check availability when date/participants change
  useEffect(() => {
    if (bookingData.date && bookingData.participants && tourId) {
      const timer = setTimeout(() => {
        handleCheckAvailability();
      }, 500); // Debounce

      return () => clearTimeout(timer);
    }
  }, [bookingData.date, bookingData.participants, tourId]);

  // ✅ Event handlers
  const handleCheckAvailability = () => {
    if (!bookingData.date || !bookingData.participants) {
      setError("Please select date and number of participants");
      return;
    }

    setError("");
    setAvailabilityData(null);
    setCostCalculation(null);

    const formattedDate = bookingData.date.toISOString().split("T")[0];

    checkAvailability({
      variables: {
        tourId,
        date: formattedDate,
        participants: parseInt(bookingData.participants),
      },
    });
  };

  const handleCreatePayment = async (bookingId) => {
    try {
      // Mock user for now - replace with actual auth
      const user = { id: "user123" };

      await createPayment({
        variables: {
          input: {
            method: bookingData.paymentMethod,
            amount: bookingData.totalCost,
            bookingId: bookingId,
            userId: user.id,
          },
        },
      });
    } catch (err) {
      setError("Failed to create payment: " + err.message);
    }
  };

  const handleNext = async () => {
    if (activeStep === 1) {
      // Validate date and participants
      if (!bookingData.date || !bookingData.participants) {
        setError("Please select date and number of participants");
        return;
      }

      // Check availability if not already checked
      if (!availabilityData || !costCalculation) {
        handleCheckAvailability();
        return;
      }

      setActiveStep(2);
    } else if (activeStep === 2) {
      // Create booking
      const user = { id: "user123" }; // Mock user

      await createBooking({
        variables: {
          input: {
            userId: user.id,
            tourId,
            departureDate: bookingData.date.toISOString().split("T")[0],
            participants: parseInt(bookingData.participants),
            notes: bookingData.notes,
          },
        },
      });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prevStep) => prevStep - 1);
      setError("");
    }
  };

  const handleDateSelect = (selectedDate) => {
    setBookingData((prev) => ({ ...prev, date: selectedDate }));
    setError("");
    setAvailabilityData(null);
    setCostCalculation(null);
  };

  const handleCompleteBooking = () => {
    setShowPaymentDialog(false);
    navigate("/my-bookings", {
      state: {
        success: true,
        message: "Booking completed successfully!",
        bookingId: createdBooking?.id,
        paymentId: createdPayment?.id,
      },
    });
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

  // ✅ Loading states
  if (tourLoading) {
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

  if (tourError || !tourData?.getTourPackage) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <ErrorOutline sx={{ fontSize: 64, color: "error.main", mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Tour Not Found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            The tour you're looking for doesn't exist or has been removed.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/tours")}
            sx={{ mr: 2 }}
          >
            Browse Tours
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </Paper>
      </Container>
    );
  }

  const tour = tourData.getTourPackage;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              Complete Your Booking
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              {tour.name}
            </Typography>
          </Paper>

          {/* Tour Summary Card */}
          <Card sx={{ mb: 4, borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={3}>
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
                      borderRadius: "12px",
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
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

                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Chip
                      icon={<LocationOn />}
                      label={`${tour.location.city}, ${tour.location.country}`}
                      variant="outlined"
                    />
                    <Chip
                      icon={<Schedule />}
                      label={`${tour.duration.days} days, ${tour.duration.nights} nights`}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper
                    sx={{
                      p: 2,
                      textAlign: "center",
                      bgcolor: "primary.light",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="primary.contrastText">
                      Starting from
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ fontWeight: 700, color: "primary.contrastText" }}
                    >
                      {formatPrice(tour.price.amount)}
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      per person
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Availability Summary */}
          {inventoryData && (
            <Card sx={{ mb: 4, borderRadius: 3 }}>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, display: "flex", alignItems: "center" }}
                >
                  <EventAvailable sx={{ mr: 1 }} />
                  Availability Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {inventorySummary.availableDates.length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Available Days
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="success.main">
                        {inventorySummary.totalSlots}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Slots
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="info.main">
                        {inventorySummary.nearestDate
                          ? formatDate(inventorySummary.nearestDate).split(
                              ","
                            )[0]
                          : "N/A"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Next Available
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Chip
                        label={
                          inventorySummary.isAvailable
                            ? "Available"
                            : "Sold Out"
                        }
                        color={
                          inventorySummary.isAvailable ? "success" : "error"
                        }
                        sx={{ fontWeight: 600 }}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Progress Stepper */}
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      style: {
                        color: index <= activeStep ? "#1976d2" : "#bdbdbd",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Paper>

          {/* Error/Success Messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert
                  severity="error"
                  sx={{ mb: 3 }}
                  onClose={() => setError("")}
                >
                  {error}
                </Alert>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert
                  severity="success"
                  sx={{ mb: 3 }}
                  onClose={() => setSuccess("")}
                >
                  {success}
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Content */}
          <Paper sx={{ p: 4, borderRadius: 3 }}>
            <AnimatePresence mode="wait">
              {/* Step 1: Date & Participants Selection */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Select Date & Participants
                  </Typography>

                  <Grid container spacing={4}>
                    {/* Date Selection */}
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="Departure Date"
                        value={bookingData.date}
                        onChange={handleDateSelect}
                        minDate={new Date()}
                        maxDate={new Date(dateRange.endDate)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            helperText="Select your preferred departure date"
                          />
                        )}
                        sx={{ width: "100%" }}
                      />
                    </Grid>

                    {/* Participants Selection */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Number of Participants"
                        type="number"
                        value={bookingData.participants}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            participants: Math.max(
                              1,
                              parseInt(e.target.value) || 1
                            ),
                          }))
                        }
                        inputProps={{ min: 1, max: 20 }}
                        helperText="Maximum 20 participants per booking"
                      />
                    </Grid>

                    {/* Available Dates Quick Select */}
                    {inventorySummary.availableDates.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                          Quick Select Available Dates
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {inventorySummary.availableDates
                            .slice(0, 10)
                            .map((inv, index) => {
                              const date = new Date(inv.date);
                              const isSelected =
                                bookingData.date
                                  ?.toISOString()
                                  .split("T")[0] === inv.date;

                              return (
                                <Chip
                                  key={index}
                                  label={date.toLocaleDateString("id-ID", {
                                    month: "short",
                                    day: "numeric",
                                    weekday: "short",
                                  })}
                                  onClick={() => handleDateSelect(date)}
                                  color={isSelected ? "primary" : "default"}
                                  variant={isSelected ? "filled" : "outlined"}
                                  sx={{
                                    cursor: "pointer",
                                    "&:hover": {
                                      bgcolor: isSelected
                                        ? "primary.dark"
                                        : "action.hover",
                                    },
                                  }}
                                />
                              );
                            })}
                        </Box>
                      </Grid>
                    )}

                    {/* Special Notes */}
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Special Requests or Notes (Optional)"
                        multiline
                        rows={3}
                        value={bookingData.notes}
                        onChange={(e) =>
                          setBookingData((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        placeholder="Any special dietary requirements, accessibility needs, or other requests..."
                      />
                    </Grid>

                    {/* Real-time Availability Check */}
                    {(checkingAvailability || calculatingCost) && (
                      <Grid item xs={12}>
                        <Paper sx={{ p: 3, bgcolor: "action.hover" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <CircularProgress size={24} />
                            <Typography>
                              {checkingAvailability
                                ? "Checking availability..."
                                : "Calculating cost..."}
                            </Typography>
                          </Box>
                        </Paper>
                      </Grid>
                    )}

                    {/* Availability Result */}
                    {availabilityData && (
                      <Grid item xs={12}>
                        <Paper
                          sx={{
                            p: 3,
                            bgcolor: availabilityData.available
                              ? "success.light"
                              : "error.light",
                            color: availabilityData.available
                              ? "success.contrastText"
                              : "error.contrastText",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              mb: 2,
                            }}
                          >
                            {availabilityData.available ? (
                              <CheckCircleOutline />
                            ) : (
                              <ErrorOutline />
                            )}
                            <Typography variant="h6">
                              {availabilityData.available
                                ? "Available!"
                                : "Not Available"}
                            </Typography>
                          </Box>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {availabilityData.message}
                          </Typography>
                          {availabilityData.available && (
                            <Typography variant="body2">
                              Remaining slots: {availabilityData.slotsLeft} |
                              Hotel:{" "}
                              {availabilityData.hotelAvailable ? "✓" : "✗"} |
                              Transport:{" "}
                              {availabilityData.transportAvailable ? "✓" : "✗"}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    )}

                    {/* Cost Preview */}
                    {costCalculation && (
                      <Grid item xs={12}>
                        <Accordion>
                          <AccordionSummary expandIcon={<ExpandMore />}>
                            <Typography variant="h6">
                              Cost Preview:{" "}
                              {formatPrice(costCalculation.totalCost)}
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails>
                            <TableContainer>
                              <Table size="small">
                                <TableBody>
                                  {costCalculation.breakdown?.map(
                                    (item, index) => (
                                      <TableRow key={index}>
                                        <TableCell>{item.item}</TableCell>
                                        <TableCell align="center">
                                          {item.quantity > 1
                                            ? `× ${item.quantity}`
                                            : ""}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatPrice(item.amount)}
                                        </TableCell>
                                      </TableRow>
                                    )
                                  )}
                                  <TableRow>
                                    <TableCell colSpan={2}>
                                      <strong>Total Cost</strong>
                                    </TableCell>
                                    <TableCell align="right">
                                      <strong>
                                        {formatPrice(costCalculation.totalCost)}
                                      </strong>
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </AccordionDetails>
                        </Accordion>
                      </Grid>
                    )}
                  </Grid>
                </motion.div>
              )}

              {/* Step 2: Review & Payment Method */}
              {activeStep === 2 && costCalculation && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Review Booking & Payment
                  </Typography>

                  <Grid container spacing={4}>
                    {/* Booking Summary */}
                    <Grid item xs={12} md={8}>
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Booking Summary
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          <List>
                            <ListItem>
                              <ListItemIcon>
                                <CalendarToday />
                              </ListItemIcon>
                              <ListItemText
                                primary="Departure Date"
                                secondary={formatDate(bookingData.date)}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <People />
                              </ListItemIcon>
                              <ListItemText
                                primary="Participants"
                                secondary={`${bookingData.participants} person${
                                  bookingData.participants > 1 ? "s" : ""
                                }`}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <Hotel />
                              </ListItemIcon>
                              <ListItemText
                                primary="Hotel Included"
                                secondary={
                                  availabilityData?.hotelAvailable
                                    ? "Yes"
                                    : "No"
                                }
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemIcon>
                                <DirectionsBus />
                              </ListItemIcon>
                              <ListItemText
                                primary="Transport Included"
                                secondary={
                                  availabilityData?.transportAvailable
                                    ? "Yes"
                                    : "No"
                                }
                              />
                            </ListItem>
                            {bookingData.notes && (
                              <ListItem>
                                <ListItemIcon>
                                  <Info />
                                </ListItemIcon>
                                <ListItemText
                                  primary="Special Notes"
                                  secondary={bookingData.notes}
                                />
                              </ListItem>
                            )}
                          </List>
                        </CardContent>
                      </Card>

                      {/* Payment Method Selection */}
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Payment Method
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          <FormControl fullWidth>
                            <InputLabel>Select Payment Method</InputLabel>
                            <Select
                              value={bookingData.paymentMethod}
                              label="Select Payment Method"
                              onChange={(e) =>
                                setBookingData((prev) => ({
                                  ...prev,
                                  paymentMethod: e.target.value,
                                }))
                              }
                            >
                              {paymentMethods.map((method) => (
                                <MenuItem
                                  key={method.value}
                                  value={method.value}
                                >
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
                    </Grid>

                    {/* Cost Breakdown */}
                    <Grid item xs={12} md={4}>
                      <Card sx={{ position: "sticky", top: 20 }}>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Cost Breakdown
                          </Typography>
                          <Divider sx={{ mb: 2 }} />

                          <TableContainer>
                            <Table size="small">
                              <TableBody>
                                {costCalculation.breakdown?.map(
                                  (item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {item.item}
                                          {item.quantity > 1 && (
                                            <Typography
                                              variant="caption"
                                              color="text.secondary"
                                              display="block"
                                            >
                                              {item.quantity} ×{" "}
                                              {formatPrice(
                                                item.amount / item.quantity
                                              )}
                                            </Typography>
                                          )}
                                        </Typography>
                                      </TableCell>
                                      <TableCell align="right">
                                        <Typography
                                          variant="body2"
                                          color={
                                            item.amount < 0
                                              ? "success.main"
                                              : "text.primary"
                                          }
                                        >
                                          {formatPrice(item.amount)}
                                        </Typography>
                                      </TableCell>
                                    </TableRow>
                                  )
                                )}
                                <TableRow>
                                  <TableCell>
                                    <Divider />
                                  </TableCell>
                                  <TableCell>
                                    <Divider />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>
                                    <Typography
                                      variant="h6"
                                      sx={{ fontWeight: 700 }}
                                    >
                                      Total
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 700,
                                        color: "primary.main",
                                      }}
                                    >
                                      {formatPrice(costCalculation.totalCost)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>

                          <Box
                            sx={{
                              mt: 3,
                              p: 2,
                              bgcolor: "info.light",
                              borderRadius: 2,
                            }}
                          >
                            <Typography
                              variant="body2"
                              color="info.contrastText"
                            >
                              <strong>Important:</strong> Your booking will be
                              confirmed after payment processing. You will
                              receive a confirmation email with payment
                              instructions.
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {/* Step 3: Confirmation */}
              {activeStep === 3 && createdBooking && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <CheckCircleOutline
                      sx={{ fontSize: 80, color: "success.main", mb: 2 }}
                    />
                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
                      Booking Confirmed!
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ mb: 4 }}
                    >
                      Thank you for booking with us
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Booking Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="body1" sx={{ mb: 1 }}>
                              <strong>Booking ID:</strong> {createdBooking.id}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              <strong>Tour:</strong> {tour.name}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              <strong>Date:</strong>{" "}
                              {formatDate(createdBooking.departureDate)}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              <strong>Participants:</strong>{" "}
                              {createdBooking.participants}
                            </Typography>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              <strong>Total Cost:</strong>{" "}
                              {formatPrice(createdBooking.totalCost)}
                            </Typography>
                            <Typography variant="body1">
                              <strong>Status:</strong>
                              <Chip
                                label={createdBooking.status}
                                color="warning"
                                size="small"
                                sx={{ ml: 1 }}
                              />
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box
                      sx={{
                        mt: 4,
                        display: "flex",
                        gap: 2,
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate("/my-bookings")}
                      >
                        View My Bookings
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate("/tours")}
                      >
                        Browse More Tours
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {activeStep < 3 && (
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
              >
                <Button
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  Back
                </Button>

                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={
                    checkingAvailability ||
                    calculatingCost ||
                    creatingBooking ||
                    creatingPayment ||
                    (activeStep === 1 &&
                      (!availabilityData?.available || !costCalculation)) ||
                    (activeStep === 2 && !costCalculation)
                  }
                  size="large"
                  sx={{ minWidth: 120 }}
                >
                  {activeStep === 1 && "Continue to Review"}
                  {activeStep === 2 && "Complete Booking"}
                  {(creatingBooking || creatingPayment) && (
                    <CircularProgress size={20} sx={{ ml: 1 }} />
                  )}
                </Button>
              </Box>
            )}
          </Paper>

          {/* Payment Instructions Dialog */}
          <Dialog
            open={showPaymentDialog}
            onClose={() => setShowPaymentDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PaymentIcon />
                Payment Instructions
              </Box>
            </DialogTitle>
            <DialogContent>
              {createdPayment && (
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Payment Details
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Invoice Number:</strong>{" "}
                      {createdPayment.invoiceNumber}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Amount:</strong>{" "}
                      {formatPrice(createdPayment.amount)}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Payment Method:</strong>{" "}
                      {
                        paymentMethods.find(
                          (m) => m.value === createdPayment.method
                        )?.label
                      }
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Status:</strong>
                      <Chip
                        label={createdPayment.status}
                        color="warning"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Typography>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      Payment instructions have been sent to your email. Please
                      complete the payment within 24 hours to secure your
                      booking.
                    </Alert>
                  </CardContent>
                </Card>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowPaymentDialog(false)}>
                I'll Pay Later
              </Button>
              <Button variant="contained" onClick={handleCompleteBooking}>
                View My Bookings
              </Button>
            </DialogActions>
          </Dialog>
        </motion.div>
      </Container>
    </LocalizationProvider>
  );
}

export default BookingPage;
