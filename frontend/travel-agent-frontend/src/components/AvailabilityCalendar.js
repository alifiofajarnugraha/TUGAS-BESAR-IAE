import React from "react";
import {
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import {
  CalendarToday,
  CheckCircle,
  Cancel,
  Hotel,
  DirectionsBus,
} from "@mui/icons-material";

function AvailabilityCalendar({ inventory, onDateSelect, selectedDate }) {
  const getDateStatus = (date) => {
    const inv = inventory.find((i) => i.date === date);
    if (!inv) return "unavailable";
    if (inv.slotsLeft === 0) return "soldout";
    if (inv.slotsLeft <= 3) return "limited";
    return "available";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "limited":
        return "warning";
      case "soldout":
        return "error";
      default:
        return "default";
    }
  };

  const formatDateRange = () => {
    if (inventory.length === 0) return [];

    const dates = inventory
      .map((inv) => new Date(inv.date))
      .sort((a, b) => a - b);
    const result = [];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const dateStr = date.toISOString().split("T")[0];
      const inv = inventory.find((i) => i.date === dateStr);

      result.push({
        date: dateStr,
        displayDate: date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
        ...inv,
      });
    }

    return result;
  };

  const dateRange = formatDateRange();

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <CalendarToday color="primary" />
        Available Dates
      </Typography>

      {dateRange.length === 0 ? (
        <Typography color="text.secondary">
          No availability information found for this tour.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {dateRange.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                sx={{
                  cursor: item.slotsLeft > 0 ? "pointer" : "not-allowed",
                  opacity: item.slotsLeft > 0 ? 1 : 0.6,
                  border: selectedDate === item.date ? 2 : 1,
                  borderColor:
                    selectedDate === item.date ? "primary.main" : "divider",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    boxShadow: item.slotsLeft > 0 ? 2 : 1,
                    transform: item.slotsLeft > 0 ? "translateY(-2px)" : "none",
                  },
                }}
                onClick={() =>
                  item.slotsLeft > 0 && onDateSelect(new Date(item.date))
                }
              >
                <CardContent sx={{ p: 2, textAlign: "center" }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {item.displayDate}
                  </Typography>

                  <Box sx={{ my: 1 }}>
                    <Chip
                      size="small"
                      label={`${item.slotsLeft} slots`}
                      color={getStatusColor(getDateStatus(item.date))}
                      variant="filled"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                      mt: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      {item.hotelAvailable ? (
                        <Hotel color="success" fontSize="small" />
                      ) : (
                        <Hotel color="error" fontSize="small" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Hotel
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        fontSize: "0.75rem",
                      }}
                    >
                      {item.transportAvailable ? (
                        <DirectionsBus color="success" fontSize="small" />
                      ) : (
                        <DirectionsBus color="error" fontSize="small" />
                      )}
                      <Typography variant="caption" color="text.secondary">
                        Transport
                      </Typography>
                    </Box>
                  </Box>

                  {item.slotsLeft === 0 && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{
                        display: "block",
                        mt: 1,
                        fontWeight: 600,
                      }}
                    >
                      SOLD OUT
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Legend */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          bgcolor: "grey.50",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="subtitle2" gutterBottom>
          Legend:
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label="Available" color="success" size="small" />
            <Typography variant="caption">5+ slots available</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label="Limited" color="warning" size="small" />
            <Typography variant="caption">1-3 slots left</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip label="Sold Out" color="error" size="small" />
            <Typography variant="caption">No slots available</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Hotel color="success" fontSize="small" />
            <Typography variant="caption">Service available</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Hotel color="error" fontSize="small" />
            <Typography variant="caption">Service unavailable</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AvailabilityCalendar;
