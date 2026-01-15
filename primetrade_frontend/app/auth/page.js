"use client";
import { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Box, Link, Alert } from '@mui/material';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (form.password.length > 128) {
      newErrors.password = 'Password is too long';
    }

    // Name validation for signup
    if (!isLogin && form.name && form.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Client-side validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const route = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin 
        ? { email: form.email, password: form.password }
        : { email: form.email, password: form.password, name: form.name };

      console.log('Submitting to:', route, body);

      const res = await fetch(route, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
      });

      const data = await res.json();
      console.log('Response:', res.status, data);

      if (res.ok) {
        console.log('✅ Authentication successful!');
        
        // For signup, show success message
        if (!isLogin) {
          setServerError('');
          alert('Account created successfully! Please login.');
          setIsLogin(true);
          setForm({ email: form.email, password: '', name: '' });
          setLoading(false);
          return;
        }
        
        // For login, redirect to dashboard
        console.log('🔄 Redirecting to dashboard...');
        // Use window.location.replace to prevent back button issues
        // Add small delay to ensure cookie is fully processed
        setTimeout(() => {
          window.location.replace('/dashboard');
        }, 200);
      } else {
        console.log('❌ Authentication failed:', data.error);
        setServerError(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setServerError('');
    setForm({ email: '', password: '', name: '' });
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom fontWeight="bold">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          {isLogin ? 'Sign in to access your dashboard' : 'Sign up to get started'}
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {!isLogin && (
            <TextField 
              fullWidth 
              label="Name (Optional)" 
              margin="normal"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              error={!!errors.name}
              helperText={errors.name}
            />
          )}

          <TextField 
            fullWidth 
            label="Email" 
            margin="normal" 
            required 
            value={form.email}
            onChange={(e) => {
              setForm({...form, email: e.target.value});
              if (errors.email) setErrors({...errors, email: ''});
            }}
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="email"
          />

          <TextField 
            fullWidth 
            label="Password" 
            type="password" 
            margin="normal" 
            required 
            value={form.password}
            onChange={(e) => {
              setForm({...form, password: e.target.value});
              if (errors.password) setErrors({...errors, password: ''});
            }}
            error={!!errors.password}
            helperText={errors.password || (!isLogin && 'Minimum 6 characters')}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
          />

          <Button 
            fullWidth 
            variant="contained" 
            type="submit" 
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Register')}
          </Button>

          <Box textAlign="center" sx={{ mt: 2 }}>
            <Link component="button" variant="body2" onClick={toggleMode} type="button">
              {isLogin ? "New here? Create an account" : "Already have an account? Login"}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}