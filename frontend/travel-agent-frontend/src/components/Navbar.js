import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Flight as FlightIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
  Menu as MenuIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  YouTube as YouTubeIcon,
} from "@mui/icons-material";

function Navbar() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navigationItems = [
    { label: "Home", path: "/" },
    { label: "Tours", path: "/tours" },
    { label: "My Bookings", path: "/my-bookings" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Trip Kuy Indonesia
      </Typography>
      <List>
        {navigationItems.map((item) => (
          <ListItem key={item.label} component={RouterLink} to={item.path}>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
        {!user && (
          <ListItem component={RouterLink} to="/login">
            <ListItemText primary="Login" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      {/* Top Contact Bar */}
      <Box
        sx={{
          bgcolor: "#6366f1",
          color: "white",
          py: 1,
          display: { xs: "none", md: "block" },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "0.875rem",
            }}
          >
            <Box sx={{ display: "flex", gap: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">+62-81-353-079-529</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <EmailIcon sx={{ fontSize: 16 }} />
                <Typography variant="body2">hello@tripkuy.co.id</Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <IconButton size="small" sx={{ color: "white" }}>
                <FacebookIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: "white" }}>
                <InstagramIcon sx={{ fontSize: 18 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: "white" }}>
                <YouTubeIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Navigation */}
      <AppBar
        position="static"
        sx={{
          bgcolor: "white",
          color: "black",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", mr: 4 }}>
              <Avatar
                sx={{
                  mr: 2,
                  bgcolor: "#6366f1",
                  width: 40,
                  height: 40,
                }}
              >
                <FlightIcon />
              </Avatar>
              <Typography
                variant="h6"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 700,
                  color: "#6366f1",
                  textDecoration: "none",
                  fontSize: "1.5rem",
                }}
              >
                Trip Kuy Indonesia
              </Typography>
            </Box>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box
                sx={{
                  flexGrow: 1,
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                {navigationItems.map((item) => (
                  <Button
                    key={item.label}
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: "black",
                      mx: 1,
                      px: 2,
                      "&:hover": {
                        color: "#6366f1",
                        backgroundColor: "transparent",
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                ))}
              </Box>
            )}

            {/* User Actions */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {user ? (
                <>
                  <IconButton
                    size="large"
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    sx={{ color: "#6366f1" }}
                  >
                    <AccountCircleIcon />
                  </IconButton>
                  <Menu
                    id="menu-appbar"
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                  >
                    <MenuItem
                      component={RouterLink}
                      to="/profile"
                      onClick={handleClose}
                    >
                      {user.name}
                    </MenuItem>
                    {user.role === "admin" && (
                      <MenuItem
                        component={RouterLink}
                        to="/admin/tour-packages"
                        onClick={handleClose}
                      >
                        Admin Panel
                      </MenuItem>
                    )}
                    <MenuItem
                      onClick={() => {
                        handleClose();
                        logout();
                        navigate("/login");
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                  sx={{
                    bgcolor: "#6366f1",
                    "&:hover": {
                      bgcolor: "#5855eb",
                    },
                    borderRadius: 2,
                    px: 3,
                  }}
                >
                  Kontak
                </Button>
              )}

              {/* Mobile menu button */}
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ color: "#6366f1" }}
                >
                  <MenuIcon />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default Navbar;
