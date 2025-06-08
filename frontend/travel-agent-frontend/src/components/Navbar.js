import React from "react";
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
} from "@mui/material";
import {
  Flight as FlightIcon,
  EventNote as EventNoteIcon,
  AccountCircle as AccountCircleIcon,
} from "@mui/icons-material";

function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const { user, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <FlightIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={RouterLink}
            to="/"
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".3rem",
              color: "inherit",
              textDecoration: "none",
              flexGrow: 1,
            }}
          >
            TRAVEL AGENT
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/tours"
              startIcon={<FlightIcon />}
            >
              Tours
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/bookings"
              startIcon={<EventNoteIcon />}
            >
              My Bookings
            </Button>{" "}
            {user ? (
              <div>
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
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
              </div>
            ) : (
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
            )}
            {user && user.role === "admin" && (
              <Button
                color="inherit"
                component={RouterLink}
                to="/admin/tour-packages"
                sx={{ textTransform: "none" }}
              >
                Admin Panel
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
