import React, { useState, useContext } from 'react';
import { Container, Typography, TextField, Button, Grid, Link, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import apiClient from 'src/utils/apiClient';
import { AuthContext } from 'src/services/AuthContext';

const Login = () => {
    const authContext = useContext(AuthContext);
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const showSnackbar = (message, options = {}) => {
        enqueueSnackbar(message, {
            variant: 'success',
            anchorOrigin: { horizontal: 'center', vertical: 'top' },
            ...options,
        });
    };

    const resetForm = () => {
        setFormData({
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
        });
    }

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiEndpoint = isLogin ? 'auth/login' : 'auth/register';
        try {
            const response = await apiClient.post(apiEndpoint, isLogin ? {
                username: formData.username, password: formData.password,
            } : {
                username: formData.username, email: formData.email, password: formData.password, confirmPassword: formData.confirmPassword,
            });
            if (isLogin) {
                showSnackbar(`Logged in, welcome back ${formData.username}!`);
                const { token } = response.data;
                authContext.loginUser(token);
                navigate('/');
                return;
            } else {
                showSnackbar('Succesfully registered!');
                setIsLogin(true);
            }
        } catch (error) {
            if (error.request.status == 400) {
                if (isLogin) {
                    showSnackbar('Bad Username or Password', { variant: 'error' });
                }
                else {
                    showSnackbar(error.response.data.message, { variant: 'error' });
                }
            }
            console.error(error);
        }
        resetForm();
        e.target.reset();
    };

    const toggleForm = () => {
        setIsLogin(!isLogin);
    };

    return (
        <Container component="main" maxWidth="xs" sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
            }}>
                <Typography component="h1" variant="h5">
                    {isLogin ? 'Login' : 'Register'}
                </Typography>
                <form style={{ width: '100%', marginTop: 3 }} onSubmit={handleSubmit}>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="name"
                        autoFocus
                        onChange={handleChange}
                    />
                    {!isLogin && (
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            onChange={handleChange}
                        />
                    )}
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        onChange={handleChange}
                    />
                    {!isLogin && (
                        <TextField
                            variant="outlined"
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="confirmPassword"
                            id="confirmPassword"
                            autoComplete="confirm-password"
                            onChange={handleChange}
                        />
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        style={{ margin: '24px 0px 16px' }}
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </Button>
                    <Grid container>
                        <Grid item>
                            <Link href="#" variant="body2" onClick={toggleForm}>
                                {isLogin ? "Don't have an account? Sign Up" : "Have an account? Sign In"}
                            </Link>
                        </Grid>
                    </Grid>
                </form>
            </Box>
        </Container>
    );
};

export default Login;