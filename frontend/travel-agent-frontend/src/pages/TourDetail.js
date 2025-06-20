import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Avatar,
  Rating,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tab,
  Tabs,
  Paper,
  TextField,
  Badge,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  People,
  CheckCircle,
  Cancel,
  ExpandMore,
  AttachMoney,
  FlightTakeoff,
  Hotel,
  Restaurant,
  Share,
  Favorite,
  BookOnline,
  CalendarToday,
  EventAvailable,
  Inventory as InventoryIcon,
  DirectionsBus,
  Refresh,
  DateRange,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { tourService, inventoryService, QUERIES } from "../services/api";
import { gql } from "@apollo/client";

// Enhanced query for tour detail
const GET_TOUR_DETAIL = gql`
  query GetTourDetail($id: ID!) {
    getTourPackage(id: $id) {
      id
      name
      category
      shortDescription
      longDescription
      location {
        city
        province
        country
        meetingPoint
      }
      duration {
        days
        nights
      }
      price {
        amount
        currency
      }
      inclusions
      exclusions
      itinerary {
        day
        title
        description
        activities
      }
      images
      status
      createdAt
      updatedAt
    }
  }
`;

// ✅ NEW: Get inventory for tour with date range
const GET_TOUR_INVENTORY = gql`
  query GetTourInventory($tourId: ID!, $startDate: String!, $endDate: String!) {
    getTourAvailabilityRange(
      tourId: $tourId
      startDate: $startDate
      endDate: $endDate
    ) {
      tourId
      date
      slotsLeft
      hotelAvailable
      transportAvailable
    }
  }
`;

// ✅ NEW: Check availability for specific date
const CHECK_TOUR_AVAILABILITY = gql`
  query CheckTourAvailability(
    $tourId: ID!
    $date: String!
    $participants: Int!
  ) {
    checkAvailability(
      tourId: $tourId
      date: $date
      participants: $participants
    ) {
      available
      message
      slotsLeft
      hotelAvailable
      transportAvailable
    }
  }
`;

// Custom TabPanel component
const CustomTabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tour-tabpanel-${index}`}
      aria-labelledby={`tour-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

function TourDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [participants, setParticipants] = useState(2);

  // Date range for inventory (next 6 months)
  const dateRange = useMemo(() => {
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(today.getMonth() + 6);

    return {
      startDate: today.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    };
  }, []);

  // Fetch tour detail
  const {
    loading: tourLoading,
    error: tourError,
    data: tourData,
  } = useQuery(GET_TOUR_DETAIL, {
    variables: { id },
    client: tourService,
    errorPolicy: "all",
    onError: (error) => {
      console.error("Tour detail query error:", error);
    },
  });

  // Fetch inventory data
  const {
    loading: inventoryLoading,
    error: inventoryError,
    data: inventoryData,
    refetch: refetchInventory,
  } = useQuery(GET_TOUR_INVENTORY, {
    variables: {
      tourId: id,
      ...dateRange,
    },
    client: inventoryService,
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
    skip: !id,
    onError: (error) => {
      console.error("Inventory query error:", error);
    },
  });

  // Check specific date availability
  const {
    data: availabilityData,
    loading: availabilityLoading,
    refetch: checkAvailability,
  } = useQuery(CHECK_TOUR_AVAILABILITY, {
    variables: {
      tourId: id,
      date: selectedDate,
      participants,
    },
    client: inventoryService,
    skip: !selectedDate || !id,
    fetchPolicy: "no-cache",
  });

  const tour = tourData?.getTourPackage;
  const inventory = inventoryData?.getTourAvailabilityRange || [];

  // Process inventory data
  const inventorySummary = useMemo(() => {
    if (!inventory.length)
      return {
        totalDays: 0,
        totalSlots: 0,
        availableDates: [],
        nearestDate: null,
        isAvailable: false,
      };

    const availableDates = inventory.filter((inv) => inv.slotsLeft > 0);
    const totalSlots = inventory.reduce((sum, inv) => sum + inv.slotsLeft, 0);

    return {
      totalDays: inventory.length,
      totalSlots,
      availableDates,
      nearestDate: availableDates[0]?.date || null,
      isAvailable: availableDates.length > 0,
    };
  }, [inventory]);

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
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Handle date selection
  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  // Handle booking
  const handleBooking = () => {
    if (!selectedDate) {
      alert("Please select a departure date");
      return;
    }

    // ✅ FIXED: Change dari 'booking' ke 'book' untuk match dengan route
    navigate(
      `/book/${tour.id}?date=${selectedDate}&participants=${participants}`
    );
  };

  const loading = tourLoading || inventoryLoading;
  const error = tourError || inventoryError;

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
          <Typography sx={{ ml: 2 }}>Loading tour details...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || !tour) {
    return (
      <Container sx={{ py: 4 }} maxWidth="lg">
        <Alert severity="error" sx={{ mb: 2 }}>
          {error ? `Error loading tour: ${error.message}` : "Tour not found"}
        </Alert>
        <Button variant="outlined" onClick={() => navigate("/tours")}>
          Back to Tours
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="lg">
      {/* Breadcrumb */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/tours")}
        >
          Tours &gt; {tour.category} &gt; {tour.name}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Images and Basic Info */}
        <Grid item xs={12} md={8}>
          {/* Main Image Gallery */}
          <Card sx={{ mb: 4, borderRadius: 3, overflow: "hidden" }}>
            <Box sx={{ position: "relative" }}>
              <img
                src={
                  tour.images?.[selectedImage] ||
                  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800"
                }
                alt={tour.name}
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                }}
              />

              {/* Image Navigation */}
              {tour.images && tour.images.length > 1 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 16,
                    left: 16,
                    display: "flex",
                    gap: 1,
                  }}
                >
                  {tour.images.map((img, index) => (
                    <Avatar
                      key={index}
                      src={img}
                      sx={{
                        width: 50,
                        height: 50,
                        cursor: "pointer",
                        border:
                          selectedImage === index ? "3px solid white" : "none",
                        opacity: selectedImage === index ? 1 : 0.7,
                      }}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </Box>
              )}

              {/* Category and Status Badges */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  left: 16,
                  display: "flex",
                  gap: 1,
                }}
              >
                <Chip
                  label={tour.category}
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Chip
                  label={
                    inventorySummary.isAvailable ? "Available" : "Sold Out"
                  }
                  color={inventorySummary.isAvailable ? "success" : "error"}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* ✅ NEW: Inventory Info Badge */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  display: "flex",
                  gap: 1,
                }}
              >
                <Tooltip
                  title={`${inventorySummary.totalSlots} total slots available`}
                >
                  <Badge
                    badgeContent={inventorySummary.totalSlots}
                    color="success"
                  >
                    <Chip
                      icon={<InventoryIcon />}
                      label={`${inventorySummary.totalDays} days`}
                      sx={{
                        bgcolor: "rgba(255, 255, 255, 0.9)",
                        fontWeight: 600,
                      }}
                    />
                  </Badge>
                </Tooltip>
              </Box>
            </Box>
          </Card>

          {/* Tour Information Tabs */}
          <Card sx={{ borderRadius: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="tour information tabs"
                variant="fullWidth"
              >
                <Tab label="Overview" />
                <Tab label="Itinerary" />
                <Tab label="Includes & Excludes" />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 16 }} />
                      Availability
                    </Box>
                  }
                />
              </Tabs>
            </Box>

            {/* Overview Tab */}
            <CustomTabPanel value={selectedTab} index={0}>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
                {tour.longDescription || tour.shortDescription}
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <LocationOn sx={{ mr: 2, color: "primary.main" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {tour.location.city}, {tour.location.province},{" "}
                        {tour.location.country}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Schedule sx={{ mr: 2, color: "primary.main" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Duration
                      </Typography>
                      <Typography variant="body1">
                        {tour.duration.days} days, {tour.duration.nights} nights
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <People sx={{ mr: 2, color: "primary.main" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Group Size
                      </Typography>
                      <Typography variant="body1">Small group tour</Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <FlightTakeoff sx={{ mr: 2, color: "primary.main" }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Meeting Point
                      </Typography>
                      <Typography variant="body1">
                        {tour.location.meetingPoint || "Will be provided"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CustomTabPanel>

            {/* Itinerary Tab */}
            <CustomTabPanel value={selectedTab} index={1}>
              {tour.itinerary && tour.itinerary.length > 0 ? (
                <Box>
                  {tour.itinerary.map((day, index) => (
                    <Accordion key={index} defaultExpanded={index === 0}>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Day {day.day}: {day.title}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                          {day.description}
                        </Typography>

                        <Typography
                          variant="subtitle2"
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          Activities:
                        </Typography>
                        <List dense>
                          {day.activities.map((activity, actIndex) => (
                            <ListItem key={actIndex} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircle
                                  sx={{ fontSize: 16, color: "success.main" }}
                                />
                              </ListItemIcon>
                              <ListItemText primary={activity} />
                            </ListItem>
                          ))}
                        </List>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Box>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  Detailed itinerary will be provided upon booking.
                </Typography>
              )}
            </CustomTabPanel>

            {/* Includes & Excludes Tab */}
            <CustomTabPanel value={selectedTab} index={2}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "success.main", fontWeight: 600 }}
                  >
                    What's Included
                  </Typography>
                  <List>
                    {tour.inclusions && tour.inclusions.length > 0 ? (
                      tour.inclusions.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircle
                              sx={{ fontSize: 16, color: "success.main" }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No inclusions specified
                      </Typography>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h6"
                    sx={{ mb: 2, color: "error.main", fontWeight: 600 }}
                  >
                    What's Not Included
                  </Typography>
                  <List>
                    {tour.exclusions && tour.exclusions.length > 0 ? (
                      tour.exclusions.map((item, index) => (
                        <ListItem key={index} sx={{ py: 0.5 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Cancel
                              sx={{ fontSize: 16, color: "error.main" }}
                            />
                          </ListItemIcon>
                          <ListItemText primary={item} />
                        </ListItem>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No exclusions specified
                      </Typography>
                    )}
                  </List>
                </Grid>
              </Grid>
            </CustomTabPanel>

            {/* ✅ NEW: Availability Tab */}
            <CustomTabPanel value={selectedTab} index={3}>
              <Box
                sx={{
                  mb: 3,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Available Dates</Typography>
                <IconButton
                  onClick={refetchInventory}
                  disabled={inventoryLoading}
                >
                  <Refresh />
                </IconButton>
              </Box>

              {inventoryLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : inventorySummary.availableDates.length > 0 ? (
                <Grid container spacing={2}>
                  {inventorySummary.availableDates
                    .slice(0, 20)
                    .map((inv, index) => {
                      const date = new Date(inv.date);
                      const isSelected = selectedDate === inv.date;

                      return (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Card
                            sx={{
                              cursor: "pointer",
                              border: isSelected ? "2px solid" : "1px solid",
                              borderColor: isSelected
                                ? "primary.main"
                                : "divider",
                              "&:hover": {
                                borderColor: "primary.main",
                                bgcolor: "action.hover",
                              },
                            }}
                            onClick={() => setSelectedDate(inv.date)}
                          >
                            <CardContent sx={{ p: 2, textAlign: "center" }}>
                              <Typography variant="subtitle2" color="primary">
                                {date.toLocaleDateString("id-ID", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                              >
                                {date.toLocaleDateString("id-ID", {
                                  weekday: "short",
                                })}
                              </Typography>

                              <Box sx={{ mt: 1 }}>
                                <Chip
                                  label={`${inv.slotsLeft} slots`}
                                  size="small"
                                  color={
                                    inv.slotsLeft > 5 ? "success" : "warning"
                                  }
                                />
                              </Box>

                              <Box
                                sx={{
                                  mt: 1,
                                  display: "flex",
                                  justifyContent: "center",
                                  gap: 1,
                                }}
                              >
                                {inv.hotelAvailable && (
                                  <Tooltip title="Hotel Available">
                                    <Hotel
                                      sx={{
                                        fontSize: 16,
                                        color: "success.main",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                                {inv.transportAvailable && (
                                  <Tooltip title="Transport Available">
                                    <DirectionsBus
                                      sx={{
                                        fontSize: 16,
                                        color: "success.main",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      );
                    })}
                </Grid>
              ) : (
                <Paper sx={{ p: 4, textAlign: "center" }}>
                  <CalendarToday
                    sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Available Dates
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This tour is currently sold out for the next 6 months.
                  </Typography>
                </Paper>
              )}

              {/* Selected Date Info */}
              {selectedDate && availabilityData?.checkAvailability && (
                <Paper
                  sx={{
                    mt: 3,
                    p: 3,
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                  }}
                >
                  <Typography variant="h6" gutterBottom>
                    Selected Date: {formatDate(selectedDate)}
                  </Typography>
                  <Typography variant="body1">
                    {availabilityData.checkAvailability.message}
                  </Typography>
                  <Typography variant="body2">
                    Available slots:{" "}
                    {availabilityData.checkAvailability.slotsLeft}
                  </Typography>
                </Paper>
              )}
            </CustomTabPanel>
          </Card>
        </Grid>

        {/* Right Column - Booking Card */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
              position: "sticky",
              top: 24,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Header */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  {tour.name}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Rating value={4.8} precision={0.1} readOnly size="small" />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    4.8 (124 reviews)
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Price */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Starting from
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    color: "primary.main",
                    mb: 1,
                  }}
                >
                  {formatPrice(tour.price.amount, tour.price.currency)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  per person
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* ✅ NEW: Booking Form */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Select Date & Participants
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Departure Date"
                      type="date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        min: dateRange.startDate,
                        max: dateRange.endDate,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Participants"
                      type="number"
                      value={participants}
                      onChange={(e) =>
                        setParticipants(
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      }
                      inputProps={{ min: 1, max: 20 }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* ✅ NEW: Availability Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Availability Summary
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="primary">
                        {inventorySummary.totalDays}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Available Days
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="h4" color="success.main">
                        {inventorySummary.totalSlots}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total Slots
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {inventorySummary.nearestDate && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Next available: {formatDate(inventorySummary.nearestDate)}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<BookOnline />}
                  onClick={handleBooking}
                  disabled={!inventorySummary.isAvailable || !selectedDate}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  {!inventorySummary.isAvailable
                    ? "Sold Out"
                    : !selectedDate
                    ? "Select Date to Book"
                    : "Book Now"}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Contact Us
                </Button>
              </Box>

              {/* Additional Info */}
              <Box sx={{ mt: 3, p: 2, bgcolor: "grey.50", borderRadius: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center" }}
                >
                  <strong>Free cancellation</strong> up to 24 hours before
                  departure
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default TourDetail;
