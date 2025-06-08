import React from "react";
import { useQuery } from "@apollo/client";
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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tourService } from "../services/api";
import { QUERIES } from "../services/api";

function Tours() {
  const navigate = useNavigate();
  const {
    loading: toursLoading,
    error: toursError,
    data: toursData,
  } = useQuery(QUERIES.GET_TOUR_PACKAGES, {
    client: tourService,
  });

  if (toursLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (toursError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading tours: {toursError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      <Typography variant="h3" gutterBottom align="center">
        Available Tour Packages
      </Typography>
      <Grid container spacing={4}>
        {toursData?.getTourPackages.map((tour) => (
          <Grid item key={tour.id} xs={12} sm={6} md={4}>
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
                image={`https://source.unsplash.com/800x600/?${tour.location.city}`}
                alt={tour.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {tour.name}
                </Typography>
                <Typography>{tour.short_description}</Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    {tour.price.currency} {tour.price.amount}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {tour.duration.days} Days {tour.duration.nights} Nights
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    {tour.location.city}, {tour.location.country}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{ mt: 2 }}
                  onClick={() => navigate(`/book/${tour.id}`)}
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
