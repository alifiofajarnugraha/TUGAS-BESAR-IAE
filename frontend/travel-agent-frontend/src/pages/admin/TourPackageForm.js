import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  MenuItem,
  IconButton,
  Card,
  CardMedia,
  CardActions,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import LinkIcon from "@mui/icons-material/Link";
import { useMutation, useQuery } from "@apollo/client";
import { MUTATIONS, QUERIES, tourService } from "../../services/api";

const categories = [
  "Adventure",
  "Cultural",
  "Beach",
  "Mountain",
  "City Tour",
  "Nature",
  "Historical",
];

const currencies = ["IDR", "USD", "EUR"];

function TourPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    shortDescription: "",
    longDescription: "",
    location: {
      city: "",
      province: "",
      country: "",
      meetingPoint: "",
    },
    duration: {
      days: 1, // Number, bukan string
      nights: 0, // Number, bukan string
    },
    price: {
      amount: 0, // Number, bukan string
      currency: "IDR",
    },
    maxParticipants: 10, // Number, bukan string
    inclusions: [""],
    exclusions: [""],
    itinerary: [
      {
        day: 1, // Number, bukan string
        title: "",
        description: "",
        activities: [""],
      },
    ],
    images: [],
    status: "active",
  });

  const [error, setError] = useState("");

  const { loading: tourLoading } = useQuery(QUERIES.GET_TOUR_PACKAGE, {
    variables: { id },
    skip: !isEdit,
    client: tourService,
    onCompleted: (data) => {
      if (data?.getTourPackage) {
        // Ensure all required fields exist in the data with correct types
        const tourData = {
          ...formData,
          ...data.getTourPackage,
          // Ensure numeric fields are numbers
          price: {
            ...data.getTourPackage.price,
            amount: parseFloat(data.getTourPackage.price.amount) || 0,
          },
          duration: {
            days: parseInt(data.getTourPackage.duration.days, 10) || 1,
            nights: parseInt(data.getTourPackage.duration.nights, 10) || 0,
          },
          maxParticipants:
            parseInt(data.getTourPackage.maxParticipants, 10) || 1,
          // Make sure arrays are mutable copies
          inclusions: data.getTourPackage.inclusions
            ? [...data.getTourPackage.inclusions]
            : [""],
          exclusions: data.getTourPackage.exclusions
            ? [...data.getTourPackage.exclusions]
            : [""],
          itinerary: data.getTourPackage.itinerary?.map((day) => ({
            ...day,
            day: parseInt(day.day, 10),
            // Create mutable copy of activities array
            activities: day.activities ? [...day.activities] : [""],
          })) || [
            {
              day: 1,
              title: "",
              description: "",
              activities: [""],
            },
          ],
        };
        setFormData(tourData);
      }
    },
  });

  const [saveTourPackage, { loading: saveLoading }] = useMutation(
    isEdit ? MUTATIONS.UPDATE_TOUR_PACKAGE : MUTATIONS.CREATE_TOUR_PACKAGE,
    {
      client: tourService,
      onCompleted: () => {
        navigate("/admin/tour-packages");
      },
      onError: (error) => {
        setError(error.message);
      },
    }
  );

  const handleNestedChange = (e) => {
    const { name, value } = e.target;
    const [parent, child] = name.split(".");

    // Convert numeric fields to numbers
    let convertedValue = value;
    if (
      (parent === "price" && child === "amount") ||
      (parent === "duration" && (child === "days" || child === "nights"))
    ) {
      convertedValue = value === "" ? 0 : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [child]: convertedValue,
      },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert numeric fields to numbers
    let convertedValue = value;
    if (name === "maxParticipants") {
      convertedValue = value === "" ? 0 : parseInt(value, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: convertedValue,
    }));
  };

  const validateAndFormatData = (data) => {
    // Ekstrak hanya field yang dibutuhkan untuk input
    const cleanData = {
      name: data.name,
      category: data.category,
      shortDescription: data.shortDescription,
      longDescription: data.longDescription,
      location: {
        city: data.location.city,
        province: data.location.province,
        country: data.location.country,
        meetingPoint: data.location.meetingPoint,
      },
      duration: {
        days: parseInt(data.duration.days, 10) || 1,
        nights: parseInt(data.duration.nights, 10) || 0,
      },
      price: {
        amount: parseFloat(data.price.amount) || 0,
        currency: data.price.currency,
      },
      maxParticipants: parseInt(data.maxParticipants, 10) || 1,
      // Filter out empty strings from arrays
      inclusions: data.inclusions
        ? data.inclusions.filter((item) => item && item.trim() !== "")
        : [],
      exclusions: data.exclusions
        ? data.exclusions.filter((item) => item && item.trim() !== "")
        : [],
      itinerary: data.itinerary
        ? data.itinerary.map((day) => ({
            day: parseInt(day.day, 10),
            title: day.title || "",
            description: day.description || "",
            activities: day.activities
              ? day.activities.filter(
                  (activity) => activity && activity.trim() !== ""
                )
              : [],
          }))
        : [],
      images: data.images || [],
      status: data.status || "active",
    };

    return cleanData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate and format data before sending
      const formattedData = validateAndFormatData(formData);

      console.log("Submitting data:", formattedData); // Debug log

      await saveTourPackage({
        variables: {
          ...(isEdit && { id }),
          input: formattedData,
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
    }
  };

  // Tambahkan helper function di awal component:
  const ensureMutableArray = (arr) => {
    if (!arr) return [""];
    if (Array.isArray(arr)) {
      try {
        return [...arr]; // Create mutable copy
      } catch (error) {
        console.warn("Array copy failed, creating new array:", error);
        return [""];
      }
    }
    return [""];
  };

  // Tambahkan handler untuk images setelah function handleChange
  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:");
    if (url && url.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url.trim()],
      }));
    }
  };

  const handleImageRemove = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleImageFileUpload = (event) => {
    const files = Array.from(event.target.files);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, e.target.result],
          }));
        };
        reader.readAsDataURL(file);
      }
    });

    // Reset input
    event.target.value = "";
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {isEdit ? "Edit Tour Package" : "Create Tour Package"}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
              <TextField
                fullWidth
                label="Package Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Short Description"
                name="shortDescription"
                value={formData.shortDescription}
                onChange={handleChange}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Long Description"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleChange}
                sx={{ mb: 2 }}
              />
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="City"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleNestedChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Province"
                    name="location.province"
                    value={formData.location.province}
                    onChange={handleNestedChange}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleNestedChange}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Meeting Point"
                    name="location.meetingPoint"
                    value={formData.location.meetingPoint}
                    onChange={handleNestedChange}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Duration and Price */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Duration and Price
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Days"
                    name="duration.days"
                    value={formData.duration.days}
                    onChange={handleNestedChange}
                    required
                    inputProps={{
                      min: 1,
                      step: "1", // Integer only
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Nights"
                    name="duration.nights"
                    value={formData.duration.nights}
                    onChange={handleNestedChange}
                    required
                    inputProps={{
                      min: 0,
                      step: "1", // Integer only
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price Amount"
                    name="price.amount"
                    value={formData.price.amount}
                    onChange={handleNestedChange}
                    required
                    inputProps={{
                      min: 0,
                      step: "0.01", // Untuk decimal values
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    fullWidth
                    select
                    label="Currency"
                    name="price.currency"
                    value={formData.price.currency}
                    onChange={handleNestedChange}
                    required
                  >
                    {currencies.map((curr) => (
                      <MenuItem key={curr} value={curr}>
                        {curr}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Max Participants"
                    name="maxParticipants"
                    value={formData.maxParticipants}
                    onChange={handleChange}
                    required
                    inputProps={{
                      min: 1,
                      step: "1", // Integer only
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                    <MenuItem value="soldout">Sold Out</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </Grid>

            {/* Inclusions & Exclusions */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Inclusions & Exclusions
              </Typography>

              {/* Inclusions */}
              <Typography variant="subtitle1">Inclusions</Typography>
              {formData.inclusions.map((item, index) => (
                <Box key={index} sx={{ display: "flex", mb: 1 }}>
                  <TextField
                    fullWidth
                    value={item}
                    onChange={(e) => {
                      const newInclusions = [...formData.inclusions];
                      newInclusions[index] = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        inclusions: newInclusions,
                      }));
                    }}
                    placeholder={`Inclusion ${index + 1}`}
                  />
                  <IconButton
                    onClick={() => {
                      const newInclusions = formData.inclusions.filter(
                        (_, i) => i !== index
                      );
                      setFormData((prev) => ({
                        ...prev,
                        inclusions: newInclusions.length ? newInclusions : [""],
                      }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    inclusions: [...prev.inclusions, ""],
                  }));
                }}
                sx={{ mt: 1, mb: 2 }}
              >
                Add Inclusion
              </Button>

              {/* Exclusions */}
              <Typography variant="subtitle1">Exclusions</Typography>
              {formData.exclusions.map((item, index) => (
                <Box key={index} sx={{ display: "flex", mb: 1 }}>
                  <TextField
                    fullWidth
                    value={item}
                    onChange={(e) => {
                      const newExclusions = [...formData.exclusions];
                      newExclusions[index] = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        exclusions: newExclusions,
                      }));
                    }}
                    placeholder={`Exclusion ${index + 1}`}
                  />
                  <IconButton
                    onClick={() => {
                      const newExclusions = formData.exclusions.filter(
                        (_, i) => i !== index
                      );
                      setFormData((prev) => ({
                        ...prev,
                        exclusions: newExclusions.length ? newExclusions : [""],
                      }));
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<AddIcon />}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    exclusions: [...prev.exclusions, ""],
                  }));
                }}
                sx={{ mt: 1 }}
              >
                Add Exclusion
              </Button>
            </Grid>

            {/* Itinerary Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Itinerary
              </Typography>

              {formData.itinerary.map((day, index) => (
                <Paper
                  key={index}
                  sx={{ p: 2, mb: 2, backgroundColor: "#f9f9f9" }}
                >
                  <Typography variant="subtitle1" gutterBottom>
                    Day {day.day}
                  </Typography>

                  <TextField
                    fullWidth
                    label="Title"
                    value={day.title}
                    onChange={(e) => {
                      const newItinerary = [...formData.itinerary];
                      newItinerary[index].title = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        itinerary: newItinerary,
                      }));
                    }}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Description"
                    value={day.description}
                    onChange={(e) => {
                      const newItinerary = [...formData.itinerary];
                      newItinerary[index].description = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        itinerary: newItinerary,
                      }));
                    }}
                    multiline
                    rows={2}
                    sx={{ mb: 2 }}
                  />

                  <Typography variant="subtitle2" gutterBottom>
                    Activities
                  </Typography>
                  {day.activities.map((activity, actIndex) => (
                    <Box key={actIndex} sx={{ display: "flex", mb: 1 }}>
                      <TextField
                        fullWidth
                        value={activity}
                        onChange={(e) => {
                          const newItinerary = formData.itinerary.map(
                            (day, dayIndex) => {
                              if (dayIndex === index) {
                                const newActivities = day.activities.map(
                                  (act, actIdx) =>
                                    actIdx === actIndex ? e.target.value : act
                                );
                                return {
                                  ...day,
                                  activities: newActivities,
                                };
                              }
                              return day;
                            }
                          );

                          setFormData((prev) => ({
                            ...prev,
                            itinerary: newItinerary,
                          }));
                        }}
                        placeholder={`Activity ${actIndex + 1}`}
                      />
                      <IconButton
                        onClick={() => {
                          const newItinerary = formData.itinerary.map(
                            (day, dayIndex) => {
                              if (dayIndex === index) {
                                const newActivities = day.activities.filter(
                                  (_, i) => i !== actIndex
                                );
                                return {
                                  ...day,
                                  activities:
                                    newActivities.length === 0
                                      ? [""]
                                      : newActivities,
                                };
                              }
                              return day;
                            }
                          );

                          setFormData((prev) => ({
                            ...prev,
                            itinerary: newItinerary,
                          }));
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ))}

                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => {
                      const newItinerary = formData.itinerary.map(
                        (day, dayIndex) => {
                          if (dayIndex === index) {
                            return {
                              ...day,
                              // Create new array instead of mutating existing one
                              activities: [...day.activities, ""],
                            };
                          }
                          return day;
                        }
                      );

                      setFormData((prev) => ({
                        ...prev,
                        itinerary: newItinerary,
                      }));
                    }}
                    sx={{ mr: 1 }}
                  >
                    Add Activity
                  </Button>

                  <Box
                    sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}
                  >
                    <Button
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => {
                        if (formData.itinerary.length === 1) {
                          return; // Keep at least one day
                        }
                        const newItinerary = formData.itinerary.filter(
                          (_, i) => i !== index
                        );
                        // Update day numbers for consistency
                        newItinerary.forEach((item, i) => {
                          item.day = i + 1;
                        });
                        setFormData((prev) => ({
                          ...prev,
                          itinerary: newItinerary,
                        }));
                      }}
                      disabled={formData.itinerary.length === 1}
                    >
                      Remove Day
                    </Button>
                  </Box>
                </Paper>
              ))}

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => {
                  const nextDayNumber =
                    formData.itinerary.length > 0
                      ? Math.max(...formData.itinerary.map((day) => day.day)) +
                        1
                      : 1;

                  setFormData((prev) => ({
                    ...prev,
                    itinerary: [
                      ...prev.itinerary,
                      {
                        day: nextDayNumber,
                        title: "",
                        description: "",
                        activities: [""],
                      },
                    ],
                  }));
                }}
                fullWidth
              >
                Add Day to Itinerary
              </Button>
            </Grid>

            {/* Images Section */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Tour Images
              </Typography>

              {/* Image Upload Controls */}
              <Box sx={{ mb: 3 }}>
                <Button
                  variant="outlined"
                  startIcon={<PhotoCameraIcon />}
                  component="label"
                  sx={{ mr: 2, mb: 1 }}
                >
                  Upload Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageFileUpload}
                  />
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<LinkIcon />}
                  onClick={handleImageUrlAdd}
                  sx={{ mb: 1 }}
                >
                  Add Image URL
                </Button>

                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  You can upload image files or add image URLs. Supported
                  formats: JPG, PNG, GIF, WebP
                </Typography>
              </Box>

              {/* Image Preview Grid */}
              {formData.images.length > 0 ? (
                <Grid container spacing={2}>
                  {formData.images.map((image, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={image}
                          alt={`Tour image ${index + 1}`}
                          sx={{ objectFit: "cover" }}
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300x200?text=Image+Not+Found";
                          }}
                        />
                        <CardActions
                          sx={{ justifyContent: "space-between", p: 1 }}
                        >
                          <Chip
                            label={`Image ${index + 1}`}
                            size="small"
                            color="primary"
                          />
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleImageRemove(index)}
                            sx={{
                              backgroundColor: "rgba(255, 255, 255, 0.8)",
                              "&:hover": {
                                backgroundColor: "rgba(255, 255, 255, 0.9)",
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: "center",
                    border: "2px dashed #ccc",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <PhotoCameraIcon
                    sx={{ fontSize: 48, color: "#ccc", mb: 2 }}
                  />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Images Added
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add some beautiful images to showcase your tour package
                  </Typography>
                </Paper>
              )}
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/admin/tour-packages")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saveLoading || tourLoading}
                >
                  {saveLoading
                    ? "Saving..."
                    : isEdit
                    ? "Update Package"
                    : "Create Package"}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export default TourPackageForm;
