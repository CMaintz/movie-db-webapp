import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    
  palette: {
    primary: {
        main: '#2196f3', // Vibrant blue
        light: '#64b5f6',
        dark: '#1976d2',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#ffb300', // Amber/yellow
        light: '#ffca28',
        dark: '#ff8f00',
        contrastText: '#000000',
    },
    background: {
        default: '#121212', // Dark background for movie site
        paper: '#1e1e1e',
    },
    text: {
        primary: '#ffffff',
        secondary: '#b3b3b3',
    },
},
typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
        fontWeight: 700,
        fontSize: 'clamp(2rem, 5vw, 3.5rem)',
    },
    h2: {
        fontWeight: 700,
        fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
    },
    h3: {
        fontWeight: 600,
        fontSize: 'clamp(1.25rem, 3vw, 2rem)',
    },
    h4: {
        fontWeight: 600,
        fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)',
    },
    h5: {
        fontWeight: 500,
        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
    },
    h6: {
        fontWeight: 500,
        fontSize: 'clamp(0.875rem, 1.5vw, 1.25rem)',
    },
    body1: {
        fontSize: 'clamp(0.875rem, 1.5vw, 1rem)',
    },
    body2: {
        fontSize: 'clamp(0.75rem, 1.25vw, 0.875rem)',
    },
},
components: {
    MuiCssBaseline: {
        styleOverrides: {
            html: {
                height: '100%',
            },
            body: {
                height: '100%',
                margin: 0,
                padding: 0,
            },
            '#root': {
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            },
        },
    },
    MuiContainer: {
        styleOverrides: {
            root: {
                width: '100%',
                maxWidth: 'xl !important',
                paddingLeft: '0.5rem !important',
                paddingRight: '0.5rem !important',
                '@media (min-width:600px)': {
                    paddingLeft: '1rem !important',
                    paddingRight: '1rem !important',
                },
                '@media (min-width:900px)': {
                paddingTop: '4rem !important',
                    paddingLeft: '1.5rem !important',
                    paddingRight: '1.5rem !important',
                },
                '@media (min-width:1200px)': {
                    paddingLeft: '2rem !important',
                    paddingRight: '2rem !important',
                },
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                backgroundColor: '#1e1e1e',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
                width: '100%',
                maxWidth: '100%',
            },
        },
    },
    MuiCardContent: {
        styleOverrides: {
            root: {
                padding: '0.75rem',
                '&:last-child': {
                    paddingBottom: '0.75rem',
                },
            },
        },
    },
    MuiCardMedia: {
        styleOverrides: {
            root: {
                aspectRatio: '2/3',
                objectFit: 'cover',
                width: '100%',
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                textTransform: 'none',
                fontWeight: 600,
            },
        },
    },
    MuiGrid: {
        styleOverrides: {
            container: {
                width: '100%',
                margin: 0,
                maxWidth: '100%',
            },
           
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            },
        },
    },
    MuiIconButton: {
        styleOverrides: {
            root: {
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                },
            },
        },
    },
},
spacing: (factor: number) => `${0.25 * factor}rem`,
});

export default theme; 