import React from 'react';
import { useQuery, gql } from '@apollo/client';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';

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

function Dashboard() {
  const { loading, error, data } = useQuery(GET_INVENTORY_STATUS, {
    variables: { tourId: "tour123" }, // Replace with actual tour ID
  });

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
              Inventory Dashboard
            </Typography>
            <Typography variant="body1" paragraph>
              Welcome to the Inventory Management System. Here you can view and manage your tour inventory.
            </Typography>
          </Paper>
        </Grid>
        
        {data?.getInventoryStatus.map((status) => (
          <Grid item xs={12} md={6} lg={4} key={`${status.tourId}-${status.date}`}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 240,
              }}
            >
              <Typography component="h2" variant="h6" color="primary" gutterBottom>
                Tour: {status.tourId}
              </Typography>
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
    </Container>
  );
}

export default Dashboard; 