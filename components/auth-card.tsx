// components/AuthCard.js
import React, { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Box } from "@mui/system";
import GoogleIcon from "@mui/icons-material/Google";
import Image from "next/image";

const AuthCard = ({ title, onGoogleSignIn, isLogin }:{title:string,onGoogleSignIn:()=>{},isLogin?:boolean}) => {
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await onGoogleSignIn();
      setSnackbarMessage("Signed in successfully!");
      setSnackbarSeverity("success");
    } catch (error) {
      setSnackbarMessage("Failed to sign in!");
      setSnackbarSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      <Paper
        elevation={3}
        sx={{
          padding: "2rem",
          maxWidth: "400px",
          margin: "2rem auto",
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          textAlign: "center",
        }}

      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Image
            alt="management"
            height={140}
            width={140}
            src="/images/management.svg"
          />
          <div className="text-2xl font-semibold mt-4">{title}</div>
          <Typography variant="body1" color="textSecondary">
            Please sign in to access your account and manage your items
            effortlessly.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            sx={{
              marginTop: "1rem",
              backgroundColor: "#4caf50",
              width: "100%",
              height: "3rem",
              "&:hover": {
                backgroundColor: "#388e3c",
              },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Sign in with Google"
            )}
          </Button>
          {isLogin ? (
            <Typography variant="body2" color="textSecondary">
              Don't have an account? <a href="/register">Register here</a>.
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">
              have an account? <a href="/login">Login here</a>.
            </Typography>
          )}
        </Box>
      </Paper>
    </>
  );
};

export default AuthCard;
