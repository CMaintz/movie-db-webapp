import { useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    BottomNavigation,
    BottomNavigationAction,
    Fab,
} from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Home from '@mui/icons-material/Home';
import Category from '@mui/icons-material/Category';
import Favorite from '@mui/icons-material/Favorite';
import MenuIcon from '@mui/icons-material/Menu';
import Login from '@mui/icons-material/Login';
import PersonAdd from '@mui/icons-material/PersonAdd';
import Person from '@mui/icons-material/Person';
import { useAuth } from '../context/useAuth';
import React, { useState, useEffect } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [value, setValue] = useState(0);

    useEffect(() => {
        const path = location.pathname;
        if (path === '/') {
            setValue(0);
        } else if (path.startsWith('/genre/')) {
            setValue(1);
        } else if (path === '/wishlist') {
            setValue(2);
        } else {
            setValue(-1);
        }
    }, [location.pathname]);

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        try {
            await logout();
            handleClose();
            setMobileMenuOpen(false);
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const handleNavigation = (path: string) => {
        navigate(path);
        setMobileMenuOpen(false);
    };

    const mobileMenu = (
        <Drawer
            anchor="right"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
        >
            <Box sx={{ width: 250 }}>
                <List>
                    {user && (
                        <>
                            <ListItem
                                component="div"
                                onClick={() => handleNavigation('/profile')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <ListItemIcon>
                                    <Person />
                                </ListItemIcon>
                                <ListItemText primary="Profile" />
                            </ListItem>
                            <ListItem
                                component="div"
                                onClick={handleLogout}
                                sx={{ cursor: 'pointer' }}
                            >
                                <ListItemIcon>
                                    <AccountCircle />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItem>
                        </>
                    )}
                    {!user && (
                        <>
                            <ListItem
                                component="div"
                                onClick={() => handleNavigation('/login')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <ListItemIcon>
                                    <Login />
                                </ListItemIcon>
                                <ListItemText primary="Login" />
                            </ListItem>
                            <ListItem
                                component="div"
                                onClick={() => handleNavigation('/register')}
                                sx={{ cursor: 'pointer' }}
                            >
                                <ListItemIcon>
                                    <PersonAdd />
                                </ListItemIcon>
                                <ListItemText primary="Register" />
                            </ListItem>
                        </>
                    )}
                </List>
            </Box>
        </Drawer>
    );

    if (isMobile) {
        return (
            <>
                <Box sx={{ height: 56 }} />
                <Fab
                    size="small"
                    color="primary"
                    onClick={() => setMobileMenuOpen(true)}
                    sx={{
                        position: 'fixed',
                        right: 16,
                        top: 16,
                        zIndex: 1200
                    }}
                >
                    <MenuIcon />
                </Fab>
                <BottomNavigation
                    value={value}
                    onChange={(_event, newValue) => {
                        setValue(newValue);
                        switch(newValue) {
                            case 0:
                                handleNavigation('/');
                                break;
                            case 1:
                                handleNavigation('/genre/Action')
                                break;
                            case 2:
                                handleNavigation('/wishlist');
                                break;
                        }
                    }}
                    showLabels
                    sx={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: 'background.paper',
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        zIndex: 1000,
                        '& .MuiBottomNavigationAction-root': {
                            color: 'text.secondary',
                            '&.Mui-selected': {
                                color: 'primary.main',
                            },
                        },
                    }}
                >
                    <BottomNavigationAction
                        label="Home"
                        icon={<Home />}
                        sx={{
                            ...(location.pathname === '/' && {
                                color: 'primary.main',
                            }),
                        }}
                    />
                    <BottomNavigationAction
                        label="Genres"
                        icon={<Category />}
                        sx={{
                            ...(location.pathname.startsWith('/genre/') && {
                                color: 'primary.main',
                            }),
                        }}
                    />
                    <BottomNavigationAction
                        label="Wishlist"
                        icon={<Favorite />}
                        sx={{
                            ...(location.pathname === '/wishlist' && {
                                color: 'primary.main',
                            }),
                        }}
                    />
                </BottomNavigation>
                {mobileMenu}
            </>
        );
    }

    return (
        <AppBar
            position="fixed"
            sx={{
                width: '100%',
                maxWidth: '100vw',
                overflow: 'hidden'
            }}
        >
            <Toolbar sx={{
                width: '100%',
                maxWidth: '100%'
            }}>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{ flexGrow: 1, cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    Movie Explorer
                </Typography>

                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mr: 2,
                    overflow: 'hidden'
                }}>
                    <Button
                        color="inherit"
                        startIcon={<Home />}
                        onClick={() => navigate('/')}
                        sx={{
                            ...(location.pathname === '/' && {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                },
                            }),
                        }}
                    >
                        Home
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Category />}
                        onClick={() => navigate('/genre/Action')}
                        sx={{
                            ...(location.pathname.startsWith('/genre/') && {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                },
                            }),
                        }}
                    >
                        Genres
                    </Button>
                    <Button
                        color="inherit"
                        startIcon={<Favorite />}
                        onClick={() => navigate('/wishlist')}
                        sx={{
                            ...(location.pathname === '/wishlist' && {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                },
                            }),
                        }}
                    >
                        Wishlist
                    </Button>
                </Box>

                {user ? (
                    <>
                        <IconButton
                            size="large"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleMenu}
                            color="inherit"
                        >
                            <AccountCircle />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={() => { navigate('/profile'); handleClose(); }}>
                                Profile
                            </MenuItem>
                            <MenuItem onClick={handleLogout}>Logout</MenuItem>
                        </Menu>
                    </>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button color="inherit" onClick={() => navigate('/login')}>
                            Login
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/register')}>
                            Register
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar; 