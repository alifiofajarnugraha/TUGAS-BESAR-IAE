import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
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

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login: authLogin } = useAuth();
  const [login, { loading }] = useMutation(MUTATIONS.LOGIN, {
    client: userService, // Specify the client
    onCompleted: ({ authenticateUser }) => {
      authLogin(authenticateUser.user, authenticateUser.token);
      navigate("/");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ variables: { email, password } });
    } catch (err) {
      console.error("Login error:", err);
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
                  Welcome Back!
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
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </motion.div>

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
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <Box sx={{ textAlign: "center" }}>
                    <Link 
                      component={RouterLink} 
                      to="/register" 
                      variant="body2"
                      sx={{
                        color: "primary.main",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline"
                        }
                      }}
                    >
                      {"Don't have an account? Sign Up"}
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

export default Login;
