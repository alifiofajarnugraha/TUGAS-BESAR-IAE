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
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import InventoryIcon from "@mui/icons-material/Inventory2";
import { useQuery, useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { MUTATIONS, tourService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import InventoryManagementModal from "../../components/InventoryManagementModal"; // Buat komponen ini di langkah 2

// Simple query untuk admin
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
      createdAt
      updatedAt
    }
  }
`;

function AdminTourPackages() {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery(GET_ADMIN_TOURS, {
    client: tourService,
    errorPolicy: "all", // Show partial data even with errors
    onError: (error) => {
      console.error("Admin query error:", error);
    },
  });

  const [deleteTourPackage] = useMutation(MUTATIONS.DELETE_TOUR_PACKAGE, {
    client: tourService,
    onCompleted: () => {
      refetch(); // Refresh the list after deletion
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

  const [selectedTour, setSelectedTour] = useState(null);

  // Define the handleDelete function
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

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading tour packages...</Typography>
      </Box>
    );

  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading tour packages: {error.message}
        </Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="outlined" onClick={() => refetch()}>
            Retry
          </Button>
          <Button
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => window.location.reload()}
          >
            Reload Page
          </Button>
        </Box>
      </Container>
    );

  // Debug log
  console.log("Admin tours data:", data);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4">Tour Package Management</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate("/admin/tour-packages/create")}
        >
          Create New Package
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.getTourPackages?.map((tour) => (
              <TableRow key={tour.id || Math.random()}>
                <TableCell>{tour.name || "Unknown"}</TableCell>
                <TableCell>{tour.category || "Unknown"}</TableCell>
                <TableCell>
                  {tour.location
                    ? `${tour.location.city || "Unknown"}, ${
                        tour.location.country || "Unknown"
                      }`
                    : "Unknown Location"}
                </TableCell>
                <TableCell>
                  {tour.price
                    ? `${tour.price.currency || "IDR"} ${
                        tour.price.amount || 0
                      }`
                    : "No Price"}
                </TableCell>
                <TableCell>{tour.status || "Unknown"}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      navigate(`/admin/tour-packages/edit/${tour.id}`)
                    }
                    disabled={!tour.id}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleDelete(tour.id)}
                    disabled={!tour.id}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setSelectedTour(tour)}
                    disabled={!tour.id}
                    title="Manage Inventory"
                  >
                    <InventoryIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {(!data?.getTourPackages || data.getTourPackages.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No tour packages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Inventory Management Modal */}
      {selectedTour && (
        <InventoryManagementModal
          open={!!selectedTour}
          onClose={() => setSelectedTour(null)}
          tour={selectedTour}
        />
      )}
    </Container>
  );
}

export default AdminTourPackages;
