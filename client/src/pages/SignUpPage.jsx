import React, { useState } from 'react';
import {
    Box, Button, TextField, Typography, Alert, CircularProgress
} from '@mui/material';
import {Link} from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const SignupPage = () => {
    const [message, setMessage] = useState({ type: '', text: '' });

    const initialValues = {
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    };

    const validationSchema = Yup.object({
        username: Yup.string().min(3).required('Username is required'),
        email: Yup.string().email('Invalid email address').required('Email is required'),
        password: Yup.string().min(6, 'Minimum 6 characters').required('Password is required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Passwords must match')
            .required('Confirm your password')
    });

    const handleSubmit = async (values, { resetForm, setSubmitting }) => {
        setMessage({ type: '', text: '' });

        try {
            const res = await axios.post(
                'http://localhost:3001/api/v2/auth/register',
                {
                    username: values.username,
                    email: values.email,
                    password: values.password
                }
            );
            setMessage({ type: 'success', text: 'Signup successful. You can now login.' });
            setTimeout(() => {
                window.location.href = '/login';
            }, 1000); // Redirect after 1 second
            resetForm();
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Signup failed. Please try again.'
            });
        } finally {
            setSubmitting(false);
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
        >
            <Typography variant="h5" textAlign="center" gutterBottom>
                Create Your Account
            </Typography>

            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({
                    values, errors, touched, handleChange, handleBlur, isSubmitting
                }) => (
                    <Form>
                        <TextField
                            label="Username"
                            name="username"
                            value={values.username}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            fullWidth
                            required
                            margin="normal"
                            error={touched.username && Boolean(errors.username)}
                            helperText={touched.username && errors.username}
                            placeholder="Choose a unique username"
                        />

                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={values.email}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            fullWidth
                            required
                            margin="normal"
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                            placeholder="Enter your email"
                        />

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={values.password}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            fullWidth
                            required
                            margin="normal"
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                            placeholder="Create a strong password"
                        />

                        <TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={values.confirmPassword}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            fullWidth
                            required
                            margin="normal"
                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                            placeholder="Re-enter your password"
                        />

                        <Box mt={2}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                            </Button>
                        </Box>

                        {message.text && (
                            <Box mt={2}>
                                <Alert severity={message.type}>{message.text}</Alert>
                            </Box>
                        )}
                    </Form>
                )}
            </Formik>

            <Box mt={3} textAlign="center">
                <Typography variant="body2">
                    Already have an account?{' '}
                    <Link to="/login" underline="hover">
                        Login
                    </Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default SignupPage;
