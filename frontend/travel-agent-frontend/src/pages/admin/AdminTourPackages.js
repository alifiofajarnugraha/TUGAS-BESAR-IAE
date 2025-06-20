import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  Tooltip,
  Badge,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Inventory2 as InventoryIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as VisibilityIcon,
  TravelExplore as TravelIcon,
  LocationOn,
  Schedule,
  AttachMoney,
  People,
  MoreVert as MoreVertIcon,
  Refresh as RefreshIcon,
  Analytics as AnalyticsIcon,
} from "@mui/icons-material";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { MUTATIONS, tourService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import InventoryManagementModal from "../../components/InventoryManagementModal";

// Enhanced query untuk admin
const GET_ADMIN_TOURS = gql`
  query GetAdminTours {
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
      status
      images
      createdAt
      updatedAt
    }
  }
`;

function AdminTourPackages() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedTour, setSelectedTour] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTourForMenu, setSelectedTourForMenu] = useState(null);

  const { loading, error, data, refetch } = useQuery(GET_ADMIN_TOURS, {
    client: tourService,
    errorPolicy: "all",
    onError: (error) => {
      console.error("Admin query error:", error);
    },
  });

  const [deleteTourPackage] = useMutation(MUTATIONS.DELETE_TOUR_PACKAGE, {
    client: tourService,
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tour package?")) {
      try {
        await deleteTourPackage({
          variables: { id },
        });
      } catch (err) {
        console.error("Delete error:", err);
      }
    }
  };

  const handleMenuClick = (event, tour) => {
    setAnchorEl(event.currentTarget);
    setSelectedTourForMenu(tour);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTourForMenu(null);
  };

  // Filter tours based on search and filters
  const filteredTours =
    data?.getTourPackages?.filter((tour) => {
      const matchesSearch =
        tour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.location?.city?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        filterCategory === "ALL" || tour.category === filterCategory;
      const matchesStatus =
        filterStatus === "ALL" || tour.status === filterStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    }) || [];

  const categories = [
    "ALL",
    "Adventure",
    "Cultural",
    "Beach",
    "Mountain",
    "City Tour",
    "Nature",
    "Historical",
  ];
  const statuses = ["ALL", "active", "inactive", "soldout"];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "default";
      case "soldout":
        return "error";
      default:
        return "default";
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 },
    },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 },
    },
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <CircularProgress size={60} />
          </motion.div>
          <Typography sx={{ mt: 2, fontSize: "1.2rem" }}>
            Loading tour packages...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Alert severity="error" sx={{ mb: 3 }}>
            Error loading tour packages: {error.message}
          </Alert>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => refetch()}
            >
              Retry
            </Button>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Box>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.div variants={itemVariants}>
          <Paper
            sx={{
              p: 4,
              mb: 4,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                  Tour Package Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Manage and organize your tour packages efficiently
                </Typography>
              </Box>
              <Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/admin/tour-packages/create")}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    backdropFilter: "blur(10px)",
                    "&:hover": {
                      bgcolor: "rgba(255,255,255,0.3)",
                    },
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                  }}
                >
                  Create New Package
                </Button>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div variants={itemVariants}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[
              {
                title: "Total Packages",
                value: data?.getTourPackages?.length || 0,
                icon: <TravelIcon sx={{ fontSize: 40 }} />,
                color: "#6366f1",
                bgColor: "rgba(99, 102, 241, 0.1)",
              },
              {
                title: "Active Packages",
                value:
                  data?.getTourPackages?.filter((t) => t.status === "active")
                    .length || 0,
                icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
                color: "#10b981",
                bgColor: "rgba(16, 185, 129, 0.1)",
              },
              {
                title: "Categories",
                value:
                  new Set(data?.getTourPackages?.map((t) => t.category)).size ||
                  0,
                icon: <LocationOn sx={{ fontSize: 40 }} />,
                color: "#f59e0b",
                bgColor: "rgba(245, 158, 11, 0.1)",
              },
              {
                title: "Total Revenue",
                value: "IDR 2.5M",
                icon: <AttachMoney sx={{ fontSize: 40 }} />,
                color: "#ef4444",
                bgColor: "rgba(239, 68, 68, 0.1)",
              },
            ].map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div variants={cardVariants} whileHover="hover">
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Box>
                          <Typography
                            variant="h4"
                            sx={{ fontWeight: 700, color: stat.color }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography variant="body1" color="text.secondary">
                            {stat.title}
                          </Typography>
                        </Box>
                        <Avatar
                          sx={{
                            bgcolor: stat.bgColor,
                            color: stat.color,
                            width: 60,
                            height: 60,
                          }}
                        >
                          {stat.icon}
                        </Avatar>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div variants={itemVariants}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search tours..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => refetch()}
                  sx={{ borderRadius: 2 }}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Tours Grid */}
        <motion.div variants={itemVariants}>
          <AnimatePresence>
            <Grid container spacing={3}>
              {filteredTours.map((tour, index) => (
                <Grid item xs={12} sm={6} lg={4} key={tour.id}>
                  <motion.div
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    whileHover="hover"
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      sx={{
                        height: "100%",
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {/* Tour Image */}
                      <Box sx={{ position: "relative", height: 200 }}>
                        <img
                          src={
                            tour.images?.[0] ||
                            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"
                          }
                          alt={tour.name}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        <Box
                          sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            display: "flex",
                            gap: 1,
                          }}
                        >
                          <Chip
                            label={tour.category}
                            size="small"
                            sx={{
                              bgcolor: "rgba(255,255,255,0.9)",
                              fontWeight: 600,
                            }}
                          />
                          <Chip
                            label={tour.status}
                            size="small"
                            color={getStatusColor(tour.status)}
                            sx={{ fontWeight: 600 }}
                          />
                        </Box>
                        <IconButton
                          sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            bgcolor: "rgba(255,255,255,0.9)",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,1)",
                            },
                          }}
                          onClick={(e) => handleMenuClick(e, tour)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      {/* Tour Content */}
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tour.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mb: 2,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {tour.shortDescription}
                        </Typography>

                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <LocationOn
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {tour.location?.city}, {tour.location?.country}
                          </Typography>
                        </Box>

                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 1 }}
                        >
                          <Schedule
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {tour.duration?.days} days, {tour.duration?.nights}{" "}
                            nights
                          </Typography>
                        </Box>

                        {/* ✅ NEW: Inventory Status Quick View */}
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <InventoryIcon
                            sx={{
                              fontSize: 16,
                              color: "text.secondary",
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            Inventory: Active slots managed
                          </Typography>
                        </Box>

                        <Divider sx={{ mb: 2 }} />

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <Typography
                              variant="h6"
                              color="primary"
                              sx={{ fontWeight: 700 }}
                            >
                              {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: tour.price?.currency || "IDR",
                              }).format(tour.price?.amount || 0)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              per person
                            </Typography>
                          </Box>

                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => navigate(`/tours/${tour.id}`)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit Package">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() =>
                                  navigate(
                                    `/admin/tour-packages/edit/${tour.id}`
                                  )
                                }
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Manage Inventory & Slots">
                              <IconButton
                                size="small"
                                color="secondary"
                                onClick={() => setSelectedTour(tour)}
                                sx={{
                                  bgcolor: "secondary.light",
                                  color: "secondary.dark",
                                  "&:hover": {
                                    bgcolor: "secondary.main",
                                    color: "white",
                                  },
                                }}
                              >
                                <InventoryIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </AnimatePresence>

          {filteredTours.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Paper
                sx={{
                  p: 6,
                  textAlign: "center",
                  borderRadius: 3,
                  border: "2px dashed #e2e8f0",
                }}
              >
                <TravelIcon sx={{ fontSize: 80, color: "#e2e8f0", mb: 2 }} />
                <Typography variant="h5" color="text.secondary" gutterBottom>
                  No tour packages found
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Try adjusting your search criteria or create a new tour
                  package.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate("/admin/tour-packages/create")}
                  sx={{ borderRadius: 2 }}
                >
                  Create Your First Package
                </Button>
              </Paper>
            </motion.div>
          )}
        </motion.div>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: { borderRadius: 2, minWidth: 200 },
          }}
        >
          <MenuItem
            onClick={() => {
              navigate(`/tours/${selectedTourForMenu?.id}`);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              navigate(`/admin/tour-packages/edit/${selectedTourForMenu?.id}`);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Package</ListItemText>
          </MenuItem>
          <MenuItem
            onClick={() => {
              setSelectedTour(selectedTourForMenu);
              handleMenuClose();
            }}
          >
            <ListItemIcon>
              <InventoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Manage Inventory</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              handleDelete(selectedTourForMenu?.id);
              handleMenuClose();
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Package</ListItemText>
          </MenuItem>
        </Menu>

        {/* Inventory Management Modal */}
        {selectedTour && (
          <InventoryManagementModal
            open={!!selectedTour}
            onClose={() => setSelectedTour(null)}
            tour={selectedTour}
          />
        )}
      </motion.div>
    </Container>
  );
}

export default AdminTourPackages;
