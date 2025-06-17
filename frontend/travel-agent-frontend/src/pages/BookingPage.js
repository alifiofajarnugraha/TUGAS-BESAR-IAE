import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  CalendarToday,
  People,
  Hotel,
  DirectionsBus,
  CheckCircle,
  Cancel,
  Info,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  tourService,
  bookingService,
  inventoryService,
  QUERIES,
  MUTATIONS,
} from "../services/api";
import AvailabilityCalendar from "../components/AvailabilityCalendar";

const steps = ["Tour Details", "Calculate Cost", "Booking Confirmation"];

function BookingPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: null,
    participants: 1,
    notes: "",
    totalCost: 0,
  });
  const [costCalculation, setCostCalculation] = useState(null);
  const [error, setError] = useState("");

  // Get tour details
  const { data: tourData, loading: tourLoading } = useQuery(
    QUERIES.GET_TOUR_PACKAGE,
    {
      variables: { id: tourId },
      client: tourService,
    }
  );

  // Get inventory status for availability info
  const { data: inventoryData, loading: inventoryLoading } = useQuery(
    QUERIES.GET_INVENTORY_STATUS,
    {
      variables: { tourId },
      client: inventoryService,
      skip: !tourId,
    }
  );

  // Use useLazyQuery instead of useQuery with skip: true
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
        setActiveStep(1);
        setError("");
      },
      onError: (err) => {
        setError(err.message);
      },
    }
  );

  // Create booking mutation
  const [createBooking, { loading: creatingBooking }] = useMutation(
    MUTATIONS.CREATE_BOOKING,
    {
      client: bookingService,
      onCompleted: (data) => {
        navigate("/my-bookings", {
          state: {
            success: true,
            message: "Booking created successfully!",
            bookingId: data.createBooking.id,
          },
        });
      },
      onError: (err) => {
        setError(err.message);
      },
    }
  );

  // Check availability lazy query
  const [checkAvailability, { loading: checkingAvailability }] = useLazyQuery(
    QUERIES.CHECK_AVAILABILITY,
    {
      client: inventoryService,
      onCompleted: (data) => {
        if (!data.checkAvailability.available) {
          setError(data.checkAvailability.message);
          return;
        }
        handleCalculateCostAfterAvailabilityCheck();
      },
      onError: (err) => {
        setError(err.message);
      },
    }
  );

  const handleCalculateCostAfterAvailabilityCheck = () => {
    calculateCost({
      variables: {
        tourId,
        participants: parseInt(bookingData.participants),
        departureDate: bookingData.date.toISOString().split("T")[0],
      },
    });
  };

  const handleCalculateCost = async () => {
    if (!bookingData.date || !bookingData.participants) {
      setError("Please select date and number of participants");
      return;
    }

    setError("");

    const formattedDate = bookingData.date.toISOString().split("T")[0];
    const requestData = {
      tourId,
      date: formattedDate,
      participants: parseInt(bookingData.participants),
    };

    console.log("Checking availability with data:", requestData);

    checkAvailability({
      variables: requestData,
    });
  };

  const handleCreateBooking = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        setError("Please login to make a booking");
        return;
      }

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
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      handleCalculateCost();
    } else if (activeStep === 1) {
      setActiveStep(2);
    } else if (activeStep === 2) {
      handleCreateBooking();
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError("");
  };

  // Helper functions for availability info
  const getAvailableDates = () => {
    if (!inventoryData?.getInventoryStatus) return [];
    return inventoryData.getInventoryStatus.filter((inv) => inv.slotsLeft > 0);
  };

  const getAvailabilityStatus = (inventory) => {
    if (!inventory) return null;

    const availableDates = getAvailableDates();
    const totalSlots = inventory.reduce((sum, inv) => sum + inv.slotsLeft, 0);

    return {
      totalDates: inventory.length,
      availableDates: availableDates.length,
      totalSlots,
      nextAvailable: availableDates.length > 0 ? availableDates[0] : null,
    };
  };

  const handleDateSelect = (selectedDate) => {
    setBookingData((prev) => ({ ...prev, date: selectedDate }));
    setError("");
  };

  if (tourLoading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
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

  const tour = tourData?.getTourPackage;
  const inventory = inventoryData?.getInventoryStatus || [];
  const availabilityStatus = getAvailabilityStatus(inventory);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Book Your Tour
        </Typography>

        {tour && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6">{tour.name}</Typography>
              <Typography color="text.secondary">
                {tour.shortDescription}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Duration: {tour.duration?.days || 0} days,{" "}
                {tour.duration?.nights || 0} nights
              </Typography>
              <Typography variant="body2">
                Location: {tour.location?.city || "Unknown"},{" "}
                {tour.location?.country || "Unknown"}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Availability Information Section - Menggunakan Custom Component */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <AvailabilityCalendar
              inventory={inventory}
              onDateSelect={handleDateSelect}
              selectedDate={bookingData.date?.toISOString().split("T")[0]}
            />
          </CardContent>
        </Card>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 2 }}>
          {/* Step 0: Tour Details */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Departure Date"
                  value={bookingData.date}
                  onChange={(newDate) =>
                    setBookingData((prev) => ({ ...prev, date: newDate }))
                  }
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Number of Participants"
                  type="number"
                  value={bookingData.participants}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      participants: e.target.value,
                    }))
                  }
                  inputProps={{ min: 1, max: tour?.maxParticipants || 50 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes (Optional)"
                  multiline
                  rows={3}
                  value={bookingData.notes}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Any special requests or notes..."
                />
              </Grid>
            </Grid>
          )}

          {/* Step 1: Cost Calculation */}
          {activeStep === 1 && costCalculation && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cost Breakdown
                </Typography>
                <List>
                  {costCalculation.breakdown?.map((item, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemText
                        primary={item.item}
                        secondary={
                          item.quantity > 1
                            ? `${item.quantity} × ${new Intl.NumberFormat(
                                "id-ID",
                                {
                                  style: "currency",
                                  currency: "IDR",
                                }
                              ).format(item.amount / item.quantity)}`
                            : ""
                        }
                      />
                      <Typography variant="body1">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.amount)}
                      </Typography>
                    </ListItem>
                  )) || []}
                </List>
                <Divider sx={{ my: 2 }} />
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6">Total Cost:</Typography>
                  <Typography variant="h6" color="primary">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(costCalculation.totalCost || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Confirmation */}
          {activeStep === 2 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Booking Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography>
                      <strong>Tour:</strong> {tour?.name || "Unknown"}
                    </Typography>
                    <Typography>
                      <strong>Date:</strong>{" "}
                      {bookingData.date?.toLocaleDateString() || "Not selected"}
                    </Typography>
                    <Typography>
                      <strong>Participants:</strong> {bookingData.participants}
                    </Typography>
                    <Typography>
                      <strong>Total Cost:</strong>{" "}
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(bookingData.totalCost)}
                    </Typography>
                    {bookingData.notes && (
                      <Typography>
                        <strong>Notes:</strong> {bookingData.notes}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
                <Alert severity="info" sx={{ mt: 2 }}>
                  By clicking "Confirm Booking", you agree to our terms and
                  conditions. Your booking will be in PENDING status until
                  payment is completed.
                </Alert>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={
                checkingAvailability || calculatingCost || creatingBooking
              }
            >
              {activeStep === 0 && "Check Availability & Calculate Cost"}
              {activeStep === 1 && "Continue to Confirmation"}
              {activeStep === 2 && "Confirm Booking"}
              {(checkingAvailability || calculatingCost || creatingBooking) && (
                <CircularProgress size={24} sx={{ ml: 1 }} />
              )}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default BookingPage;
