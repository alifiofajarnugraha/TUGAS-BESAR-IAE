import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  CalendarToday as CalendarIcon,
  Assessment as AssessmentIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { QUERIES, MUTATIONS, bookingService } from "../../services/api";

function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("ALL");

  const { data, loading, error, refetch } = useQuery(QUERIES.GET_ALL_BOOKINGS, {
    client: bookingService,
  });

  const [updateBooking] = useMutation(MUTATIONS.UPDATE_BOOKING, {
    client: bookingService,
    onCompleted: () => refetch(),
  });

  const [confirmBooking] = useMutation(MUTATIONS.CONFIRM_BOOKING, {
    client: bookingService,
    onCompleted: () => refetch(),
  });

  const [cancelBooking] = useMutation(MUTATIONS.CANCEL_BOOKING, {
    client: bookingService,
    onCompleted: () => refetch(),
  });

  const handleConfirmBooking = async (id) => {
    try {
      await confirmBooking({ variables: { id } });
    } catch (err) {
      console.error("Confirm booking error:", err);
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await cancelBooking({
        variables: { id, reason: "Cancelled by admin" },
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
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "error";
      default:
        return "default";
    }
  };

  // Filter bookings
  const filteredBookings =
    data?.getAllBookings?.filter((booking) => {
      const matchesSearch =
        booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;
      return matchesSearch && matchesStatus;
    }) || [];

  // Calculate statistics
  const stats = {
    total: data?.getAllBookings?.length || 0,
    pending:
      data?.getAllBookings?.filter((b) => b.status === "PENDING").length || 0,
    confirmed:
      data?.getAllBookings?.filter((b) => b.status === "CONFIRMED").length || 0,
    revenue:
      data?.getAllBookings?.reduce((sum, b) => sum + (b.totalCost || 0), 0) ||
      0,
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <CircularProgress size={60} />
          </motion.div>
          <Typography sx={{ mt: 2, fontSize: "1.2rem" }}>
            Loading bookings...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading bookings: {error.message}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  Booking Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Monitor and manage all tour bookings in real-time
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                    borderRadius: 2,
                  }}
                >
                  Export Report
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                    borderRadius: 2,
                  }}
                >
                  Refresh
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: "Total Bookings",
                value: stats.total,
                icon: <AssessmentIcon sx={{ fontSize: 40 }} />,
                color: "#6366f1",
                bgColor: "rgba(99, 102, 241, 0.1)",
                change: "+12%",
              },
              {
                title: "Pending Bookings",
                value: stats.pending,
                icon: <CalendarIcon sx={{ fontSize: 40 }} />,
                color: "#f59e0b",
                bgColor: "rgba(245, 158, 11, 0.1)",
                change: "+5%",
              },
              {
                title: "Confirmed Bookings",
                value: stats.confirmed,
                icon: <CheckIcon sx={{ fontSize: 40 }} />,
                color: "#10b981",
                bgColor: "rgba(16, 185, 129, 0.1)",
                change: "+18%",
              },
              {
                title: "Total Revenue",
                value: new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  notation: "compact",
                }).format(stats.revenue),
                icon: <AttachMoneyIcon sx={{ fontSize: 40 }} />,
                color: "#ef4444",
                bgColor: "rgba(239, 68, 68, 0.1)",
                change: "+24%",
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 700, color: stat.color }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            {stat.title}
                          </Typography>
                          <Chip
                            label={stat.change}
                            size="small"
                            color="success"
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: stat.bgColor,
                            color: stat.color,
                            width: 60,
                            height: 60,
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Filter Section */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by booking ID or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="ALL">All Status</MenuItem>
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    label="Date Range"
                    onChange={(e) => setDateRange(e.target.value)}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="ALL">All Time</MenuItem>
                    <MenuItem value="TODAY">Today</MenuItem>
                    <MenuItem value="WEEK">This Week</MenuItem>
                    <MenuItem value="MONTH">This Month</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredBookings.length} of {stats.total} bookings
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Bookings Table */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ borderRadius: 3, overflow: "hidden" }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Booking ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>User ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tour</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Departure</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Participants</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Total Cost</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <AnimatePresence>
                    {filteredBookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        component={TableRow}
                        sx={{
                          "&:hover": {
                            bgcolor: "#f8fafc",
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            #{booking.id}
                          </Typography>
                        </TableCell>
                        <TableCell>{booking.userId}</TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 150 }}>
                            {booking.tourId}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(booking.departureDate).toLocaleDateString(
                            "id-ID"
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <PeopleIcon
                              sx={{
                                fontSize: 16,
                                mr: 0.5,
                                color: "text.secondary",
                              }}
                            />
                            {booking.participants}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "primary.main" }}
                          >
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              notation: "compact",
                            }).format(booking.totalCost)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.status}
                            color={getStatusColor(booking.status)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={booking.paymentStatus}
                            color={getPaymentStatusColor(booking.paymentStatus)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setDetailDialog(true);
                                }}
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {booking.status === "PENDING" && (
                              <>
                                <Tooltip title="Confirm Booking">
                                  <IconButton
                                    size="small"
                                    color="success"
                                    onClick={() =>
                                      handleConfirmBooking(booking.id)
                                    }
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel Booking">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                  >
                                    <CancelIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </Box>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>

            {filteredBookings.length === 0 && (
              <Box sx={{ p: 6, textAlign: "center" }}>
                <AssessmentIcon
                  sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }}
                />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No bookings found
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Try adjusting your search criteria or check back later.
                </Typography>
              </Box>
            )}
          </Paper>
        </motion.div>

        {/* Booking Detail Dialog */}
        <Dialog
          open={detailDialog}
          onClose={() => setDetailDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <VisibilityIcon />
            Booking Details - #{selectedBooking?.id}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            {selectedBooking && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, borderRadius: 2, bgcolor: "#f8fafc" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Booking Information
                    </Typography>
                    <List dense>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <AssessmentIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Booking ID"
                          secondary={`#${selectedBooking.id}`}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <PeopleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="User ID"
                          secondary={selectedBooking.userId}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <LocationIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Tour ID"
                          secondary={selectedBooking.tourId}
                        />
                      </ListItem>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <CalendarIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Departure Date"
                          secondary={new Date(
                            selectedBooking.departureDate
                          ).toLocaleDateString("id-ID", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        />
                      </ListItem>
                    </List>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 3, borderRadius: 2, bgcolor: "#f0fdf4" }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Payment & Status
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Booking Status
                      </Typography>
                      <Chip
                        label={selectedBooking.status}
                        color={getStatusColor(selectedBooking.status)}
                        sx={{ fontWeight: 600, mb: 2 }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Payment Status
                      </Typography>
                      <Chip
                        label={selectedBooking.paymentStatus}
                        color={getPaymentStatusColor(
                          selectedBooking.paymentStatus
                        )}
                        sx={{ fontWeight: 600, mb: 2 }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Participants:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {selectedBooking.participants} persons
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Total Cost:
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 700, color: "primary.main" }}
                      >
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(selectedBooking.totalCost)}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Booking created:{" "}
                      {new Date(selectedBooking.createdAt).toLocaleDateString(
                        "id-ID"
                      )}
                    </Typography>
                  </Card>
                </Grid>

                {selectedBooking.notes && (
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 2, bgcolor: "#fefce8" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Special Notes
                      </Typography>
                      <Typography variant="body1">
                        {selectedBooking.notes}
                      </Typography>
                    </Card>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setDetailDialog(false)} variant="outlined">
              Close
            </Button>
            {selectedBooking?.status === "PENDING" && (
              <>
                <Button
                  onClick={() => {
                    handleConfirmBooking(selectedBooking.id);
                    setDetailDialog(false);
                  }}
                  variant="contained"
                  color="success"
                  startIcon={<CheckIcon />}
                >
                  Confirm Booking
                </Button>
                <Button
                  onClick={() => {
                    handleCancelBooking(selectedBooking.id);
                    setDetailDialog(false);
                  }}
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                >
                  Cancel Booking
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </motion.div>
    </Container>
  );
}

export default AdminBookings;
