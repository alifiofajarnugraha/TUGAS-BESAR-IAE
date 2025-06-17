import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
} from "@mui/material";
import { useMutation } from "@apollo/client";
import { MUTATIONS, userService } from "../services/api";
import { motion } from "framer-motion";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const [register, { loading }] = useMutation(MUTATIONS.REGISTER, {
    client: userService, // Specify the client
    onCompleted: () => {
      navigate("/login", {
        state: { message: "Registration successful! Please login." },
      });
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: "customer",
          },
        },
      });
    } catch (err) {
      console.error("Registration error:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                width: "100%",
                borderRadius: 2,
                background: "linear-gradient(45deg, #ffffff 30%, #f5f5f5 90%)"
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Typography 
                  component="h1" 
                  variant="h5" 
                  align="center" 
                  gutterBottom
                  sx={{ 
                    color: "primary.main",
                    fontWeight: "bold"
                  }}
                >
                  Join Our Adventure
                </Typography>
              </motion.div>

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

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {[
                  { name: "name", label: "Full Name", type: "text" },
                  { name: "email", label: "Email Address", type: "email" },
                  { name: "password", label: "Password", type: "password" },
                  { name: "confirmPassword", label: "Confirm Password", type: "password" }
                ].map((field, index) => (
                  <motion.div
                    key={field.name}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id={field.name}
                      label={field.label}
                      name={field.name}
                      type={field.type}
                      autoComplete={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      autoFocus={index === 0}
                    />
                  </motion.div>
                ))}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 3, 
                      mb: 2,
                      height: 48,
                      fontSize: "1.1rem"
                    }}
                    disabled={loading}
                  >
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Link 
                      component={RouterLink} 
                      to="/login" 
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline"
                        }
                      }}
                    >
                      {"Already have an account? Sign In"}
                    </Link>
                  </Box>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Container>
    </motion.div>
  );
}

export default Register;
