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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import { QUERIES, MUTATIONS, bookingService } from "../../services/api";

function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

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

  const filteredBookings =
    data?.getAllBookings?.filter(
      (booking) => statusFilter === "ALL" || booking.status === statusFilter
    ) || [];

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4">Booking Management</Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Status Filter</InputLabel>
          <Select
            value={statusFilter}
            label="Status Filter"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="ALL">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>User ID</TableCell>
              <TableCell>Tour ID</TableCell>
              <TableCell>Departure Date</TableCell>
              <TableCell>Participants</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>#{booking.id}</TableCell>
                <TableCell>{booking.userId}</TableCell>
                <TableCell>{booking.tourId}</TableCell>
                <TableCell>
                  {new Date(booking.departureDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{booking.participants}</TableCell>
                <TableCell>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(booking.totalCost)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={booking.status}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={booking.paymentStatus}
                    color={
                      booking.paymentStatus === "PAID" ? "success" : "warning"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => {
                      setSelectedBooking(booking);
                      setDetailDialog(true);
                    }}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  {booking.status === "PENDING" && (
                    <>
                      <IconButton
                        onClick={() => handleConfirmBooking(booking.id)}
                        color="success"
                        size="small"
                      >
                        <CheckIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => handleCancelBooking(booking.id)}
                        color="error"
                        size="small"
                      >
                        <CancelIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Booking Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Booking Details</DialogTitle>
        <DialogContent>
          {selectedBooking && (
            <Box>
              <Typography>
                <strong>Booking ID:</strong> #{selectedBooking.id}
              </Typography>
              <Typography>
                <strong>User ID:</strong> {selectedBooking.userId}
              </Typography>
              <Typography>
                <strong>Tour ID:</strong> {selectedBooking.tourId}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selectedBooking.status}
              </Typography>
              <Typography>
                <strong>Payment Status:</strong> {selectedBooking.paymentStatus}
              </Typography>
              <Typography>
                <strong>Departure Date:</strong>{" "}
                {new Date(selectedBooking.departureDate).toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Participants:</strong> {selectedBooking.participants}
              </Typography>
              <Typography>
                <strong>Total Cost:</strong>{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                }).format(selectedBooking.totalCost)}
              </Typography>
              <Typography>
                <strong>Booking Date:</strong>{" "}
                {new Date(selectedBooking.createdAt).toLocaleDateString()}
              </Typography>
              {selectedBooking.notes && (
                <Typography>
                  <strong>Notes:</strong> {selectedBooking.notes}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default AdminBookings;
