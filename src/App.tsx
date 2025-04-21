import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import GenrePage from './pages/GenrePage';
import WishlistPage from './pages/WishlistPage';
import MediaDetailsPage from './pages/MediaDetailsPage';
import theme from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/genre/:genreName" element={<GenrePage />} />
      <Route path="/:mediaType/:id" element={<MediaDetailsPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/" /> : <RegisterPage />}
      />
      <Route
        path="/profile"
        element={ 
        <ProtectedRoute> 
          <ProfilePage /> 
          </ProtectedRoute>
          }
      />
      <Route 
        path="/wishlist" 
        element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                minHeight: '100vh',
                width: '100%',
                maxWidth: '100vw',
              }}>
                <Navbar />
                <Box component="main" sx={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: '100%',
                  maxWidth: '100%',
                  pt: { xs: 7, sm: 8 },
                  overflowX: 'hidden'
                }}>
                  <AppContent />
                </Box>
              </Box>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
