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
import { motion } from "framer-motion";

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

  // ✅ FIXED: Use correct mutation name
  const [updateProfile, { loading: updateLoading }] = useMutation(
    MUTATIONS.UPDATE_USER_PROFILE, // ✅ Changed from UPDATE_PROFILE
    {
      client: userService,
      onCompleted: (data) => {
        updateUser(data.updateUserProfile);
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      },
      onError: (error) => {
        console.error("Update profile error:", error);
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
    setError(""); // Clear errors when starting edit
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEditing) return; // Don't submit if not in edit mode

    setError("");

    // ✅ Enhanced validation
    if (!formData.name.trim()) {
      setError("Name is required");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      await updateProfile({
        variables: {
          id: user.id,
          input: {
            name: formData.name.trim(),
            email: formData.email.trim(),
          },
        },
      });
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess("");
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 2,
              background: "linear-gradient(45deg, #ffffff 30%, #f5f5f5 90%)",
            }}
          >
            <Grid container spacing={4}>
              {/* Left side - Avatar and basic info */}
              <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <Avatar
                    sx={{
                      width: 120,
                      height: 120,
                      margin: "0 auto",
                      bgcolor: "primary.main",
                      fontSize: "3rem",
                      boxShadow: 3,
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Typography variant="h5" sx={{ mt: 2, fontWeight: "bold" }}>
                    {user?.name || "Unknown User"}
                  </Typography>
                  <Typography
                    color="primary"
                    sx={{
                      textTransform: "capitalize",
                      fontWeight: 500,
                    }}
                  >
                    {user?.role || "user"}
                  </Typography>
                </motion.div>
              </Grid>

              {/* Right side - Profile details form */}
              <Grid item xs={12} md={8}>
                <Box component="form" onSubmit={handleSubmit}>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                      </Alert>
                    </motion.div>
                  )}

                  {[
                    {
                      name: "name",
                      label: "Full Name",
                      type: "text",
                      required: true,
                    },
                    {
                      name: "email",
                      label: "Email Address",
                      type: "email",
                      required: true,
                    },
                    {
                      name: "role",
                      label: "Role",
                      disabled: true,
                      value: user?.role,
                    },
                  ].map((field, index) => (
                    <motion.div
                      key={field.name}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <TextField
                        margin="normal"
                        fullWidth
                        id={field.name}
                        label={field.label}
                        name={field.name}
                        type={field.type || "text"}
                        value={field.value || formData[field.name] || ""}
                        onChange={handleChange}
                        disabled={!isEditing || field.disabled}
                        required={field.required && isEditing}
                        error={
                          isEditing &&
                          field.required &&
                          !formData[field.name]?.trim()
                        }
                        helperText={
                          isEditing &&
                          field.required &&
                          !formData[field.name]?.trim()
                            ? `${field.label} is required`
                            : ""
                        }
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-disabled": {
                              backgroundColor: "grey.100",
                            },
                          },
                        }}
                      />
                    </motion.div>
                  ))}

                  <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
                    {!isEditing ? (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{ width: "100%" }}
                      >
                        <Button
                          variant="contained"
                          onClick={handleEditClick}
                          type="button"
                          fullWidth
                          sx={{ height: 48 }}
                        >
                          Edit Profile
                        </Button>
                      </motion.div>
                    ) : (
                      <>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{ flex: 1 }}
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={updateLoading}
                            fullWidth
                            sx={{ height: 48 }}
                          >
                            {updateLoading ? (
                              <>
                                <CircularProgress size={20} sx={{ mr: 1 }} />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          style={{ flex: 1 }}
                        >
                          <Button
                            type="button"
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={updateLoading}
                            fullWidth
                            sx={{ height: 48 }}
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      </>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </motion.div>
      </Container>
    </motion.div>
  );
}

export default Profile;
