import React from "react";
import { motion } from "framer-motion";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // Data untuk featured tours
  const featuredTours = [
    {
      id: 1,
      title: "Bali Paradise",
      description: "Experience the magic of Bali with our exclusive tour package. Visit beautiful beaches, ancient temples, and lush rice terraces.",
      image: "https://source.unsplash.com/800x600/?bali",
      price: 1200,
    },
    {
      id: 2,
      title: "Tokyo Adventure",
      description: "Explore the vibrant city of Tokyo and its rich culture. From traditional temples to modern districts, experience the best of Japan.",
      image: "https://source.unsplash.com/800x600/?tokyo",
      price: 2500,
    },
    {
      id: 3,
      title: "Paris Romance",
      description: "Discover the city of love with our romantic Paris tour. Visit iconic landmarks, enjoy French cuisine, and create unforgettable memories.",
      image: "https://source.unsplash.com/800x600/?paris",
      price: 3000,
    },
  ];

  // Variants untuk animasi
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pt: 4 }}>
        <Container maxWidth="lg">
          {/* Hero Section */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Box 
              sx={{ 
                mb: 8, 
                textAlign: "center",
                background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                borderRadius: 4,
                p: 6,
                color: "white"
              }}
            >
              <Typography
                component="h1"
                variant="h2"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Discover Your Next Adventure
              </Typography>
              <Typography variant="h5" paragraph>
                Book your dream vacation with our exclusive tour packages
              </Typography>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/tours")}
                  sx={{ 
                    mt: 2,
                    bgcolor: "white",
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "grey.100"
                    }
                  }}
                >
                  Explore Tours
                </Button>
              </motion.div>
            </Box>
          </motion.div>

          {/* Featured Tours */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
              Featured Tours
            </Typography>
            <Grid container spacing={4}>
              {featuredTours.map((tour) => (
                <Grid item key={tour.id} xs={12} sm={6} md={4}>
                  <motion.div variants={itemVariants}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 2,
                        overflow: "hidden",
                      }}
                      component={motion.div}
                      whileHover={{ 
                        scale: 1.02,
                        transition: { duration: 0.2 }
                      }}
                    >
                      <CardMedia
                        component="img"
                        height="200"
                        image={tour.image}
                        alt={tour.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography gutterBottom variant="h5" component="h2">
                          {tour.title}
                        </Typography>
                        <Typography>{tour.description}</Typography>
                        <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                          ${tour.price}
                        </Typography>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={() => navigate(`/tours/${tour.id}`)}
                          >
                            Learn More
                          </Button>
                        </motion.div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Why Choose Us Section */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Box sx={{ mt: 8, mb: 6 }}>
              <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
                Why Choose Us
              </Typography>
              <Grid container spacing={4}>
                {[
                  {
                    title: "Best Prices",
                    description: "We offer competitive prices and best value for your money",
                    icon: "💰"
                  },
                  {
                    title: "Expert Guides",
                    description: "Our experienced guides ensure a memorable journey",
                    icon: "👨‍✈️"
                  },
                  {
                    title: "24/7 Support",
                    description: "Round-the-clock customer support for your peace of mind",
                    icon: "🛟"
                  },
                ].map((feature, index) => (
                  <Grid item key={index} xs={12} md={4}>
                    <motion.div variants={itemVariants}>
                      <Card 
                        sx={{ 
                          height: "100%", 
                          p: 3,
                          textAlign: "center",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            transform: "translateY(-8px)",
                            boxShadow: 4
                          }
                        }}
                      >
                        <Typography variant="h1" sx={{ mb: 2 }}>
                          {feature.icon}
                        </Typography>
                        <Typography variant="h6" gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </motion.div>
        </Container>
      </Box>
    </motion.div>
  );
}

export default Home;