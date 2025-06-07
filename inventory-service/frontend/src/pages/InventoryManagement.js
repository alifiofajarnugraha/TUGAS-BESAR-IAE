import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const GET_INVENTORY_STATUS = gql`
  query GetInventoryStatus($tourId: ID!) {
    getInventoryStatus(tourId: $tourId) {
      tourId
      date
      slotsLeft
      hotelAvailable
      transportAvailable
    }
  }
`;

const UPDATE_INVENTORY = gql`
  mutation UpdateInventory($input: InventoryUpdateInput!) {
    updateInventory(input: $input) {
      tourId
      date
      slots
      hotelAvailable
      transportAvailable
    }
  }
`;

function InventoryManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slots, setSlots] = useState('');
  const [hotelAvailable, setHotelAvailable] = useState(true);
  const [transportAvailable, setTransportAvailable] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const { loading, error, data } = useQuery(GET_INVENTORY_STATUS, {
    variables: { tourId: "tour123" }, // Replace with actual tour ID
  });

  const [updateInventory] = useMutation(UPDATE_INVENTORY, {
    onCompleted: () => {
      setMessage({ type: 'success', text: 'Inventory updated successfully!' });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateInventory({
      variables: {
        input: {
          tourId: "tour123", // Replace with actual tour ID
          date: selectedDate.toISOString().split('T')[0],
          slots: parseInt(slots),
          hotelAvailable,
          transportAvailable,
        },
      },
    });
  };

  if (loading) return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Container>
      <Typography color="error">Error: {error.message}</Typography>
    </Container>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              Inventory Management
            </Typography>
            
            {message.text && (
              <Alert severity={message.type} sx={{ mb: 2 }}>
                {message.text}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date"
                      value={selectedDate}
                      onChange={(newValue) => setSelectedDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Available Slots"
                    type="number"
                    value={slots}
                    onChange={(e) => setSlots(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                  >
                    Update Inventory
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Current Inventory Status
            </Typography>
            <Grid container spacing={2}>
              {data?.getInventoryStatus.map((status) => (
                <Grid item xs={12} md={6} lg={4} key={`${status.tourId}-${status.date}`}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                      Date: {new Date(status.date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1">
                      Slots Left: {status.slotsLeft}
                    </Typography>
                    <Typography variant="body1">
                      Hotel Available: {status.hotelAvailable ? 'Yes' : 'No'}
                    </Typography>
                    <Typography variant="body1">
                      Transport Available: {status.transportAvailable ? 'Yes' : 'No'}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default InventoryManagement; 