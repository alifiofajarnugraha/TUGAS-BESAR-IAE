import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
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
  Card,
  CardContent,
  Divider,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Chip,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  Wallet,
  CheckCircle,
  Timer,
  Receipt,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { paymentService, MUTATIONS } from "../services/api";

const paymentSteps = ["Payment Details", "Confirmation", "Processing"];

// Data dummy untuk booking (karena booking service belum ready)
const dummyBookingData = {
  id: "BK001",
  tourId: "TR001",
  tourName: "Bali Paradise Adventure",
  tourDescription:
    "Experience the magic of Bali with our exclusive tour package",
  userId: "USER001",
  userName: "John Doe",
  userEmail: "john.doe@email.com",
  departureDate: "2024-01-15",
  participants: 2,
  duration: { days: 5, nights: 4 },
  location: { city: "Bali", country: "Indonesia" },
  costBreakdown: {
    basePrice: 2500000,
    participants: 2,
    subtotal: 5000000,
    tax: 500000,
    discount: 250000,
    totalCost: 5250000,
    breakdown: [
      {
        item: "Bali Paradise Adventure - Base Price per Person",
        amount: 2500000,
        quantity: 2,
      },
      { item: "Tax (10%)", amount: 500000, quantity: 1 },
      {
        item: "Group Discount (5% for 2+ people)",
        amount: -250000,
        quantity: 1,
      },
    ],
  },
  notes: "Vegetarian meals preferred",
  bookingDate: "2024-01-01",
  status: "CONFIRMED",
};

function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeStep, setActiveStep] = useState(0);
  const [paymentData, setPaymentData] = useState({
    method: "credit card",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolder: "",
    bankName: "",
    accountNumber: "",
    walletProvider: "",
    walletNumber: "",
  });
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);

  // Process payment mutation
  const [processPayment, { loading: processing }] = useMutation(
    MUTATIONS.PROCESS_PAYMENT,
    {
      client: paymentService,
      onCompleted: (data) => {
        setPaymentResult(data.processPayment);
        setShowSuccessDialog(true);
      },
      onError: (err) => {
        setError(err.message);
      },
    }
  );

  useEffect(() => {
    // Simulasi loading booking data
    setTimeout(() => {
      // Dalam implementasi nyata, ini akan fetch dari booking service
      setBooking(dummyBookingData);
    }, 1000);
  }, [bookingId]);

  const paymentMethods = [
    {
      value: "credit card",
      label: "Credit Card",
      icon: <CreditCard />,
      description: "Visa, Mastercard, American Express",
    },
    {
      value: "transfer",
      label: "Bank Transfer",
      icon: <AccountBalance />,
      description: "Transfer langsung ke rekening",
    },
    {
      value: "e-wallet",
      label: "E-Wallet",
      icon: <Wallet />,
      description: "GoPay, OVO, DANA, ShopeePay",
    },
  ];

  const handlePaymentMethodChange = (event) => {
    setPaymentData((prev) => ({
      ...prev,
      method: event.target.value,
    }));
    setError("");
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validatePaymentData = () => {
    const { method } = paymentData;

    if (method === "credit card") {
      if (
        !paymentData.cardNumber ||
        !paymentData.expiryDate ||
        !paymentData.cvv ||
        !paymentData.cardHolder
      ) {
        setError("Please fill all credit card details");
        return false;
      }
    } else if (method === "transfer") {
      if (!paymentData.bankName || !paymentData.accountNumber) {
        setError("Please fill bank transfer details");
        return false;
      }
    } else if (method === "e-wallet") {
      if (!paymentData.walletProvider || !paymentData.walletNumber) {
        setError("Please fill e-wallet details");
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validatePaymentData()) {
        setActiveStep(1);
        setError("");
      }
    } else if (activeStep === 1) {
      handleProcessPayment();
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const handleProcessPayment = async () => {
    try {
      setActiveStep(2);

      // Simulasi delay processing
      setTimeout(async () => {
        const user = JSON.parse(localStorage.getItem("user") || "{}");

        await processPayment({
          variables: {
            input: {
              method: paymentData.method,
              amount: booking.costBreakdown.totalCost,
              bookingId: booking.id,
              userId: user.id || booking.userId,
            },
          },
        });
      }, 2000);
    } catch (err) {
      setError(err.message);
      setActiveStep(1);
    }
  };

  const handleCloseSuccessDialog = () => {
    setShowSuccessDialog(false);
    navigate("/my-bookings", {
      state: {
        success: true,
        message: "Payment completed successfully!",
        paymentId: paymentResult?.id,
      },
    });
  };

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading booking details...</Typography>
        </Box>
      </Container>
    );
  }

  const renderPaymentMethodForm = () => {
    switch (paymentData.method) {
      case "credit card":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Number"
                name="cardNumber"
                value={paymentData.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                inputProps={{ maxLength: 19 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Card Holder Name"
                name="cardHolder"
                value={paymentData.cardHolder}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Expiry Date"
                name="expiryDate"
                value={paymentData.expiryDate}
                onChange={handleInputChange}
                placeholder="MM/YY"
                inputProps={{ maxLength: 5 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="CVV"
                name="cvv"
                value={paymentData.cvv}
                onChange={handleInputChange}
                placeholder="123"
                inputProps={{ maxLength: 4 }}
                type="password"
              />
            </Grid>
          </Grid>
        );

      case "transfer":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Bank Name"
                name="bankName"
                value={paymentData.bankName}
                onChange={handleInputChange}
                SelectProps={{ native: true }}
              >
                <option value="">Select Bank</option>
                <option value="BCA">Bank Central Asia (BCA)</option>
                <option value="BNI">Bank Negara Indonesia (BNI)</option>
                <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                <option value="Mandiri">Bank Mandiri</option>
                <option value="CIMB">CIMB Niaga</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Number"
                name="accountNumber"
                value={paymentData.accountNumber}
                onChange={handleInputChange}
                placeholder="1234567890"
              />
            </Grid>
          </Grid>
        );

      case "e-wallet":
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="E-Wallet Provider"
                name="walletProvider"
                value={paymentData.walletProvider}
                onChange={handleInputChange}
                SelectProps={{ native: true }}
              >
                <option value="">Select E-Wallet</option>
                <option value="GoPay">GoPay</option>
                <option value="OVO">OVO</option>
                <option value="DANA">DANA</option>
                <option value="ShopeePay">ShopeePay</option>
                <option value="LinkAja">LinkAja</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="walletNumber"
                value={paymentData.walletNumber}
                onChange={handleInputChange}
                placeholder="08123456789"
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Complete Your Payment
          </Typography>

          {/* Booking Summary */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Booking Summary
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {booking.tourName}
                  </Typography>
                  <Typography color="text.secondary" gutterBottom>
                    {booking.tourDescription}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={<Timer />}
                      label={`${booking.duration.days} days, ${booking.duration.nights} nights`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={`${booking.participants} participants`}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                    <Chip
                      label={new Date(
                        booking.departureDate
                      ).toLocaleDateString()}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" color="primary" align="right">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(booking.costBreakdown.totalCost)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="right"
                  >
                    Total Amount
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {paymentSteps.map((label) => (
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

          {/* Step 0: Payment Method Selection */}
          {activeStep === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Select Payment Method
                    </Typography>

                    <FormControl component="fieldset" sx={{ width: "100%" }}>
                      <RadioGroup
                        value={paymentData.method}
                        onChange={handlePaymentMethodChange}
                      >
                        {paymentMethods.map((method) => (
                          <Box key={method.value} sx={{ mb: 2 }}>
                            <FormControlLabel
                              value={method.value}
                              control={<Radio />}
                              label={
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  {method.icon}
                                  <Box sx={{ ml: 2 }}>
                                    <Typography variant="subtitle1">
                                      {method.label}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      {method.description}
                                    </Typography>
                                  </Box>
                                </Box>
                              }
                              sx={{
                                border:
                                  paymentData.method === method.value ? 2 : 1,
                                borderColor:
                                  paymentData.method === method.value
                                    ? "primary.main"
                                    : "divider",
                                borderRadius: 2,
                                p: 2,
                                m: 0,
                                width: "100%",
                              }}
                            />
                          </Box>
                        ))}
                      </RadioGroup>
                    </FormControl>

                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Payment Details
                      </Typography>
                      {renderPaymentMethodForm()}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Cost Breakdown
                    </Typography>
                    <List dense>
                      {booking.costBreakdown.breakdown.map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={item.item}
                            secondary={
                              item.quantity > 1 ? `${item.quantity} ×` : ""
                            }
                          />
                          <Typography
                            variant="body2"
                            color={
                              item.amount < 0 ? "success.main" : "text.primary"
                            }
                          >
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                            }).format(Math.abs(item.amount))}
                          </Typography>
                        </ListItem>
                      ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography variant="h6">Total:</Typography>
                      <Typography variant="h6" color="primary">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(booking.costBreakdown.totalCost)}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Step 1: Confirmation */}
          {activeStep === 1 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Confirm Payment Details
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Payment Method
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {
                        paymentMethods.find(
                          (m) => m.value === paymentData.method
                        )?.label
                      }
                    </Typography>

                    {paymentData.method === "credit card" && (
                      <>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mt: 2 }}
                        >
                          Card Details
                        </Typography>
                        <Typography variant="body2">
                          **** **** **** {paymentData.cardNumber.slice(-4)}
                        </Typography>
                        <Typography variant="body2">
                          {paymentData.cardHolder}
                        </Typography>
                      </>
                    )}

                    {paymentData.method === "transfer" && (
                      <>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mt: 2 }}
                        >
                          Bank Details
                        </Typography>
                        <Typography variant="body2">
                          {paymentData.bankName}
                        </Typography>
                        <Typography variant="body2">
                          Account: {paymentData.accountNumber}
                        </Typography>
                      </>
                    )}

                    {paymentData.method === "e-wallet" && (
                      <>
                        <Typography
                          variant="subtitle2"
                          color="text.secondary"
                          sx={{ mt: 2 }}
                        >
                          E-Wallet Details
                        </Typography>
                        <Typography variant="body2">
                          {paymentData.walletProvider}
                        </Typography>
                        <Typography variant="body2">
                          {paymentData.walletNumber}
                        </Typography>
                      </>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Amount to Pay
                    </Typography>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      }).format(booking.costBreakdown.totalCost)}
                    </Typography>

                    <Alert severity="info" sx={{ mt: 2 }}>
                      Please review all details before proceeding with payment.
                      Payment is non-refundable after processing.
                    </Alert>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Processing */}
          {activeStep === 2 && (
            <Card>
              <CardContent sx={{ textAlign: "center", py: 6 }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Processing Your Payment
                </Typography>
                <Typography color="text.secondary">
                  Please wait while we process your payment. Do not close this
                  window.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button
              disabled={activeStep === 0 || processing}
              onClick={handleBack}
            >
              Back
            </Button>

            {activeStep < 2 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={processing}
              >
                {activeStep === 0 && "Continue to Confirmation"}
                {activeStep === 1 && "Process Payment"}
              </Button>
            )}
          </Box>
        </Paper>

        {/* Success Dialog */}
        <Dialog
          open={showSuccessDialog}
          onClose={handleCloseSuccessDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5">Payment Successful!</Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: "center" }}>
              <Typography gutterBottom>
                Your payment has been processed successfully.
              </Typography>
              {paymentResult && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Payment ID: {paymentResult.id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Invoice: {paymentResult.invoiceNumber}
                  </Typography>
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
            <Button
              variant="contained"
              onClick={handleCloseSuccessDialog}
              startIcon={<Receipt />}
            >
              View My Bookings
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </motion.div>
  );
}

export default PaymentPage;
