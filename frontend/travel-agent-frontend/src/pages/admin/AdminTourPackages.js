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
import { useQuery, useMutation } from "@apollo/client";
import { QUERIES, MUTATIONS, tourService } from "../../services/api";
import { useNavigate } from "react-router-dom";

function AdminTourPackages() {
  const navigate = useNavigate();
  const { loading, error, data, refetch } = useQuery(
    QUERIES.GET_TOUR_PACKAGES,
    {
      client: tourService,
    }
  );

  const [deleteTourPackage] = useMutation(MUTATIONS.DELETE_TOUR_PACKAGE, {
    client: tourService,
    onCompleted: () => {
      refetch(); // Refresh the list after deletion
    },
    onError: (error) => {
      console.error("Delete error:", error);
    },
  });

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
      </Box>
    );

  if (error)
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading tour packages: {error.message}
        </Alert>
      </Container>
    );

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
              <TableRow key={tour.id}>
                <TableCell>{tour.name}</TableCell>
                <TableCell>{tour.category}</TableCell>
                <TableCell>{`${tour.location.city}, ${tour.location.country}`}</TableCell>
                <TableCell>{`${tour.price.currency} ${tour.price.amount}`}</TableCell>
                <TableCell>{tour.status}</TableCell>
                <TableCell>
                  <IconButton
                    onClick={() =>
                      navigate(`/admin/tour-packages/edit/${tour.id}`)
                    }
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(tour.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {data?.getTourPackages?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No tour packages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}

export default AdminTourPackages;
