import React, { useState } from 'react';
import {
  Box, Button, TextField, Typography, Alert, CircularProgress, Paper, Divider, useMediaQuery
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import axiosClient from '../services/axiosClient';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const isMobile = useMediaQuery('(max-width:768px)');

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axiosClient.post('/auth/login', formData);
      const { user, token } = res.data;
      login(user, token);
      localStorage.setItem('username', formData.username);
      setMessage({ type: 'success', text: 'Login successful. Redirecting...' });

      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Login failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to right, #fdfbfb, #ebedee)',
        px: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 900,
          overflow: 'hidden',
          borderRadius: 4
        }}
      >
        {/* Image or Illustration */}
        <Box
          sx={{
            flex: 1,
            backgroundImage: 'url(/login.jpg)', // replace with actual path to your image
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            minHeight: 400,
          }}
        />

        {/* Login Form */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            p: 5,
            backgroundColor: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h5" fontWeight={600} textAlign="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
            Login to continue to your dashboard
          </Typography>

          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
          />

          {message.text && (
            <Alert sx={{ mt: 2 }} severity={message.type}>
              {message.text}
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 1.3, fontWeight: 600, fontSize: '15px' }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
          </Button>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" textAlign="center">
            Don't have an account?{' '}
            <Link to="/signup" style={{ textDecoration: 'none', color: '#1976d2', fontWeight: 500 }}>
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginPage;
