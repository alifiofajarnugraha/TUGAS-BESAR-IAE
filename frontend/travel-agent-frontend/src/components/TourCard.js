import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import { LocationOn, Schedule, People } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

function TourCard({ tour }) {
  const navigate = useNavigate();

  const formatPrice = (amount, currency) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: currency || "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
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
          transform: "translateY(-4px)",
          boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={
            tour.images?.[0] ||
            "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400"
          }
          alt={tour.name}
        />
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
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {tour.name}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, lineHeight: 1.5 }}
        >
          {tour.shortDescription}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <LocationOn sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {tour.location.city}, {tour.location.province}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
            <Schedule sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {tour.duration.days}D{tour.duration.nights}N
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center" }}>
            <People sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Small group tour
            </Typography>
          </Box>
        </Box>

        <Typography
          variant="h6"
          sx={{ fontWeight: 700, color: "primary.main" }}
        >
          {formatPrice(tour.price.amount, tour.price.currency)}
        </Typography>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={() => navigate(`/tours/${tour.id}`)}
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          View Details
        </Button>
      </CardActions>
    </Card>
  );
}

export default TourCard;
