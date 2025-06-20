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
  alpha,
  useTheme,
  Avatar,
  Stack,
} from "@mui/material";
import {
  CreditCard,
  AccountBalance,
  Wallet,
  CheckCircle,
  Timer,
  Receipt,
  Security,
  Lock,
  Verified,
  Payment,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { paymentService, MUTATIONS } from "../services/api";

const paymentSteps = ["Payment Details", "Confirmation", "Processing"];

// Animasi variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3 },
  },
};

const cardVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
};

const stepVariants = {
  initial: { opacity: 0, x: 50 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    x: -50,
    transition: { duration: 0.3 },
  },
};

const pulseVariants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Data dummy untuk booking
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
  const theme = useTheme();
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
      setBooking(dummyBookingData);
    }, 1000);
  }, [bookingId]);

  const paymentMethods = [
    {
      value: "credit card",
      label: "Credit Card",
      icon: <CreditCard />,
      description: "Visa, Mastercard, American Express",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      value: "transfer",
      label: "Bank Transfer",
      icon: <AccountBalance />,
      description: "Transfer langsung ke rekening",
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      value: "e-wallet",
      label: "E-Wallet",
      icon: <Wallet />,
      description: "GoPay, OVO, DANA, ShopeePay",
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
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

  const renderPaymentMethodForm = () => {
    const formVariants = {
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, staggerChildren: 0.1 },
      },
    };

    const fieldVariants = {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    };

    switch (paymentData.method) {
      case "credit card":
        return (
          <motion.div
            variants={formVariants}
            initial="initial"
            animate="animate"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    label="Card Number"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    inputProps={{ maxLength: 19 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    label="Card Holder Name"
                    name="cardHolder"
                    value={paymentData.cardHolder}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={6}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    name="expiryDate"
                    value={paymentData.expiryDate}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    inputProps={{ maxLength: 5 }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={6}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    label="CVV"
                    name="cvv"
                    value={paymentData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    inputProps={{ maxLength: 4 }}
                    type="password"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        );

      case "transfer":
        return (
          <motion.div
            variants={formVariants}
            initial="initial"
            animate="animate"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    select
                    label="Bank Name"
                    name="bankName"
                    value={paymentData.bankName}
                    onChange={handleInputChange}
                    SelectProps={{ native: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  >
                    <option value="">Select Bank</option>
                    <option value="BCA">Bank Central Asia (BCA)</option>
                    <option value="BNI">Bank Negara Indonesia (BNI)</option>
                    <option value="BRI">Bank Rakyat Indonesia (BRI)</option>
                    <option value="Mandiri">Bank Mandiri</option>
                    <option value="CIMB">CIMB Niaga</option>
                  </TextField>
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    label="Account Number"
                    name="accountNumber"
                    value={paymentData.accountNumber}
                    onChange={handleInputChange}
                    placeholder="1234567890"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        );

      case "e-wallet":
        return (
          <motion.div
            variants={formVariants}
            initial="initial"
            animate="animate"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    select
                    label="E-Wallet Provider"
                    name="walletProvider"
                    value={paymentData.walletProvider}
                    onChange={handleInputChange}
                    SelectProps={{ native: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  >
                    <option value="">Select E-Wallet</option>
                    <option value="GoPay">GoPay</option>
                    <option value="OVO">OVO</option>
                    <option value="DANA">DANA</option>
                    <option value="ShopeePay">ShopeePay</option>
                    <option value="LinkAja">LinkAja</option>
                  </TextField>
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div variants={fieldVariants}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    name="walletNumber"
                    value={paymentData.walletNumber}
                    onChange={handleInputChange}
                    placeholder="08123456789"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[4],
                        },
                        "&.Mui-focused": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 4px 20px ${alpha(
                            theme.palette.primary.main,
                            0.3
                          )}`,
                        },
                      },
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!booking) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            minHeight="60vh"
          >
            <motion.div
              animate={{
                rotate: 360,
                transition: { duration: 2, repeat: Infinity, ease: "linear" },
              }}
            >
              <CircularProgress size={60} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Typography sx={{ ml: 2, mt: 2, fontSize: "1.2rem" }}>
                Loading booking details...
              </Typography>
            </motion.div>
          </Box>
        </motion.div>
      </Container>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div variants={cardVariants} initial="initial" animate="animate">
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.02
              )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            }}
          >
            {/* Header dengan animasi */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box textAlign="center" mb={4}>
                <motion.div variants={pulseVariants} animate="animate">
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 2,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    <Payment sx={{ fontSize: 40 }} />
                  </Avatar>
                </motion.div>
                <Typography
                  component="h1"
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    mb: 1,
                  }}
                >
                  Complete Your Payment
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Secure and fast payment processing
                </Typography>
              </Box>
            </motion.div>

            {/* Booking Summary dengan animasi */}
            <motion.div
              variants={cardVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 3,
                  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        mr: 2,
                        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      }}
                    >
                      <Verified />
                    </Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Booking Summary
                    </Typography>
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {booking.tourName}
                        </Typography>
                        <Typography
                          color="text.secondary"
                          gutterBottom
                          sx={{ mb: 3 }}
                        >
                          {booking.tourDescription}
                        </Typography>

                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Chip
                              icon={<Timer />}
                              label={`${booking.duration.days} days, ${booking.duration.nights} nights`}
                              size="medium"
                              sx={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Chip
                              label={`${booking.participants} participants`}
                              size="medium"
                              sx={{
                                background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          </motion.div>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Chip
                              label={new Date(
                                booking.departureDate
                              ).toLocaleDateString()}
                              size="medium"
                              sx={{
                                background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                color: "white",
                                fontWeight: 600,
                              }}
                            />
                          </motion.div>
                        </Stack>
                      </motion.div>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        style={{ textAlign: "right" }}
                      >
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 800,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            backgroundClip: "text",
                            WebkitBackgroundClip: "text",
                            color: "transparent",
                          }}
                        >
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(booking.costBreakdown.totalCost)}
                        </Typography>
                        <Typography
                          variant="body1"
                          color="text.secondary"
                          sx={{ fontWeight: 500 }}
                        >
                          Total Amount
                        </Typography>
                      </motion.div>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </motion.div>

            {/* Stepper dengan animasi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Stepper
                activeStep={activeStep}
                sx={{
                  mb: 4,
                  "& .MuiStepLabel-root": {
                    "& .MuiStepLabel-label": {
                      fontWeight: 600,
                    },
                  },
                  "& .MuiStepIcon-root": {
                    fontSize: "2rem",
                  },
                }}
              >
                {paymentSteps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                      >
                        {label}
                      </motion.div>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </motion.div>

            {/* Error Alert dengan animasi */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert
                    severity="error"
                    sx={{
                      mb: 2,
                      borderRadius: 2,
                      "& .MuiAlert-message": {
                        fontWeight: 500,
                      },
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Content dengan AnimatePresence */}
            <AnimatePresence mode="wait">
              {/* Step 0: Payment Method Selection */}
              {activeStep === 0 && (
                <motion.div
                  key="step0"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                      <Card
                        sx={{
                          borderRadius: 3,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" mb={3}>
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                mr: 2,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                              }}
                            >
                              <Security />
                            </Avatar>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Select Payment Method
                            </Typography>
                          </Box>

                          <FormControl component="fieldset" sx={{ width: "100%" }}>
                            <RadioGroup
                              value={paymentData.method}
                              onChange={handlePaymentMethodChange}
                            >
                              {paymentMethods.map((method, index) => (
                                <motion.div
                                  key={method.value}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <Box sx={{ mb: 2 }}>
                                    <FormControlLabel
                                      value={method.value}
                                      control={<Radio />}
                                      label={
                                        <Box
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            width: "100%",
                                          }}
                                        >
                                          <Avatar
                                            sx={{
                                              width: 48,
                                              height: 48,
                                              background: method.gradient,
                                              mr: 2,
                                            }}
                                          >
                                            {method.icon}
                                          </Avatar>
                                          <Box sx={{ flexGrow: 1 }}>
                                            <Typography
                                              variant="subtitle1"
                                              sx={{ fontWeight: 600 }}
                                            >
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
                                        borderRadius: 3,
                                        p: 2,
                                        m: 0,
                                        width: "100%",
                                        transition: "all 0.3s ease",
                                        background:
                                          paymentData.method === method.value
                                            ? alpha(theme.palette.primary.main, 0.05)
                                            : "transparent",
                                        "&:hover": {
                                          borderColor: "primary.main",
                                          background: alpha(theme.palette.primary.main, 0.03),
                                        },
                                      }}
                                    />
                                  </Box>
                                </motion.div>
                              ))}
                            </RadioGroup>
                          </FormControl>

                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <Box sx={{ mt: 4 }}>
                              <Box display="flex" alignItems="center" mb={3}>
                                <Avatar
                                  sx={{
                                    width: 32,
                                    height: 32,
                                    mr: 2,
                                    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                  }}
                                >
                                  <Lock sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                  Payment Details
                                </Typography>
                              </Box>
                              {renderPaymentMethodForm()}
                            </Box>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Card
                          sx={{
                            borderRadius: 3,
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            boxShadow: "0 8px 32px rgba(102, 126, 234, 0.3)",
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
                              Cost Breakdown
                            </Typography>
                            <List dense>
                              {booking.costBreakdown.breakdown.map((item, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, x: 20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.4 + index * 0.1 }}
                                >
                                  <ListItem sx={{ px: 0, py: 1 }}>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          variant="body2"
                                          sx={{ color: "rgba(255,255,255,0.9)" }}
                                        >
                                          {item.item}
                                        </Typography>
                                      }
                                      secondary={
                                        item.quantity > 1 ? (
                                          <Typography
                                            variant="caption"
                                            sx={{ color: "rgba(255,255,255,0.7)" }}
                                          >
                                            {item.quantity} ×
                                          </Typography>
                                        ) : null
                                      }
                                    />
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        color: item.amount < 0 ? "#4ade80" : "white",
                                      }}
                                    >
                                      {item.amount < 0 ? "-" : ""}
                                      {new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                      }).format(Math.abs(item.amount))}
                                    </Typography>
                                  </ListItem>
                                </motion.div>
                              ))}
                            </List>
                            <Divider sx={{ my: 2, borderColor: "rgba(255,255,255,0.2)" }} />
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.8 }}
                            >
                              <Box
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                  Total:
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                                  {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                  }).format(booking.costBreakdown.totalCost)}
                                </Typography>
                              </Box>
                            </motion.div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  </Grid>
                </motion.div>
              )}

              {/* Step 1: Confirmation */}
              {activeStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    }}
                  >
                    <CardContent sx={{ p: 4 }}>
                      <Box display="flex" alignItems="center" mb={3}>
                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            mr: 2,
                            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          }}
                        >
                          <Verified />
                        </Avatar>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          Confirm Payment Details
                        </Typography>
                      </Box>

                      <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              Payment Method
                            </Typography>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                              {paymentMethods.find((m) => m.value === paymentData.method)?.label}
                            </Typography>

                            {paymentData.method === "credit card" && (
                              <Box sx={{ mt: 3 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  Card Details
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  **** **** **** {paymentData.cardNumber.slice(-4)}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {paymentData.cardHolder}
                                </Typography>
                              </Box>
                            )}

                            {paymentData.method === "transfer" && (
                              <Box sx={{ mt: 3 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  Bank Details
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {paymentData.bankName}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  Account: {paymentData.accountNumber}
                                </Typography>
                              </Box>
                            )}

                            {paymentData.method === "e-wallet" && (
                              <Box sx={{ mt: 3 }}>
                                <Typography
                                  variant="subtitle2"
                                  color="text.secondary"
                                  sx={{ mb: 1 }}
                                >
                                  E-Wallet Details
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {paymentData.walletProvider}
                                </Typography>
                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                  {paymentData.walletNumber}
                                </Typography>
                              </Box>
                            )}
                          </motion.div>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            <Typography
                              variant="subtitle2"
                              color="text.secondary"
                              sx={{ mb: 1 }}
                            >
                              Amount to Pay
                            </Typography>
                            <Typography
                              variant="h3"
                              gutterBottom
                              sx={{
                                fontWeight: 800,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                              }}
                            >
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                              }).format(booking.costBreakdown.totalCost)}
                            </Typography>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.5 }}
                            >
                              <Alert
                                severity="info"
                                sx={{
                                  mt: 3,
                                  borderRadius: 2,
                                  background: alpha(theme.palette.info.main, 0.1),
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`,
                                  "& .MuiAlert-message": {
                                    fontWeight: 500,
                                  },
                                }}
                              >
                                Please review all details before proceeding with payment.
                                Payment is non-refundable after processing.
                              </Alert>
                            </motion.div>
                          </motion.div>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Processing */}
              {activeStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                      color: "white",
                      boxShadow: "0 8px 32px rgba(79, 172, 254, 0.3)",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center", py: 8 }}>
                      <motion.div
                        animate={{
                          rotate: 360,
                          transition: { duration: 2, repeat: Infinity, ease: "linear" },
                        }}
                      >
                        <CircularProgress
                          size={80}
                          sx={{ mb: 4, color: "white" }}
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
                          Processing Your Payment
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                          Please wait while we process your payment. Do not close this window.
                        </Typography>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                      >
                        <Box
                          sx={{
                            mt: 4,
                            display: "flex",
                            justifyContent: "center",
                            gap: 1,
                          }}
                        >
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                              }}
                              transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                              }}
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: "50%",
                                backgroundColor: "white",
                              }}
                            />
                          ))}
                        </Box>
                      </motion.div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons dengan animasi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    disabled={activeStep === 0 || processing}
                    onClick={handleBack}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                    }}
                  >
                    Back
                  </Button>
                </motion.div>

                {activeStep < 2 && (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      size="large"
                      variant="contained"
                      onClick={handleNext}
                      disabled={processing}
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        textTransform: "none",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        boxShadow: "0 4px 20px rgba(102, 126, 234, 0.4)",
                        "&:hover": {
                          background: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
                          boxShadow: "0 6px 25px rgba(102, 126, 234, 0.5)",
                        },
                      }}
                    >
                      {activeStep === 0 && "Continue to Confirmation"}
                      {activeStep === 1 && "Process Payment"}
                    </Button>
                  </motion.div>
                )}
              </Box>
            </motion.div>
          </Paper>
        </motion.div>

        {/* Success Dialog dengan animasi */}
        <AnimatePresence>
          {showSuccessDialog && (
            <Dialog
              open={showSuccessDialog}
              onClose={handleCloseSuccessDialog}
              maxWidth="sm"
              fullWidth
              PaperComponent={motion.div}
              PaperProps={{
                initial: { opacity: 0, scale: 0.8, y: 50 },
                animate: { opacity: 1, scale: 1, y: 0 },
                exit: { opacity: 0, scale: 0.8, y: 50 },
                transition: { duration: 0.3, ease: "easeOut" },
                style: { borderRadius: 16 },
              }}
            >
              <DialogTitle sx={{ textAlign: "center", pt: 4 }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      mx: "auto",
                      mb: 2,
                      background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 50 }} />
                  </Avatar>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 700, color: "#059669" }}
                  >
                    Payment Successful!
                  </Typography>
                </motion.div>
              </DialogTitle>

              <DialogContent>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h6" gutterBottom>
                      Your payment has been processed successfully.
                    </Typography>
                    {paymentResult && (
                      <Box
                        sx={{
                          mt: 3,
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Payment ID: {paymentResult.id}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Invoice: {paymentResult.invoiceNumber}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </motion.div>
              </DialogContent>

              <DialogActions sx={{ justifyContent: "center", pb: 4 }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    variant="contained"
                    onClick={handleCloseSuccessDialog}
                    startIcon={<Receipt />}
                    sx={{
                      borderRadius: 2,
                      px: 4,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
                      boxShadow: "0 4px 20px rgba(74, 222, 128, 0.4)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        boxShadow: "0 6px 25px rgba(74, 222, 128, 0.5)",
                      },
                    }}
                  >
                    View My Bookings
                  </Button>
                </motion.div>
              </DialogActions>
            </Dialog>
          )}
        </AnimatePresence>
      </Container>
    </motion.div>
  );
}

export default PaymentPage;
