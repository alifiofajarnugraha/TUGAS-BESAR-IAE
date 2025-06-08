import React from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { tourService } from "../services/api";
import { gql } from "@apollo/client";
import TourCard from "../components/TourCard";

// Simple query without inventory fields as fallback
const SIMPLE_TOURS_QUERY = gql`
  query GetToursSimple {
    getTourPackages {
      id
      name
      category
      shortDescription
      location {
        city
        province
        country
      }
      duration {
        days
        nights
      }
      price {
        amount
        currency
      }
      images
      status
    }
  }
`;

// Full query with inventory fields
const FULL_TOURS_QUERY = gql`
  query GetToursWithInventory {
    getTourPackages {
      id
      name
      category
      shortDescription
      location {
        city
        province
        country
      }
      duration {
        days
        nights
      }
      price {
        amount
        currency
      }
      images
      status
      inventoryStatus {
        date
        slotsLeft
        hotelAvailable
        transportAvailable
      }
      isAvailable
    }
  }
`;

function Tours() {
  const navigate = useNavigate();
  const [useSimpleQuery, setUseSimpleQuery] = React.useState(false);

  // Try full query first, fallback to simple if fails
  const {
    loading: toursLoading,
    error: toursError,
    data: toursData,
    refetch,
  } = useQuery(useSimpleQuery ? SIMPLE_TOURS_QUERY : FULL_TOURS_QUERY, {
    client: tourService,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    onError: (error) => {
      console.error("Query error:", error);
      // If inventory fields cause error, fallback to simple query
      if (error.message.includes("Cannot query field") && !useSimpleQuery) {
        console.log("Falling back to simple query...");
        setUseSimpleQuery(true);
      }
    },
  });

  // Debug log untuk melihat data yang diterima
  React.useEffect(() => {
    if (toursData?.getTourPackages) {
      console.log("Tours data received:", toursData.getTourPackages);
      console.log("Using simple query:", useSimpleQuery);
    }
  }, [toursData, useSimpleQuery]);

  // Retry with full query
  const retryWithInventory = () => {
    setUseSimpleQuery(false);
    refetch();
  };

  if (toursLoading) {
    return (
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (toursError && useSimpleQuery) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading tours: {toursError.message}
        </Alert>
      </Container>
    );
  }

  const tours = toursData?.getTourPackages || [];

  return (
    <Container sx={{ py: 8 }} maxWidth="lg">
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            background: "linear-gradient(45deg, #1976d2 30%, #21cbf3 90%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            mb: 2,
          }}
        >
          Available Tour Packages
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover amazing destinations with our curated tour packages
        </Typography>

        {/* Stats and Controls */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            {tours.length} tour{tours.length !== 1 ? "s" : ""} available
          </Typography>

          {useSimpleQuery && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="info" sx={{ mb: 1 }}>
                Inventory features not available. Showing basic tour
                information.
              </Alert>
              <Button variant="outlined" onClick={retryWithInventory}>
                Retry with Inventory Data
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* Tours Grid */}
      {tours.length > 0 ? (
        <Grid container spacing={4}>
          {tours.map((tour) => (
            <Grid item key={tour.id} xs={12} sm={6} md={4}>
              <TourCard tour={tour} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No tours available
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Check back later for new tour packages!
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default Tours;
