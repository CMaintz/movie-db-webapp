import React, { Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import { useTVKeyHandler } from './hooks/useTVKeyHandler';
import { useWebOSLifecycle } from './hooks/useWebOSLifecycle';
import { useScrollOnFocus } from './hooks/useScrollOnFocus';
import { isTV } from './utils/platform';

// All pages are lazy-loaded so the initial bundle only contains the shell,
// Navbar, auth context, and router. Each page loads on first navigation.
const HomePage         = React.lazy(() => import('./pages/HomePage'));
const LoginPage        = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage     = React.lazy(() => import('./pages/RegisterPage'));
const ProfilePage      = React.lazy(() => import('./pages/ProfilePage'));
const GenrePage        = React.lazy(() => import('./pages/GenrePage'));
const WishlistPage     = React.lazy(() => import('./pages/WishlistPage'));
const WatchedPage      = React.lazy(() => import('./pages/WatchedPage'));
const MediaDetailsPage = React.lazy(() => import('./pages/MediaDetailsPage'));
const RoulettePage     = React.lazy(() => import('./pages/RoulettePage'));
const DeepLinkTestPage = React.lazy(() => import('./pages/DeepLinkTestPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const PageSpinner = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
  </div>
);

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  // TV-specific hooks
  useTVKeyHandler();
  useWebOSLifecycle();
  useScrollOnFocus();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <Suspense fallback={<PageSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/genre/:name" element={<GenrePage />} />
        <Route path="/:mediaType/:id" element={<MediaDetailsPage />} />
        <Route path="/roulette" element={<RoulettePage />} />
        <Route path="/dev/deeplink-test" element={<DeepLinkTestPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route
          path="/wishlist"
          element={<ProtectedRoute><WishlistPage /></ProtectedRoute>}
        />
        <Route
          path="/watched"
          element={<ProtectedRoute><WatchedPage /></ProtectedRoute>}
        />
      </Routes>
    </Suspense>
  );
};

function App() {
  // Apply TV mode class to <html> for CSS overrides (scrollbar hiding, etc.)
  useEffect(() => {
    if (isTV()) {
      document.documentElement.classList.add('tv-mode');
    }
  }, []);

  const tvSafeArea = isTV() ? 'px-[48px] py-[27px]' : '';

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className={`flex flex-col min-h-screen w-full max-w-[100vw] bg-bg-default text-white ${tvSafeArea}`}>
            <Navbar />
            <main className="flex-1 flex flex-col items-center w-full max-w-full pt-14 sm:pt-16 overflow-x-hidden">
              <AppContent />
            </main>
          </div>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: '#1e1e1e',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
