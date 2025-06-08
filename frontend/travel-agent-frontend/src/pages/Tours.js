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

  // Debug log untuk melihat data yang diterima
  React.useEffect(() => {
    if (toursData?.getTourPackages) {
      console.log("Tours data received:", toursData.getTourPackages);
      toursData.getTourPackages.forEach((tour, index) => {
        console.log(`Tour ${index + 1}:`, {
          name: tour.name,
          images: tour.images,
          imagesCount: tour.images ? tour.images.length : 0,
          firstImage:
            tour.images && tour.images.length > 0
              ? tour.images[0].substring(0, 50) + "..."
              : "No image",
        });
      });
    }
  }, [toursData]);

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

  // Function untuk handle image dengan better fallback
  const getImageSrc = (tour) => {
    if (tour.images && tour.images.length > 0) {
      const firstImage = tour.images[0];
      // Check if it's a valid base64 data URL
      if (firstImage.startsWith("data:image/")) {
        return firstImage;
      }
      // Check if it's a regular URL
      if (firstImage.startsWith("http")) {
        return firstImage;
      }
    }

    // Fallback to placeholder
    return `https://picsum.photos/800/600?random=${tour.id}`;
  };

  const handleImageError = (e, tour) => {
    console.error(`Image error for tour ${tour.name}:`, e);
    // Try different fallbacks
    if (e.target.src.includes("picsum")) {
      e.target.src = `https://via.placeholder.com/800x600/2196F3/white?text=${encodeURIComponent(
        tour.name
      )}`;
    } else {
      e.target.src = `https://picsum.photos/800/600?random=${tour.id}`;
    }
  };

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
                image={getImageSrc(tour)}
                alt={tour.name}
                onError={(e) => handleImageError(e, tour)}
                sx={{
                  objectFit: "cover",
                  bgcolor: "grey.200", // Fallback background
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {tour.name}
                </Typography>
                <Typography>{tour.shortDescription}</Typography>

                <Box sx={{ mt: 2 }}>
                  <Typography variant="h6" color="primary">
                    {tour.price.currency} {tour.price.amount.toLocaleString()}
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
