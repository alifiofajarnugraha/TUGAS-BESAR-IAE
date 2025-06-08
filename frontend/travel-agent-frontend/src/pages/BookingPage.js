import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, gql } from "@apollo/client";
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
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  tourPackageService,
  bookingService,
  paymentService,
  inventoryService,
} from "../services/api";

const CHECK_AVAILABILITY = gql`
  query CheckAvailability($tourId: ID!, $date: String!, $participants: Int!) {
    checkAvailability(
      tourId: $tourId
      date: $date
      participants: $participants
    ) {
      available
      message
    }
  }
`;

const GET_TOUR_DETAILS = gql`
  query GetTourPackage($id: ID!) {
    getTourPackage(id: $id) {
      id
      name
      price {
        amount
        currency
      }
    }
  }
`;

const CREATE_BOOKING = gql`
  mutation CreateBooking($input: BookingInput!) {
    createBooking(input: $input) {
      id
      status
    }
  }
`;

const PROCESS_PAYMENT = gql`
  mutation ProcessPayment($input: PaymentInput!) {
    processPayment(input: $input) {
      id
      status
    }
  }
`;

const steps = ["Check Availability", "Booking Details", "Payment"];

function BookingPage() {
  const { tourId } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [bookingData, setBookingData] = useState({
    date: null,
    participants: 1,
    totalCost: 0,
  });
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [error, setError] = useState("");

  // Mutations
  const [createBooking] = useMutation(CREATE_BOOKING, {
    client: bookingService,
  });

  const [processPayment] = useMutation(PROCESS_PAYMENT, {
    client: paymentService,
  });

  // Check availability query
  const { loading: checkingAvailability, refetch: checkAvailability } =
    useQuery(CHECK_AVAILABILITY, {
      client: inventoryService,
      skip: true, // Don't run query immediately
    });

  const handleNext = async () => {
    try {
      if (activeStep === 0) {
        const { data } = await checkAvailability({
          variables: {
            tourId,
            date: bookingData.date.toISOString().split("T")[0],
            participants: parseInt(bookingData.participants),
          },
        });

        if (!data.checkAvailability.available) {
          setError(data.checkAvailability.message);
          return;
        }
      }

      if (activeStep === 1) {
        const { data } = await createBooking({
          variables: {
            input: {
              userId: JSON.parse(localStorage.getItem("user")).id,
              tourId,
              departureDate: bookingData.date.toISOString().split("T")[0],
              totalCost: bookingData.totalCost,
            },
          },
        });

        setBookingData((prev) => ({
          ...prev,
          bookingId: data.createBooking.id,
        }));
      }

      if (activeStep === 2) {
        const { data } = await processPayment({
          variables: {
            input: {
              method: paymentMethod,
              amount: bookingData.totalCost,
            },
          },
        });

        if (data.processPayment.status === "completed") {
          navigate("/bookings", {
            state: {
              success: true,
              message: "Booking completed successfully!",
            },
          });
          return;
        }
      }

      setActiveStep((prevStep) => prevStep + 1);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError("");
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Book Your Tour
        </Typography>

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
                      totalCost: e.target.value * 100, // Example price calculation
                    }))
                  }
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          )}

          {activeStep === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Booking Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography>
                    Date: {bookingData.date.toLocaleDateString()}
                  </Typography>
                  <Typography>
                    Participants: {bookingData.participants}
                  </Typography>
                  <Typography>Total Cost: ${bookingData.totalCost}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <TextField
                select
                fullWidth
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                SelectProps={{
                  native: true,
                }}
                sx={{ mb: 2 }}
              >
                <option value="credit_card">Credit Card</option>
                <option value="transfer">Bank Transfer</option>
                <option value="e-wallet">E-Wallet</option>
              </TextField>
            </Box>
          )}

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={checkingAvailability}
            >
              {activeStep === steps.length - 1 ? "Complete Booking" : "Next"}
              {checkingAvailability && (
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
