import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import {
  Container,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const RESERVE_SLOTS = gql`
  mutation ReserveSlots($input: ReservationInput!) {
    reserveSlots(input: $input) {
      success
      message
    }
  }
`;

function ReservationPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [participants, setParticipants] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const [reserveSlots] = useMutation(RESERVE_SLOTS, {
    onCompleted: (data) => {
      setMessage({
        type: data.reserveSlots.success ? 'success' : 'error',
        text: data.reserveSlots.message,
      });
    },
    onError: (error) => {
      setMessage({ type: 'error', text: error.message });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    reserveSlots({
      variables: {
        input: {
          tourId: "tour123", // Replace with actual tour ID
          date: selectedDate.toISOString().split('T')[0],
          participants: parseInt(participants),
        },
      },
    });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography component="h1" variant="h4" color="primary" gutterBottom>
          Make a Reservation
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ mb: 2 }}>
            {message.text}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Tour Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Number of Participants"
                type="number"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                Make Reservation
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default ReservationPage; 