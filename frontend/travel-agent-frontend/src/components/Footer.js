import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  TextField,
  Button,
} from "@mui/material";
import {
  Phone,
  Email,
  LocationOn,
  Facebook,
  Instagram,
  YouTube,
  Flight,
  Send,
  MusicNote, // Gunakan sebagai alternatif TikTok
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

function Footer() {
  return (
    <Box sx={{ bgcolor: "#1a202c", color: "white", pt: 6, pb: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <Flight sx={{ mr: 2, color: "#6366f1" }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Ticko Travel
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
              Kami adalah travel agent terpercaya yang telah melayani ribuan
              wisatawan untuk menjelajahi keindahan Indonesia dengan pengalaman
              tak terlupakan.
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton sx={{ color: "#3b82f6" }}>
                <Facebook />
              </IconButton>
              <IconButton sx={{ color: "#e1306c" }}>
                <Instagram />
              </IconButton>
              <IconButton sx={{ color: "#ff0000" }}>
                <YouTube />
              </IconButton>
              <IconButton sx={{ color: "#ff0050" }}>
                <MusicNote />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Quick Links
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                { label: "Home", path: "/" },
                { label: "Tour Packages", path: "/tours" },
                { label: "About Us", path: "/about" },
                { label: "Contact", path: "/contact" },
                { label: "Blog", path: "/blog" },
              ].map((link) => (
                <Link
                  key={link.label}
                  component={RouterLink}
                  to={link.path}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    opacity: 0.8,
                    "&:hover": {
                      opacity: 1,
                      color: "#6366f1",
                    },
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Destinations */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Destinations
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[
                "Bali",
                "Yogyakarta",
                "Jakarta",
                "Bandung",
                "Lombok",
                "Komodo",
              ].map((destination) => (
                <Link
                  key={destination}
                  sx={{
                    color: "white",
                    textDecoration: "none",
                    opacity: 0.8,
                    cursor: "pointer",
                    "&:hover": {
                      opacity: 1,
                      color: "#6366f1",
                    },
                  }}
                >
                  {destination}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Contact Info
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Phone sx={{ mr: 2, color: "#6366f1" }} />
              <Typography variant="body2">+62-81-353-079-529</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Email sx={{ mr: 2, color: "#6366f1" }} />
              <Typography variant="body2">hello@tickotravel.co.id</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "flex-start", mb: 3 }}>
              <LocationOn sx={{ mr: 2, color: "#6366f1", mt: 0.5 }} />
              <Typography variant="body2">
                Jl. Sudirman No. 123
                <br />
                Jakarta Pusat 10220
                <br />
                Indonesia
              </Typography>
            </Box>

            {/* Newsletter */}
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Subscribe Newsletter
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                size="small"
                placeholder="Your email"
                sx={{
                  flexGrow: 1,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.1)",
                    color: "white",
                    "& fieldset": {
                      borderColor: "rgba(255,255,255,0.3)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255,255,255,0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#6366f1",
                    },
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "rgba(255,255,255,0.7)",
                    opacity: 1,
                  },
                }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: "#6366f1",
                  minWidth: "auto",
                  px: 2,
                  "&:hover": {
                    bgcolor: "#5855eb",
                  },
                }}
              >
                <Send fontSize="small" />
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, bgcolor: "rgba(255,255,255,0.1)" }} />

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2024 Ticko Travel. All rights reserved.
          </Typography>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Link
              sx={{
                color: "white",
                opacity: 0.8,
                textDecoration: "none",
                "&:hover": { opacity: 1 },
              }}
            >
              Privacy Policy
            </Link>
            <Link
              sx={{
                color: "white",
                opacity: 0.8,
                textDecoration: "none",
                "&:hover": { opacity: 1 },
              }}
            >
              Terms of Service
            </Link>
            <Link
              sx={{
                color: "white",
                opacity: 0.8,
                textDecoration: "none",
                "&:hover": { opacity: 1 },
              }}
            >
              Cookie Policy
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
