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
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Avatar,
  LinearProgress,
  Fade,
  Zoom,
  Slide,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  PhotoCamera as PhotoCameraIcon,
  Link as LinkIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  TravelExplore as TravelIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  List as ListIcon,
  Photo as PhotoIcon,
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Preview as PreviewIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const cardVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
};

const stepIconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    },
  },
};

function TourPackageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [activeStep, setActiveStep] = useState(0);
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
      days: 1,
      nights: 0,
    },
    price: {
      amount: 0,
      currency: "IDR",
    },
    inclusions: [""],
    exclusions: [""],
    itinerary: [
      {
        day: 1,
        title: "",
        description: "",
        activities: [""],
      },
    ],
    images: [],
    status: "active",
  });

  const [error, setError] = useState("");
  const [imageUploadProgress, setImageUploadProgress] = useState(0);

  // Steps configuration
  const steps = [
    {
      label: "Basic Information",
      icon: <TravelIcon />,
      description: "Package name, category and descriptions",
    },
    {
      label: "Location & Details",
      icon: <LocationIcon />,
      description: "Location, duration and pricing",
    },
    {
      label: "Inclusions & Exclusions",
      icon: <ListIcon />,
      description: "What's included and excluded",
    },
    {
      label: "Itinerary",
      icon: <ScheduleIcon />,
      description: "Day by day activities",
    },
    {
      label: "Images",
      icon: <PhotoIcon />,
      description: "Tour photos and gallery",
    },
  ];

  const { loading: tourLoading } = useQuery(QUERIES.GET_TOUR_PACKAGE, {
    variables: { id },
    skip: !isEdit,
    client: tourService,
    onCompleted: (data) => {
      if (data?.getTourPackage) {
        const tourData = {
          ...formData,
          ...data.getTourPackage,
          price: {
            ...data.getTourPackage.price,
            amount: parseFloat(data.getTourPackage.price.amount) || 0,
          },
          duration: {
            days: parseInt(data.getTourPackage.duration.days, 10) || 1,
            nights: parseInt(data.getTourPackage.duration.nights, 10) || 0,
          },
          inclusions: data.getTourPackage.inclusions
            ? [...data.getTourPackage.inclusions]
            : [""],
          exclusions: data.getTourPackage.exclusions
            ? [...data.getTourPackage.exclusions]
            : [""],
          itinerary: data.getTourPackage.itinerary?.map((day) => ({
            ...day,
            day: parseInt(day.day, 10),
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
      const formattedData = validateAndFormatData(formData);
      console.log("Submitting data:", formattedData);

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

    files.forEach((file, fileIndex) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();

        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setImageUploadProgress(progress);
          }
        };

        reader.onload = (e) => {
          setTimeout(() => {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, e.target.result],
            }));
            setImageUploadProgress(0);
          }, 500);
        };

        reader.readAsDataURL(file);
      }
    });

    event.target.value = "";
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const getStepProgress = () => {
    return ((activeStep + 1) / steps.length) * 100;
  };

  // Render step content
  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileFocus={{ scale: 1.01 }}
                >
                  <TextField
                    fullWidth
                    label="Package Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    variant="outlined"
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": {
                          borderColor: "#6366f1",
                        },
                      },
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    select
                    label="Category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                  >
                    {categories.map((cat) => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </TextField>
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Short Description"
                    name="shortDescription"
                    value={formData.shortDescription}
                    onChange={handleChange}
                    required
                    sx={{ mb: 3 }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label="Long Description"
                    name="longDescription"
                    value={formData.longDescription}
                    onChange={handleChange}
                    sx={{ mb: 2 }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={3}>
              {/* Location Section */}
              <Grid item xs={12}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#6366f1", fontWeight: 600 }}
                >
                  <LocationIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Location Details
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} sm={4}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="City"
                    name="location.city"
                    value={formData.location.city}
                    onChange={handleNestedChange}
                    required
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={4}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Province"
                    name="location.province"
                    value={formData.location.province}
                    onChange={handleNestedChange}
                    required
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={4}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Country"
                    name="location.country"
                    value={formData.location.country}
                    onChange={handleNestedChange}
                    required
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    label="Meeting Point"
                    name="location.meetingPoint"
                    value={formData.location.meetingPoint}
                    onChange={handleNestedChange}
                  />
                </motion.div>
              </Grid>

              {/* Duration & Price Section */}
              <Grid item xs={12} sx={{ mt: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ color: "#6366f1", fontWeight: 600 }}
                >
                  <ScheduleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                  Duration & Pricing
                </Typography>
                <Divider sx={{ mb: 3 }} />
              </Grid>

              <Grid item xs={12} sm={3}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Days"
                    name="duration.days"
                    value={formData.duration.days}
                    onChange={handleNestedChange}
                    required
                    inputProps={{ min: 1, step: "1" }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={3}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Nights"
                    name="duration.nights"
                    value={formData.duration.nights}
                    onChange={handleNestedChange}
                    required
                    inputProps={{ min: 0, step: "1" }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={4}>
                <motion.div whileHover={{ scale: 1.01 }}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Price Amount"
                    name="price.amount"
                    value={formData.price.amount}
                    onChange={handleNestedChange}
                    required
                    inputProps={{ min: 0, step: "0.01" }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} sm={2}>
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
            </Grid>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Grid container spacing={4}>
              {/* Inclusions */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "2px solid #e8f5e8",
                    backgroundColor: "#f8fff8",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#10b981", fontWeight: 600 }}
                  >
                    ✅ What's Included
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <AnimatePresence>
                    {formData.inclusions.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Box
                          sx={{ display: "flex", mb: 2, alignItems: "center" }}
                        >
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
                            size="small"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": {
                                  borderColor: "#10b981",
                                },
                              },
                            }}
                          />
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <IconButton
                              onClick={() => {
                                const newInclusions =
                                  formData.inclusions.filter(
                                    (_, i) => i !== index
                                  );
                                setFormData((prev) => ({
                                  ...prev,
                                  inclusions: newInclusions.length
                                    ? newInclusions
                                    : [""],
                                }));
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </motion.div>
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          inclusions: [...prev.inclusions, ""],
                        }));
                      }}
                      variant="outlined"
                      sx={{
                        mt: 1,
                        borderColor: "#10b981",
                        color: "#10b981",
                        "&:hover": {
                          borderColor: "#10b981",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                        },
                      }}
                    >
                      Add Inclusion
                    </Button>
                  </motion.div>
                </Paper>
              </Grid>

              {/* Exclusions */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "2px solid #fee2e2",
                    backgroundColor: "#fef2f2",
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#ef4444", fontWeight: 600 }}
                  >
                    ❌ What's Not Included
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <AnimatePresence>
                    {formData.exclusions.map((item, index) => (
                      <motion.div
                        key={index}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                      >
                        <Box
                          sx={{ display: "flex", mb: 2, alignItems: "center" }}
                        >
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
                            size="small"
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": {
                                  borderColor: "#ef4444",
                                },
                              },
                            }}
                          />
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <IconButton
                              onClick={() => {
                                const newExclusions =
                                  formData.exclusions.filter(
                                    (_, i) => i !== index
                                  );
                                setFormData((prev) => ({
                                  ...prev,
                                  exclusions: newExclusions.length
                                    ? newExclusions
                                    : [""],
                                }));
                              }}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </motion.div>
                        </Box>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          exclusions: [...prev.exclusions, ""],
                        }));
                      }}
                      variant="outlined"
                      sx={{
                        mt: 1,
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        "&:hover": {
                          borderColor: "#ef4444",
                          backgroundColor: "rgba(239, 68, 68, 0.1)",
                        },
                      }}
                    >
                      Add Exclusion
                    </Button>
                  </motion.div>
                </Paper>
              </Grid>
            </Grid>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#6366f1", fontWeight: 600, mb: 3 }}
              >
                📅 Daily Itinerary
              </Typography>

              <AnimatePresence>
                {formData.itinerary.map((day, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                  >
                    <Paper
                      elevation={3}
                      sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 3,
                        background:
                          "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                        border: "1px solid #e2e8f0",
                        position: "relative",
                        overflow: "hidden",
                        "&::before": {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "4px",
                          height: "100%",
                          background:
                            "linear-gradient(to bottom, #6366f1, #8b5cf6)",
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 3 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "#6366f1",
                            mr: 2,
                            width: 40,
                            height: 40,
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                          }}
                        >
                          {day.day}
                        </Avatar>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Day {day.day}
                        </Typography>
                      </Box>

                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <TextField
                              fullWidth
                              label="Day Title"
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
                          </motion.div>
                        </Grid>

                        <Grid item xs={12}>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <TextField
                              fullWidth
                              label="Description"
                              value={day.description}
                              onChange={(e) => {
                                const newItinerary = [...formData.itinerary];
                                newItinerary[index].description =
                                  e.target.value;
                                setFormData((prev) => ({
                                  ...prev,
                                  itinerary: newItinerary,
                                }));
                              }}
                              multiline
                              rows={3}
                              sx={{ mb: 3 }}
                            />
                          </motion.div>
                        </Grid>

                        <Grid item xs={12}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600, mb: 2, color: "#374151" }}
                          >
                            🎯 Activities
                          </Typography>

                          <AnimatePresence>
                            {day.activities.map((activity, actIndex) => (
                              <motion.div
                                key={actIndex}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                layout
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    mb: 2,
                                    alignItems: "center",
                                  }}
                                >
                                  <TextField
                                    fullWidth
                                    value={activity}
                                    onChange={(e) => {
                                      const newItinerary =
                                        formData.itinerary.map(
                                          (day, dayIndex) => {
                                            if (dayIndex === index) {
                                              const newActivities =
                                                day.activities.map(
                                                  (act, actIdx) =>
                                                    actIdx === actIndex
                                                      ? e.target.value
                                                      : act
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
                                    size="small"
                                  />
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <IconButton
                                      onClick={() => {
                                        const newItinerary =
                                          formData.itinerary.map(
                                            (day, dayIndex) => {
                                              if (dayIndex === index) {
                                                const newActivities =
                                                  day.activities.filter(
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
                                      color="error"
                                      size="small"
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </motion.div>
                                </Box>
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  const newItinerary = formData.itinerary.map(
                                    (day, dayIndex) => {
                                      if (dayIndex === index) {
                                        return {
                                          ...day,
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
                                variant="outlined"
                                size="small"
                                sx={{
                                  borderColor: "#6366f1",
                                  color: "#6366f1",
                                }}
                              >
                                Add Activity
                              </Button>
                            </motion.div>

                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Button
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => {
                                  if (formData.itinerary.length === 1) {
                                    return;
                                  }
                                  const newItinerary =
                                    formData.itinerary.filter(
                                      (_, i) => i !== index
                                    );
                                  newItinerary.forEach((item, i) => {
                                    item.day = i + 1;
                                  });
                                  setFormData((prev) => ({
                                    ...prev,
                                    itinerary: newItinerary,
                                  }));
                                }}
                                disabled={formData.itinerary.length === 1}
                                variant="outlined"
                                size="small"
                              >
                                Remove Day
                              </Button>
                            </motion.div>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </motion.div>
                ))}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const nextDayNumber =
                      formData.itinerary.length > 0
                        ? Math.max(
                            ...formData.itinerary.map((day) => day.day)
                          ) + 1
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
                  sx={{
                    py: 1.5,
                    borderRadius: 3,
                    background:
                      "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
                    boxShadow: "0 3px 15px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  Add New Day
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
          >
            <Box>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ color: "#6366f1", fontWeight: 600, mb: 3 }}
              >
                📸 Tour Gallery
              </Typography>

              {/* Upload Controls */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 4,
                  borderRadius: 3,
                  background:
                    "linear-gradient(145deg, #f8fafc 0%, #ffffff 100%)",
                }}
              >
                <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<PhotoCameraIcon />}
                      component="label"
                      sx={{
                        background:
                          "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
                        borderRadius: 2,
                      }}
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
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="outlined"
                      startIcon={<LinkIcon />}
                      onClick={handleImageUrlAdd}
                      sx={{ borderRadius: 2 }}
                    >
                      Add Image URL
                    </Button>
                  </motion.div>
                </Box>

                {imageUploadProgress > 0 && (
                  <Box sx={{ width: "100%", mb: 2 }}>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Uploading... {imageUploadProgress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={imageUploadProgress}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                )}

                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  Upload high-quality images to showcase your tour. Supported
                  formats: JPG, PNG, GIF, WebP
                </Typography>
              </Paper>

              {/* Image Gallery */}
              {formData.images.length > 0 ? (
                <Grid container spacing={3}>
                  <AnimatePresence>
                    {formData.images.map((image, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <motion.div
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          layout
                          whileHover={{ scale: 1.05 }}
                        >
                          <Card
                            sx={{
                              position: "relative",
                              borderRadius: 3,
                              overflow: "hidden",
                              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                              "&:hover": {
                                boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
                              },
                              transition: "all 0.3s ease",
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="200"
                              image={image}
                              alt={`Tour image ${index + 1}`}
                              sx={{
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                                "&:hover": {
                                  transform: "scale(1.1)",
                                },
                              }}
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/300x200?text=Image+Not+Found";
                              }}
                            />
                            <CardActions
                              sx={{
                                justifyContent: "space-between",
                                p: 2,
                                background: "rgba(255, 255, 255, 0.95)",
                                backdropFilter: "blur(10px)",
                              }}
                            >
                              <Chip
                                label={`Image ${index + 1}`}
                                size="small"
                                color="primary"
                                sx={{ fontWeight: 600 }}
                              />
                              <motion.div
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleImageRemove(index)}
                                  sx={{
                                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                                    "&:hover": {
                                      backgroundColor: "rgba(239, 68, 68, 0.2)",
                                    },
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </motion.div>
                            </CardActions>
                          </Card>
                        </motion.div>
                      </Grid>
                    ))}
                  </AnimatePresence>
                </Grid>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 8,
                      textAlign: "center",
                      border: "3px dashed #d1d5db",
                      borderRadius: 4,
                      background:
                        "linear-gradient(145deg, #f9fafb 0%, #ffffff 100%)",
                    }}
                  >
                    <motion.div
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <PhotoCameraIcon
                        sx={{ fontSize: 64, color: "#d1d5db", mb: 2 }}
                      />
                    </motion.div>
                    <Typography
                      variant="h5"
                      color="text.secondary"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      No Images Added Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      Upload beautiful images to showcase your amazing tour
                      package
                    </Typography>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<PhotoCameraIcon />}
                        component="label"
                        sx={{
                          background:
                            "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                        }}
                      >
                        Upload Your First Image
                        <input
                          type="file"
                          hidden
                          multiple
                          accept="image/*"
                          onChange={handleImageFileUpload}
                        />
                      </Button>
                    </motion.div>
                  </Paper>
                </motion.div>
              )}
            </Box>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
        {/* Header */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              },
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: -30,
                left: -30,
                width: 60,
                height: 60,
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
              },
            }}
          >
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.2)",
                    mr: 2,
                    width: 56,
                    height: 56,
                  }}
                >
                  {isEdit ? <EditIcon /> : <TravelIcon />}
                </Avatar>
                <Box>
                  <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
                    {isEdit ? "Edit Tour Package" : "Create New Tour Package"}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    {isEdit
                      ? "Update your existing tour package"
                      : "Build an amazing travel experience"}
                  </Typography>
                </Box>
              </Box>

              {/* Progress Bar */}
              <Box sx={{ mt: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Progress
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {Math.round(getStepProgress())}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={getStepProgress()}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                      backgroundColor: "white",
                    },
                  }}
                />
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            variants={itemVariants}
          >
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 3,
                "& .MuiAlert-icon": {
                  fontSize: 24,
                },
              }}
              onClose={() => setError("")}
            >
              {error}
            </Alert>
          </motion.div>
        )}

        {/* Main Form */}
        <motion.div variants={itemVariants}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
            }}
          >
            <Box component="form" onSubmit={handleSubmit}>
              {/* Stepper */}
              <Box sx={{ p: 4, borderBottom: "1px solid #e2e8f0" }}>
                <Stepper
                  activeStep={activeStep}
                  orientation="horizontal"
                  alternativeLabel
                >
                  {steps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel
                        StepIconComponent={({ active, completed }) => (
                          <motion.div
                            variants={stepIconVariants}
                            initial="hidden"
                            animate={active || completed ? "visible" : "hidden"}
                          >
                            <Avatar
                              sx={{
                                bgcolor:
                                  active || completed ? "#6366f1" : "#e2e8f0",
                                color:
                                  active || completed ? "white" : "#9ca3af",
                                width: 48,
                                height: 48,
                                fontSize: "1.2rem",
                                transition: "all 0.3s ease",
                              }}
                            >
                              {completed ? <CheckIcon /> : step.icon}
                            </Avatar>
                          </motion.div>
                        )}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: activeStep === index ? 600 : 400,
                            color:
                              activeStep === index
                                ? "#6366f1"
                                : "text.secondary",
                          }}
                        >
                          {step.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {step.description}
                        </Typography>
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Step Content */}
              <Box sx={{ p: 4 }}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent(activeStep)}
                  </motion.div>
                </AnimatePresence>
              </Box>

              {/* Navigation Buttons */}
              <Box
                sx={{
                  p: 4,
                  borderTop: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outlined"
                        startIcon={<CancelIcon />}
                        onClick={() => navigate("/admin/tour-packages")}
                        sx={{ borderRadius: 2 }}
                      >
                        Cancel
                      </Button>
                    </motion.div>

                    {activeStep > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outlined"
                          onClick={handleBack}
                          sx={{ borderRadius: 2 }}
                        >
                          Back
                        </Button>
                      </motion.div>
                    )}
                  </Box>

                  <Box sx={{ display: "flex", gap: 2 }}>
                    {activeStep < steps.length - 1 ? (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          sx={{
                            borderRadius: 2,
                            background:
                              "linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)",
                            px: 4,
                          }}
                        >
                          Next
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={saveLoading || tourLoading}
                          startIcon={saveLoading ? null : <SaveIcon />}
                          sx={{
                            borderRadius: 2,
                            background: saveLoading
                              ? "#d1d5db"
                              : "linear-gradient(45deg, #10b981 30%, #059669 90%)",
                            px: 4,
                            py: 1.5,
                            fontSize: "1.1rem",
                            fontWeight: 600,
                          }}
                        >
                          {saveLoading
                            ? "Saving..."
                            : isEdit
                            ? "Update Package"
                            : "Create Package"}
                        </Button>
                      </motion.div>
                    )}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>
      </Container>
    </motion.div>
  );
}

export default TourPackageForm;
