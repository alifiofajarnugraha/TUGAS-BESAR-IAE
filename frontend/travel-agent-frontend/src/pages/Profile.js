import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { QUERIES, MUTATIONS, userService } from "../services/api";

function Profile() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { loading, error: queryError } = useQuery(QUERIES.GET_CURRENT_USER, {
    client: userService,
    onError: (error) => {
      console.error("Profile query error:", error);
      setError(error.message);
    },
    onCompleted: (data) => {
      if (data?.getCurrentUser) {
        setFormData({
          name: data.getCurrentUser.name,
          email: data.getCurrentUser.email,
        });
      }
    },
  });

  const [updateProfile, { loading: updateLoading }] = useMutation(
    MUTATIONS.UPDATE_PROFILE,
    {
      client: userService,
      onCompleted: (data) => {
        updateUser(data.updateUserProfile);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditClick = (e) => {
    e.preventDefault(); // Prevent form submission
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return; // Don't submit if not in edit mode

    setError("");
    try {
      await updateProfile({
        variables: {
          id: user.id,
          input: {
            name: formData.name,
            email: formData.email,
          },
        },
      });
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message);
    }
  };

  if (loading) {
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
  }

  if (queryError) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading profile: {queryError.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          {/* Left side - Avatar and basic info */}
          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                margin: "0 auto",
                bgcolor: "primary.main",
                fontSize: "3rem",
              }}
            >
              {user?.name?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {user?.name}
            </Typography>
            <Typography color="textSecondary">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </Typography>
          </Grid>

          {/* Right side - Profile details form */}
          <Grid item xs={12} md={8}>
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              {success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {success}
                </Alert>
              )}

              <TextField
                margin="normal"
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
              <TextField
                margin="normal"
                fullWidth
                id="role"
                label="Role"
                value={user?.role || ""}
                disabled
              />

              <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                {!isEditing ? (
                  <Button
                    variant="contained"
                    onClick={handleEditClick} // Use new handler
                    type="button" // Explicitly set type to button
                    fullWidth
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={updateLoading}
                      sx={{ flex: 1 }}
                    >
                      {updateLoading ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button
                      type="button" // Explicitly set type to button
                      variant="outlined"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                        });
                      }}
                      sx={{ flex: 1 }}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Profile;
