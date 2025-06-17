import React, { useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Schedule,
  People,
  Star,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { tourService } from "../services/api";
import { gql } from "@apollo/client";

// Simple query for Tours listing
const GET_TOURS_LIST = gql`
  query GetToursList {
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
      maxParticipants
      isAvailable
    }
  }
`;

// Categories for filtering
const TOUR_CATEGORIES = [
  "All",
  "Adventure",
  "Cultural",
  "Beach",
  "Mountain",
  "City Tour",
  "Nature",
  "Historical",
];

function Tours() {
  const navigate = useNavigate();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [favorites, setFavorites] = useState(new Set());

  // Fetch tours data
  const { loading, error, data, refetch } = useQuery(GET_TOURS_LIST, {
    client: tourService,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    onError: (error) => {
      console.error("Tours query error:", error);
    },
  });

  // Filter tours based on search and category
  const filteredTours = React.useMemo(() => {
    let tours = data?.getTourPackages || [];

    // Filter by category
    if (selectedCategory !== "All") {
      tours = tours.filter((tour) => tour.category === selectedCategory);
    }

    // Filter by search keyword
    if (searchKeyword.trim()) {
      const keyword = searchKeyword.toLowerCase();
      tours = tours.filter(
        (tour) =>
          tour.name.toLowerCase().includes(keyword) ||
          tour.shortDescription.toLowerCase().includes(keyword) ||
          tour.location.city.toLowerCase().includes(keyword) ||
          tour.location.province.toLowerCase().includes(keyword)
      );
    }

    return tours;
  }, [data?.getTourPackages, selectedCategory, searchKeyword]);

  // Toggle favorite
  const toggleFavorite = (tourId) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tourId)) {
        newFavorites.delete(tourId);
      } else {
        newFavorites.add(tourId);
      }
      return newFavorites;
    });
  };

  // Format currency
  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  if (loading) {
    return (
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2 }}>Loading tour packages...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }} maxWidth="lg">
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading tours: {error.message}
        </Alert>
        <Button variant="outlined" onClick={() => refetch()}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 6 }} maxWidth="lg">
      {/* Header Section */}
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
          Explore Tour Packages
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          Discover amazing destinations with our curated travel experiences
        </Typography>

        {/* Search and Filter Section */}
        <Box sx={{ mb: 4 }}>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {/* Search Field */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search tours, destinations..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                  },
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  {TOUR_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Results Summary */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            {filteredTours.length} tour
            {filteredTours.length !== 1 ? "s" : ""} found
            {selectedCategory !== "All" && ` in ${selectedCategory}`}
          </Typography>

          {/* Active Filters */}
          <Box sx={{ display: "flex", gap: 1 }}>
            {selectedCategory !== "All" && (
              <Chip
                label={selectedCategory}
                onDelete={() => setSelectedCategory("All")}
                color="primary"
                variant="outlined"
              />
            )}
            {searchKeyword && (
              <Chip
                label={`"${searchKeyword}"`}
                onDelete={() => setSearchKeyword("")}
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </Box>

      {/* Tours Grid */}
      {filteredTours.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={4}>
            {filteredTours.map((tour) => (
              <Grid item key={tour.id} xs={12} sm={6} md={4}>
                <motion.div variants={cardVariants}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-8px)",
                        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                      },
                    }}
                  >
                    {/* Tour Image */}
                    <Box sx={{ position: "relative" }}>
                      <CardMedia
                        component="img"
                        height="240"
                        image={
                          tour.images?.[0] ||
                          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400"
                        }
                        alt={tour.name}
                        sx={{
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => navigate(`/tours/${tour.id}`)}
                      />

                      {/* Category Badge */}
                      <Chip
                        label={tour.category}
                        size="small"
                        sx={{
                          position: "absolute",
                          top: 12,
                          left: 12,
                          bgcolor: "rgba(25, 118, 210, 0.9)",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />

                      {/* Favorite Button */}
                      <IconButton
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: "rgba(255, 255, 255, 0.9)",
                          "&:hover": {
                            bgcolor: "rgba(255, 255, 255, 1)",
                          },
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tour.id);
                        }}
                      >
                        {favorites.has(tour.id) ? (
                          <Favorite sx={{ color: "#e91e63" }} />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>

                      {/* Availability Status */}
                      {tour.isAvailable !== undefined && (
                        <Chip
                          label={tour.isAvailable ? "Available" : "Sold Out"}
                          size="small"
                          color={tour.isAvailable ? "success" : "error"}
                          sx={{
                            position: "absolute",
                            bottom: 12,
                            right: 12,
                            fontWeight: 600,
                          }}
                        />
                      )}
                    </Box>

                    {/* Card Content */}
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          mb: 1,
                          cursor: "pointer",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                        onClick={() => navigate(`/tours/${tour.id}`)}
                      >
                        {tour.name}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2, lineHeight: 1.6 }}
                      >
                        {tour.shortDescription}
                      </Typography>

                      {/* Tour Details */}
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <LocationOn
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {tour.location.city}, {tour.location.province}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <Schedule
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {tour.duration.days} days, {tour.duration.nights}{" "}
                            nights
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <People
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Max {tour.maxParticipants} participants
                          </Typography>
                        </Box>
                      </Box>

                      {/* Price */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Starting from
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: "primary.main",
                            }}
                          >
                            {formatPrice(
                              tour.price.amount,
                              tour.price.currency
                            )}
                          </Typography>
                        </Box>

                        {/* Rating (placeholder) */}
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Star
                            sx={{ fontSize: 16, color: "#ffc107", mr: 0.5 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            4.8
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>

                    {/* Card Actions */}
                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/tours/${tour.id}`)}
                        sx={{
                          borderRadius: 2,
                          py: 1.2,
                          fontWeight: 600,
                          textTransform: "none",
                        }}
                      >
                        View Details
                      </Button>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
          }}
        >
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No tours found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or explore different categories
          </Typography>
          <Button
            variant="outlined"
            onClick={() => {
              setSearchKeyword("");
              setSelectedCategory("All");
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default Tours;
