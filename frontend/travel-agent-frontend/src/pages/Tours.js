import React, { useState, useMemo } from "react";
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
  Badge,
  Divider,
} from "@mui/material";
import {
  Search,
  LocationOn,
  Schedule,
  People,
  Star,
  Favorite,
  FavoriteBorder,
  CalendarToday,
  EventAvailable,
  Inventory as InventoryIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { tourService, inventoryService, QUERIES } from "../services/api";
import { gql } from "@apollo/client";

// ✅ FIXED: Use only existing queries from inventory service
const GET_TOURS_WITH_INVENTORY = gql`
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
      createdAt
      updatedAt
    }
  }
`;

// ✅ FIXED: Use existing inventory query instead of non-existent summary
const GET_ALL_INVENTORY_FOR_TOURS = gql`
  query GetAllInventoryForTours {
    getAllInventory {
      id
      tourId
      date
      slots
      hotelAvailable
      transportAvailable
      createdAt
      updatedAt
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
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  // Date range for filtering (next 3 months)
  const dateRange = useMemo(() => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 3);

    return {
      startDate: today.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, []);

  // Fetch tours data
  const {
    loading: toursLoading,
    error: toursError,
    data: toursData,
    refetch,
  } = useQuery(GET_TOURS_WITH_INVENTORY, {
    client: tourService,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    onError: (error) => {
      console.error("Tours query error:", error);
    },
  });

  // ✅ FIXED: Fetch all inventory data and process on frontend
  const {
    loading: inventoryLoading,
    error: inventoryError,
    data: inventoryData,
  } = useQuery(GET_ALL_INVENTORY_FOR_TOURS, {
    client: inventoryService,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    skip: !toursData?.getTourPackages?.length,
    onError: (error) => {
      console.error("Inventory query error:", error);
    },
  });

  // ✅ FIXED: Process inventory data to create summary on frontend
  const inventorySummaryByTour = useMemo(() => {
    if (!inventoryData?.getAllInventory) return {};

    const summary = {};
    const today = dateRange.startDate;
    const endDate = dateRange.endDate;

    inventoryData.getAllInventory.forEach((inv) => {
      // Filter by date range
      if (inv.date >= today && inv.date <= endDate) {
        if (!summary[inv.tourId]) {
          summary[inv.tourId] = {
            totalAvailableDays: 0,
            totalSlots: 0,
            nearestAvailableDate: null,
            isAvailable: false,
            availableDates: [],
          };
        }

        const tourSummary = summary[inv.tourId];
        tourSummary.totalAvailableDays++;
        tourSummary.totalSlots += inv.slots;

        if (inv.slots > 0) {
          tourSummary.availableDates.push(inv);
          tourSummary.isAvailable = true;

          // Set nearest available date
          if (
            !tourSummary.nearestAvailableDate ||
            inv.date < tourSummary.nearestAvailableDate
          ) {
            tourSummary.nearestAvailableDate = inv.date;
          }
        }
      }
    });

    return summary;
  }, [inventoryData, dateRange]);

  // Combine tours data with inventory summary
  const enhancedTours = useMemo(() => {
    if (!toursData?.getTourPackages) return [];

    const tours = toursData.getTourPackages;

    return tours.map((tour) => {
      const inventory = inventorySummaryByTour[tour.id] || {
        totalAvailableDays: 0,
        totalSlots: 0,
        nearestAvailableDate: null,
        isAvailable: false,
        availableDates: [],
      };

      return {
        ...tour,
        inventory,
      };
    });
  }, [toursData, inventorySummaryByTour]);

  // Filter tours based on search, category, and availability
  const filteredTours = useMemo(() => {
    let tours = enhancedTours;

    // Filter by availability
    if (availabilityFilter === "Available") {
      tours = tours.filter((tour) => tour.inventory.isAvailable);
    } else if (availabilityFilter === "Sold Out") {
      tours = tours.filter((tour) => !tour.inventory.isAvailable);
    }

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
  }, [enhancedTours, selectedCategory, searchKeyword, availabilityFilter]);

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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Not available";
    return new Date(dateString).toLocaleDateString("id-ID", {
      month: "short",
      day: "numeric",
    });
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

  const loading = toursLoading || inventoryLoading;
  const error = toursError || inventoryError;

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
          Discover amazing destinations with real-time availability
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
            <Grid item xs={12} md={4}>
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

            {/* Availability Filter */}
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={availabilityFilter}
                  label="Availability"
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  sx={{ borderRadius: 3 }}
                >
                  <MenuItem value="All">All Tours</MenuItem>
                  <MenuItem value="Available">Available Now</MenuItem>
                  <MenuItem value="Sold Out">Sold Out</MenuItem>
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
          <Box>
            <Typography variant="body1" color="text.secondary">
              {filteredTours.length} tour{filteredTours.length !== 1 ? "s" : ""}{" "}
              found
              {selectedCategory !== "All" && ` in ${selectedCategory}`}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredTours.filter((t) => t.inventory.isAvailable).length}{" "}
              available now
            </Typography>
          </Box>

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
            {availabilityFilter !== "All" && (
              <Chip
                label={availabilityFilter}
                onDelete={() => setAvailabilityFilter("All")}
                color="secondary"
                variant="outlined"
              />
            )}
            {searchKeyword && (
              <Chip
                label={`"${searchKeyword}"`}
                onDelete={() => setSearchKeyword("")}
                color="info"
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
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 12,
                          right: 12,
                          display: "flex",
                          gap: 1,
                        }}
                      >
                        {tour.inventory.isAvailable ? (
                          <Tooltip
                            title={`${tour.inventory.totalSlots} slots available`}
                          >
                            <Badge
                              badgeContent={tour.inventory.totalSlots}
                              color="success"
                            >
                              <Chip
                                label="Available"
                                size="small"
                                color="success"
                                sx={{ fontWeight: 600 }}
                              />
                            </Badge>
                          </Tooltip>
                        ) : (
                          <Chip
                            label="Sold Out"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 600 }}
                          />
                        )}
                      </Box>

                      {/* Available Days Indicator */}
                      {tour.inventory.totalAvailableDays > 0 && (
                        <Chip
                          icon={<CalendarToday />}
                          label={`${tour.inventory.totalAvailableDays} days`}
                          size="small"
                          sx={{
                            position: "absolute",
                            bottom: 12,
                            left: 12,
                            bgcolor: "rgba(255, 255, 255, 0.9)",
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

                        {/* Next Available Date */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 1,
                          }}
                        >
                          <EventAvailable
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Next:{" "}
                            {formatDate(tour.inventory.nearestAvailableDate)}
                          </Typography>
                        </Box>

                        {/* Inventory Info */}
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <InventoryIcon
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {tour.inventory.totalSlots} slots available
                          </Typography>
                        </Box>
                      </Box>

                      <Divider sx={{ mb: 2 }} />

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
                        disabled={!tour.inventory.isAvailable}
                        sx={{
                          borderRadius: 2,
                          py: 1.2,
                          fontWeight: 600,
                          textTransform: "none",
                        }}
                      >
                        {tour.inventory.isAvailable
                          ? "View Details"
                          : "View (Sold Out)"}
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
              setAvailabilityFilter("All");
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
