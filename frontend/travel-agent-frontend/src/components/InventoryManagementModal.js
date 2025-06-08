import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useQuery, useMutation } from "@apollo/client";
import { inventoryService, QUERIES, MUTATIONS } from "../services/api";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  maxHeight: "90vh",
  overflowY: "auto",
};

function InventoryManagementModal({ open, onClose, tour }) {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState(0);
  const [hotelAvailable, setHotelAvailable] = useState(true);
  const [transportAvailable, setTransportAvailable] = useState(true);
  const [message, setMessage] = useState(null);

  const { data, loading, error, refetch } = useQuery(
    QUERIES.GET_INVENTORY_STATUS,
    {
      variables: { tourId: tour.id },
      client: inventoryService,
      skip: !tour.id,
    }
  );

  const [updateInventory, { loading: updateLoading }] = useMutation(
    MUTATIONS.UPDATE_INVENTORY,
    {
      client: inventoryService,
      onCompleted: () => {
        setMessage({ type: "success", text: "Inventory updated!" });
        refetch();
      },
      onError: (err) => {
        setMessage({ type: "error", text: err.message });
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date) {
      setMessage({ type: "error", text: "Date is required" });
      return;
    }
    updateInventory({
      variables: {
        input: {
          tourId: tour.id,
          date,
          slots: parseInt(slots, 10),
          hotelAvailable,
          transportAvailable,
        },
      },
    });
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Manage Inventory for {tour.name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Date (YYYY-MM-DD)"
                fullWidth
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Slots"
                type="number"
                fullWidth
                value={slots}
                onChange={(e) => setSlots(e.target.value)}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={hotelAvailable}
                    onChange={(e) => setHotelAvailable(e.target.checked)}
                  />
                }
                label="Hotel Available"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={transportAvailable}
                    onChange={(e) => setTransportAvailable(e.target.checked)}
                  />
                }
                label="Transport Available"
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={updateLoading}
              >
                {updateLoading ? "Updating..." : "Update Inventory"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom>
            Current Inventory
          </Typography>
          {loading ? (
            <CircularProgress size={24} />
          ) : error ? (
            <Alert severity="error">{error.message}</Alert>
          ) : (
            <Paper
              variant="outlined"
              sx={{ maxHeight: 200, overflowY: "auto" }}
            >
              <Box sx={{ p: 2 }}>
                {data?.getTourInventoryStatus?.length === 0 && (
                  <Typography>No inventory data.</Typography>
                )}
                {data?.getTourInventoryStatus?.map((inv) => (
                  <Box
                    key={inv.date}
                    sx={{
                      mb: 2,
                      p: 1,
                      bgcolor: "#f9f9f9",
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="body2">
                      <b>Date:</b> {inv.date}
                    </Typography>
                    <Typography variant="body2">
                      <b>Slots:</b> {inv.slotsLeft}
                    </Typography>
                    <Typography variant="body2">
                      <b>Hotel:</b> {inv.hotelAvailable ? "Yes" : "No"}
                    </Typography>
                    <Typography variant="body2">
                      <b>Transport:</b> {inv.transportAvailable ? "Yes" : "No"}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Modal>
  );
}

export default InventoryManagementModal;
