import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@apollo/client";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
  Paper,
  Avatar,
  Rating,
  TextField,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import {
  LocationOn,
  Star,
  Phone,
  Email,
  Facebook,
  Instagram,
  YouTube,
  MusicNote,
  Schedule,
  AttachMoney,
  Groups,
  Verified,
  Support,
  Security,
  TravelExplore,
  Send,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { tourService, QUERIES } from "../services/api";

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  // Fetch tour packages
  const {
    data: toursData,
    loading,
    error,
  } = useQuery(QUERIES.GET_TOUR_PACKAGES, {
    client: tourService,
    fetchPolicy: "cache-first",
    errorPolicy: "all",
  });

  const tours = toursData?.getTourPackages?.slice(0, 6) || [];

  // Indonesian popular destinations
  const popularDestinations = [
    {
      name: "Bali",
      image:
        "https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400",
      description: "Pulau Dewata dengan pantai eksotis",
    },
    {
      name: "Yogyakarta",
      image: "https://images.unsplash.com/photo-1555400156-b321a3152a97?w=400",
      description: "Kota budaya dan sejarah Indonesia",
    },
    {
      name: "Raja Ampat",
      image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400",
      description: "Surga diving di Papua Barat",
    },
    {
      name: "Bromo Tengger",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      description: "Gunung berapi ikonik Jawa Timur",
    },
    {
      name: "Komodo",
      image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400",
      description: "Rumah naga komodo di NTT",
    },
    {
      name: "Toba",
      image:
        "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400",
      description: "Danau vulkanik terbesar di dunia",
    },
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100",
      rating: 5,
      comment:
        "Pengalaman yang luar biasa! Guide sangat profesional dan itinerary sangat well-planned.",
      tour: "Paket Bali 4D3N",
    },
    {
      name: "Michael Chen",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 5,
      comment:
        "Trip ke Yogyakarta sangat berkesan. Pelayanan memuaskan dari awal hingga akhir.",
      tour: "Yogya Heritage Tour",
    },
    {
      name: "Amanda Rica",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      rating: 5,
      comment:
        "Diving di Raja Ampat adalah pengalaman sekali seumur hidup. Highly recommended!",
      tour: "Raja Ampat Adventure",
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  return (
    <Box sx={{ bgcolor: "background.default" }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          height: "100vh",
          background:
            'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920") center/cover',
          display: "flex",
          alignItems: "center",
          color: "white",
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                fontWeight: 700,
                mb: 2,
                textAlign: "center",
              }}
            >
              5 Hari 4 Malam Menelusuri Keindahan Vietnam
            </Typography>
            <Typography
              variant="h5"
              sx={{
                mb: 4,
                textAlign: "center",
                maxWidth: "800px",
                mx: "auto",
                opacity: 0.9,
              }}
            >
              Dalam trip ini kamu akan diajak menyaksikan panorama menakjubkan
              dari Ba Na Hills dan Golden Bridge, menyekami sejarah di Imperial
              Citadel, hingga menikmati romantisme kota tua Hoi An yang dijuluki
              "The Venice of Vietnam"
            </Typography>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Mulai Dari
              </Typography>
              <Typography
                variant="h3"
                sx={{ fontWeight: 700, color: "#ffd700" }}
              >
                IDR 9.400.000
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: "#6366f1",
                    px: 6,
                    py: 2,
                    fontSize: "1.2rem",
                    borderRadius: 3,
                    "&:hover": {
                      bgcolor: "#5855eb",
                    },
                  }}
                  onClick={() => navigate("/tours")}
                >
                  Jelajahi Sekarang
                </Button>
              </motion.div>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Popular Destinations Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 2,
              fontWeight: 700,
              color: "#1a202c",
            }}
          >
            Destinasi Populer Indonesia
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              mb: 6,
              color: "text.secondary",
            }}
          >
            Jelajahi keindahan nusantara dengan paket wisata terbaik
          </Typography>

          <Grid container spacing={3}>
            {popularDestinations.map((destination, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Card
                    sx={{
                      position: "relative",
                      height: 300,
                      borderRadius: 3,
                      overflow: "hidden",
                      cursor: "pointer",
                      "&:hover .overlay": {
                        opacity: 1,
                      },
                      "&:hover img": {
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="100%"
                      image={destination.image}
                      alt={destination.name}
                      sx={{
                        transition: "transform 0.5s ease",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      className="overlay"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-end",
                        p: 3,
                        color: "white",
                        opacity: 0.8,
                        transition: "opacity 0.3s ease",
                      }}
                    >
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {destination.name}
                      </Typography>
                      <Typography variant="body1">
                        {destination.description}
                      </Typography>
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Tour Packages Section */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
                color: "#1a202c",
              }}
            >
              Paket Tour Terpopuler
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mb: 6,
                color: "text.secondary",
              }}
            >
              Pilihan terbaik untuk liburan tak terlupakan
            </Typography>

            {loading ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography>Loading tour packages...</Typography>
              </Box>
            ) : (
              <Grid container spacing={4}>
                {tours.map((tour, index) => (
                  <Grid item xs={12} sm={6} md={4} key={tour.id || index}>
                    <motion.div variants={itemVariants}>
                      <Card
                        sx={{
                          height: "100%",
                          borderRadius: 3,
                          overflow: "hidden",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                          },
                        }}
                      >
                        <CardMedia
                          component="img"
                          height="200"
                          image={
                            tour.images?.[0] ||
                            "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400"
                          }
                          alt={tour.name}
                        />
                        <CardContent sx={{ p: 3 }}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              mb: 2,
                            }}
                          >
                            <Chip
                              label={tour.category || "Adventure"}
                              size="small"
                              sx={{ bgcolor: "#6366f1", color: "white" }}
                            />
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <Star
                                sx={{ color: "#ffc107", fontSize: 16, mr: 0.5 }}
                              />
                              <Typography variant="body2">4.8</Typography>
                            </Box>
                          </Box>

                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 1 }}
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
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <LocationOn
                              sx={{
                                fontSize: 16,
                                color: "text.secondary",
                                mr: 0.5,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {tour.location?.city}, {tour.location?.country}
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Schedule
                              sx={{
                                fontSize: 16,
                                color: "text.secondary",
                                mr: 0.5,
                              }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {tour.duration?.days} Hari {tour.duration?.nights}{" "}
                              Malam
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 2 }} />

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
                            <Button
                              variant="contained"
                              size="small"
                              sx={{
                                bgcolor: "#6366f1",
                                "&:hover": { bgcolor: "#5855eb" },
                              }}
                              onClick={() => navigate(`/book/${tour.id}`)}
                            >
                              Book Now
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            )}

            <Box sx={{ textAlign: "center", mt: 6 }}>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/tours")}
                sx={{
                  px: 4,
                  py: 1.5,
                  borderColor: "#6366f1",
                  color: "#6366f1",
                  "&:hover": {
                    borderColor: "#5855eb",
                    color: "#5855eb",
                  },
                }}
              >
                Lihat Semua Paket Tour
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* Why Choose Us Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Typography
            variant="h3"
            sx={{
              textAlign: "center",
              mb: 2,
              fontWeight: 700,
              color: "#1a202c",
            }}
          >
            Mengapa Memilih Kami?
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: "center",
              mb: 6,
              color: "text.secondary",
            }}
          >
            Pengalaman terbaik untuk perjalanan impian Anda
          </Typography>

          <Grid container spacing={4}>
            {[
              {
                icon: <Verified sx={{ fontSize: 60, color: "#6366f1" }} />,
                title: "Terpercaya & Berpengalaman",
                description:
                  "Lebih dari 10 tahun pengalaman melayani wisatawan dengan kepuasan 98%",
              },
              {
                icon: <AttachMoney sx={{ fontSize: 60, color: "#10b981" }} />,
                title: "Harga Terbaik",
                description:
                  "Jaminan harga terbaik dengan kualitas pelayanan premium",
              },
              {
                icon: <Support sx={{ fontSize: 60, color: "#f59e0b" }} />,
                title: "24/7 Customer Support",
                description:
                  "Tim support siap membantu Anda kapan saja selama perjalanan",
              },
              {
                icon: <Security sx={{ fontSize: 60, color: "#ef4444" }} />,
                title: "Asuransi Perjalanan",
                description:
                  "Semua paket tour dilengkapi dengan asuransi perjalanan",
              },
              {
                icon: <Groups sx={{ fontSize: 60, color: "#8b5cf6" }} />,
                title: "Guide Profesional",
                description:
                  "Guide lokal berpengalaman yang ramah dan berpengetahuan luas",
              },
              {
                icon: <TravelExplore sx={{ fontSize: 60, color: "#06b6d4" }} />,
                title: "Destinasi Eksklusif",
                description:
                  "Akses ke destinasi tersembunyi yang tidak ada di tempat lain",
              },
            ].map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div variants={itemVariants}>
                  <Paper
                    sx={{
                      p: 4,
                      textAlign: "center",
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      "&:hover": {
                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                        transform: "translateY(-5px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    <Box sx={{ mb: 3 }}>{feature.icon}</Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: "#f8fafc", py: 8 }}>
        <Container maxWidth="lg">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
                color: "#1a202c",
              }}
            >
              Apa Kata Mereka?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mb: 6,
                color: "text.secondary",
              }}
            >
              Testimoni dari pelanggan yang puas
            </Typography>

            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div variants={itemVariants}>
                    <Paper
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        height: "100%",
                        position: "relative",
                        "&:before": {
                          content: '"""',
                          position: "absolute",
                          top: 10,
                          left: 20,
                          fontSize: "4rem",
                          color: "#6366f1",
                          opacity: 0.3,
                        },
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 3 }}
                      >
                        <Avatar
                          src={testimonial.avatar}
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {testimonial.tour}
                          </Typography>
                        </Box>
                      </Box>

                      <Rating
                        value={testimonial.rating}
                        readOnly
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="body1" sx={{ fontStyle: "italic" }}>
                        {testimonial.comment}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          py: 8,
          color: "white",
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                textAlign: "center",
                mb: 2,
                fontWeight: 700,
              }}
            >
              Siap Memulai Petualangan?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                mb: 4,
                opacity: 0.9,
              }}
            >
              Dapatkan penawaran terbaik dan update destinasi terbaru langsung
              di email Anda
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                maxWidth: 500,
                mx: "auto",
                mb: 4,
              }}
            >
              <TextField
                fullWidth
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "white",
                    borderRadius: 2,
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "white",
                  color: "#6366f1",
                  px: 3,
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                  },
                }}
                endIcon={<Send />}
              >
                Subscribe
              </Button>
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 6,
                  py: 1.5,
                  borderRadius: 3,
                  "&:hover": {
                    borderColor: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
                onClick={() => navigate("/tours")}
              >
                Mulai Jelajahi
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
}

export default Home;
