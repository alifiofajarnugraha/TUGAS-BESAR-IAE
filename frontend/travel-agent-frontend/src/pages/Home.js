import React from "react";
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

  const featuredTours = [
    {
      id: 1,
      title: "Bali Paradise",
      description:
        "Experience the magic of Bali with our exclusive tour package",
      image: "https://source.unsplash.com/800x600/?bali",
      price: 1200,
    },
    {
      id: 2,
      title: "Tokyo Adventure",
      description: "Explore the vibrant city of Tokyo and its rich culture",
      image: "https://source.unsplash.com/800x600/?tokyo",
      price: 2500,
    },
    {
      id: 3,
      title: "Paris Romance",
      description: "Discover the city of love with our romantic Paris tour",
      image: "https://source.unsplash.com/800x600/?paris",
      price: 3000,
    },
  ];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pt: 4 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ mb: 8, textAlign: "center" }}>
          <Typography
            component="h1"
            variant="h2"
            color="primary"
            gutterBottom
            sx={{ fontWeight: "bold" }}
          >
            Discover Your Next Adventure
          </Typography>
          <Typography variant="h5" color="text.secondary" paragraph>
            Book your dream vacation with our exclusive tour packages
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/tours")}
            sx={{ mt: 2 }}
          >
            Explore Tours
          </Button>
        </Box>

        {/* Featured Tours */}
        <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
          Featured Tours
        </Typography>
        <Grid container spacing={4}>
          {featuredTours.map((tour) => (
            <Grid item key={tour.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  "&:hover": {
                    transform: "scale(1.02)",
                    transition: "transform 0.2s ease-in-out",
                  },
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
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 2 }}
                    onClick={() => navigate(`/tours/${tour.id}`)}
                  >
                    Learn More
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Why Choose Us Section */}
        <Box sx={{ mt: 8, mb: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
            Why Choose Us
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                title: "Best Prices",
                description:
                  "We offer competitive prices and best value for your money",
              },
              {
                title: "Expert Guides",
                description:
                  "Our experienced guides ensure a memorable journey",
              },
              {
                title: "24/7 Support",
                description:
                  "Round-the-clock customer support for your peace of mind",
              },
            ].map((feature, index) => (
              <Grid item key={index} xs={12} md={4}>
                <Card sx={{ height: "100%", p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
