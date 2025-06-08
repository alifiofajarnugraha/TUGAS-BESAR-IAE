import React from "react";
import { useQuery, gql } from "@apollo/client";
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { inventoryService } from "../services/api";

const GET_AVAILABLE_TOURS = gql`
  query GetAvailableTours {
    getInventoryStatus(tourId: "all") {
      tourId
      date
      slotsLeft
      hotelAvailable
      transportAvailable
    }
  }
`;

function Tours() {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_AVAILABLE_TOURS, {
    client: inventoryService,
  });

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error loading tours: {error.message}</Alert>
      </Container>
    );

  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      <Typography variant="h3" component="h1" gutterBottom align="center">
        Available Tours
      </Typography>

      <Grid container spacing={4}>
        {data?.getInventoryStatus.map((tour) => (
          <Grid item key={tour.tourId} xs={12} sm={6} md={4}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                "&:hover": {
                  transform: "scale(1.02)",
                  transition: "all 0.2s ease-in-out",
                },
              }}
            >
              <CardMedia
                component="img"
                height="200"
                image={`https://source.unsplash.com/800x600/?${tour.tourId}`}
                alt={tour.tourId}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  Tour ID: {tour.tourId}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Available Date: {new Date(tour.date).toLocaleDateString()}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`${tour.slotsLeft} slots left`}
                    color={tour.slotsLeft > 5 ? "success" : "warning"}
                    sx={{ mr: 1 }}
                  />
                  {tour.hotelAvailable && (
                    <Chip
                      label="Hotel Available"
                      color="primary"
                      sx={{ mr: 1 }}
                    />
                  )}
                  {tour.transportAvailable && (
                    <Chip label="Transport Available" color="primary" />
                  )}
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/book/${tour.tourId}`)}
                >
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default Tours;
