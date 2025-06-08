import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Schedule,
  AttachMoney,
  Star,
  CheckCircle,
  Cancel,
  Hotel,
  DirectionsBus,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "./ImageCarousel";

const TourCard = ({ tour }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate(`/book/${tour.id}`);
  };

  // Helper function to get availability status with fallback
  const getAvailabilityStatus = () => {
    // Check if inventory data is available
    if (!tour.inventoryStatus || tour.inventoryStatus.length === 0) {
      // Fallback based on tour status if no inventory data
      if (tour.status === "active") {
        return {
          status: "available",
          label: "Available",
          color: "success",
          icon: <CheckCircle sx={{ fontSize: 16 }} />,
        };
      } else if (tour.status === "inactive") {
        return {
          status: "inactive",
          label: "Inactive",
          color: "default",
          icon: null,
        };
      } else {
        return {
          status: "unknown",
          label: "Check Availability",
          color: "default",
          icon: null,
        };
      }
    }

    const hasAvailableSlots = tour.inventoryStatus.some(
      (inv) => inv.slotsLeft > 0
    );

    if (hasAvailableSlots) {
      return {
        status: "available",
        label: "Available",
        color: "success",
        icon: <CheckCircle sx={{ fontSize: 16 }} />,
      };
    } else {
      return {
        status: "soldout",
        label: "Sold Out",
        color: "error",
        icon: <Cancel sx={{ fontSize: 16 }} />,
      };
    }
  };

  const availabilityInfo = getAvailabilityStatus();

  // Get next available date with slots - with fallback
  const getNextAvailableDate = () => {
    if (!tour.inventoryStatus || tour.inventoryStatus.length === 0) {
      return null;
    }

    const availableDates = tour.inventoryStatus
      .filter((inv) => inv.slotsLeft > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return availableDates.length > 0 ? availableDates[0] : null;
  };

  const nextAvailable = getNextAvailableDate();

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
        borderRadius: 2,
        overflow: "hidden",
        opacity: tour.status === "inactive" ? 0.6 : 1,
      }}
    >
      {/* Image Carousel with Availability Badge */}
      <Box sx={{ position: "relative" }}>
        <ImageCarousel images={tour.images} alt={tour.name} height={220} />

        {/* Availability Badge */}
        <Chip
          icon={availabilityInfo.icon}
          label={availabilityInfo.label}
          color={availabilityInfo.color}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            fontWeight: 600,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Tour Category */}
        {tour.category && (
          <Chip
            label={tour.category}
            size="small"
            color="primary"
            sx={{ mb: 1 }}
          />
        )}

        {/* Tour Name */}
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {tour.name}
        </Typography>

        {/* Short Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {tour.shortDescription}
        </Typography>

        {/* Location */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <LocationOn sx={{ fontSize: 16, color: "grey.600", mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {tour.location.city}, {tour.location.country}
          </Typography>
        </Box>

        {/* Duration */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Schedule sx={{ fontSize: 16, color: "grey.600", mr: 0.5 }} />
          <Typography variant="body2" color="text.secondary">
            {tour.duration.days} Days {tour.duration.nights} Nights
          </Typography>
        </Box>

        {/* Availability Info - Only show if inventory data is available */}
        {nextAvailable && (
          <Box sx={{ mb: 2, p: 1, bgcolor: "success.50", borderRadius: 1 }}>
            <Typography
              variant="caption"
              color="success.main"
              sx={{ fontWeight: 600 }}
            >
              Next Available:{" "}
              {new Date(nextAvailable.date).toLocaleDateString()}
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {nextAvailable.slotsLeft} slots left
              </Typography>
              {nextAvailable.hotelAvailable && (
                <Chip
                  icon={<Hotel sx={{ fontSize: 12 }} />}
                  label="Hotel"
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: "0.65rem" }}
                />
              )}
              {nextAvailable.transportAvailable && (
                <Chip
                  icon={<DirectionsBus sx={{ fontSize: 12 }} />}
                  label="Transport"
                  size="small"
                  variant="outlined"
                  sx={{ height: 16, fontSize: "0.65rem" }}
                />
              )}
            </Box>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Price and Rating */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AttachMoney sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
              {tour.price.currency} {tour.price.amount.toLocaleString()}
            </Typography>
          </Box>

          {/* Rating (if available) */}
          {tour.rating && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Star sx={{ fontSize: 16, color: "orange", mr: 0.5 }} />
              <Typography variant="body2">{tour.rating}/5</Typography>
            </Box>
          )}
        </Box>

        {/* Status */}
        {tour.status && (
          <Chip
            label={tour.status.toUpperCase()}
            size="small"
            color={tour.status === "active" ? "success" : "default"}
            sx={{ mb: 2 }}
          />
        )}

        {/* Book Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleBookNow}
          disabled={
            tour.status === "inactive" || availabilityInfo.status === "soldout"
          }
          sx={{
            mt: "auto",
            fontWeight: 600,
            py: 1,
            borderRadius: 1.5,
            textTransform: "none",
            fontSize: "0.9rem",
          }}
        >
          {availabilityInfo.status === "soldout" ? "Sold Out" : "Book Now"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TourCard;
