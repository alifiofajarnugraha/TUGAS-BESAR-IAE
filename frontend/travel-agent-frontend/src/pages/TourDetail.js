import React, { useState } from "react";
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
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { tourService } from "../services/api";
import { gql } from "@apollo/client";

// Detailed query for single tour
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
      maxParticipants
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
      defaultSlots
      hotelRequired
      transportRequired
      inventoryStatus {
        date
        slotsLeft
        hotelAvailable
        transportAvailable
      }
      isAvailable
      createdAt
      updatedAt
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

  // Fetch tour detail
  const { loading, error, data } = useQuery(GET_TOUR_DETAIL, {
    variables: { id },
    client: tourService,
    errorPolicy: "all",
    onError: (error) => {
      console.error("Tour detail query error:", error);
    },
  });

  const tour = data?.getTourPackage;

  // Format currency
  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
                  label={tour.isAvailable ? "Available" : "Sold Out"}
                  color={tour.isAvailable ? "success" : "error"}
                  sx={{ fontWeight: 600 }}
                />
              </Box>

              {/* Action Buttons */}
              <Box
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  display: "flex",
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    minWidth: "auto",
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  <Share />
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    minWidth: "auto",
                    bgcolor: "rgba(255, 255, 255, 0.9)",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: "rgba(255, 255, 255, 1)",
                    },
                  }}
                >
                  <Favorite />
                </Button>
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
                <Tab label="Reviews" />
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
                      <Typography variant="body1">
                        Max {tour.maxParticipants} participants
                      </Typography>
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

            {/* Reviews Tab */}
            <CustomTabPanel value={selectedTab} index={3}>
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Reviews Coming Soon
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Customer reviews will be available once this feature is
                  implemented.
                </Typography>
              </Box>
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

              {/* Key Features */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Tour Highlights
                </Typography>
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Schedule sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${tour.duration.days} days journey`}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <People sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Small group (max ${tour.maxParticipants})`}
                      primaryTypographyProps={{ variant: "body2" }}
                    />
                  </ListItem>
                  {tour.hotelRequired && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Hotel sx={{ fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Accommodation included"
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  )}
                  {tour.transportRequired && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <FlightTakeoff sx={{ fontSize: 16 }} />
                      </ListItemIcon>
                      <ListItemText
                        primary="Transportation included"
                        primaryTypographyProps={{ variant: "body2" }}
                      />
                    </ListItem>
                  )}
                </List>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* Availability Status */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Availability
                </Typography>
                {tour.isAvailable ? (
                  <Chip
                    label="Available Now"
                    color="success"
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Chip
                    label="Currently Sold Out"
                    color="error"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<BookOnline />}
                  onClick={() => navigate(`/booking/${tour.id}`)}
                  disabled={!tour.isAvailable}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: 2,
                  }}
                >
                  Book Now
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
