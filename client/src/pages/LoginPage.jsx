import React, { useState } from 'react';
import {
    Box, Button, TextField, Typography, Alert, CircularProgress
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const LoginPage = () => {
    const navigate = useNavigate();
    const { user, login } = useAuth();

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
            const res = await axios.post('http://localhost:3001/api/v2/auth/login', formData, { withCredentials: true });
            const { user, token } = res.data;

            login(user, token);
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

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
                width: 400,
                mx: 'auto',
                mt: 8,
                p: 4,
                boxShadow: 3,
                borderRadius: 2,
                bgcolor: '#fff'
            }}
            component="form"
            onSubmit={handleSubmit}
        >
            <Typography variant="h5" textAlign="center" gutterBottom>
                Login
            </Typography>

            <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                fullWidth
                required
                margin="normal"
                placeholder="Enter your username"
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
                placeholder="Enter your email address"
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
                placeholder="Enter your password"
            />

            <Box mt={2}>
                <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                </Button>
            </Box>

            <Box mt={3} textAlign="center">
                <Typography variant="body2">
                    Don't have an account?{' '}
                    <Link to="/signup">
                        Sign Up
                    </Link>
                </Typography>
            </Box>

            {message.text && (
                <Box mt={2}>
                    <Alert severity={message.type}>{message.text}</Alert>
                </Box>
            )}
        </Box>
    );
};

export default LoginPage;
