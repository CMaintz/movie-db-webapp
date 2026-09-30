import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    TextField,
    Button,
    Alert,
    Paper,
    Avatar,
    Stack,
    Divider,
} from '@mui/material';
import { Person, Edit, Logout } from '@mui/icons-material';
import { useAuth } from '../context/useAuth';

const ProfilePage: React.FC = () => {
    const { user, logout, updateDisplayName } = useAuth();
    const [displayName, setDisplayName] = useState(user?.displayName || '');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await updateDisplayName(displayName.trim());
            setSuccess('Profile updated successfully');
        } catch {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch {
            setError('Failed to log out. Please try again.');
        }
    };

    if (!user) {
        return (
            <Container maxWidth={false}>
                <Box sx={{
                    textAlign: 'center',
                    py: 8,
                    height: '50vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Typography variant="h5" sx={{ color: 'text.primary' }}>
                        Please log in to view your profile
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Box
                sx={{
                    py: 6,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        mb: 4,
                        fontWeight: 600,
                        color: 'text.primary'
                    }}
                >
                    My Profile
                </Typography>

                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mt: 2,
                            width: '100%',
                            borderRadius: 2,
                            mb: 3
                        }}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        sx={{
                            mt: 2,
                            width: '100%',
                            borderRadius: 2,
                            mb: 3
                        }}
                    >
                        {success}
                    </Alert>
                )}

                <Paper
                    elevation={4}
                    sx={{
                        p: { xs: 3, sm: 4 },
                        width: '100%',
                        borderRadius: 2,
                        backgroundColor: 'background.paper',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <Stack
                        direction="column"
                        alignItems="center"
                        spacing={3}
                        sx={{ mb: 4 }}
                    >
                        <Avatar
                            sx={{
                                width: 96,
                                height: 96,
                                bgcolor: 'primary.main',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                            }}
                        >
                            <Person sx={{ fontSize: 48 }} />
                        </Avatar>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                color: 'text.primary'
                            }}
                        >
                            {user.displayName || 'User'}
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            '& .MuiTextField-root': {
                                mb: 3,
                                "& .MuiInputLabel-root": {
                                    color: 'text.secondary'
                                },
                                "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                        borderColor: 'rgba(255, 255, 255, 0.2)'
                                    },
                                    "&:hover fieldset": {
                                        borderColor: 'primary.light'
                                    },
                                }
                            }
                        }}
                    >
                        <TextField
                            fullWidth
                            id="email"
                            label="Email"
                            name="email"
                            value={user.email || ''}
                            disabled
                            variant="outlined"
                            InputProps={{
                                sx: {
                                    "& input": {
                                        color: 'rgba(255, 255, 255, 0.8)',
                                        WebkitTextFillColor: 'rgba(255, 255, 255, 0.8)',
                                        opacity: 1,
                                    }
                                }
                            }}
                            sx={{
                                "& .Mui-disabled": {
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            id="displayName"
                            label="Display Name"
                            name="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            variant="outlined"
                            InputProps={{
                                endAdornment: <Edit fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                            }}
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading || !displayName.trim() || displayName.trim() === (user.displayName ?? '')}
                            startIcon={<Edit />}
                            sx={{
                                mt: 2,
                                py: 1.5,
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            Update Profile
                        </Button>
                    </Box>

                    <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        onClick={handleLogout}
                        startIcon={<Logout />}
                        sx={{
                            mt: 3,
                            py: 1.5,
                            fontSize: '0.95rem',
                            borderColor: 'rgba(244, 67, 54, 0.5)',
                            '&:hover': {
                                borderColor: 'error.main',
                                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                            }
                        }}
                    >
                        Logout
                    </Button>
                </Paper>
            </Box>
        </Container>
    );
};

export default ProfilePage; 