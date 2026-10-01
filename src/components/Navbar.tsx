import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  useFocusable,
  FocusContext,
} from '@noriginmedia/norigin-spatial-navigation';
import {
  Home,
  LayoutGrid,
  Heart,
  CheckCircle,
  Shuffle,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Genres', icon: LayoutGrid, path: '/genre/Action' },
  { label: 'Roulette', icon: Shuffle, path: '/roulette' },
  { label: 'Wishlist', icon: Heart, path: '/wishlist' },
  { label: 'Watched', icon: CheckCircle, path: '/watched' },
];

const NavBtn = ({
  onClick,
  icon: Icon,
  label,
  isActive,
  className = '',
}: {
  onClick: () => void;
  icon: React.FC<{ className?: string }>;
  label: string;
  isActive: boolean;
  className?: string;
}) => {
  const { ref, focused } = useFocusable({ onEnterPress: onClick });
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
        focused ? 'ring-2 ring-primary' : ''
      } ${
        isActive
          ? 'text-primary bg-primary/10'
          : 'text-white/80 hover:text-white hover:bg-white/10'
      } ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { ref: navRef, focusKey } = useFocusable({
    focusKey: 'NAVBAR',
    trackChildren: true,
    isFocusBoundary: true,
    focusBoundaryDirections: ['left', 'right'] as any,
  });

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split('/')[1] ? `/${path.split('/')[1]}` : path);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {}
  };

  return (
    <>
      {/* Desktop navbar */}
      <FocusContext.Provider value={focusKey}>
        <header
          ref={navRef as React.RefObject<HTMLElement>}
          className="fixed top-0 left-0 right-0 z-50 bg-bg-paper/95 backdrop-blur-sm border-b border-white/10 h-14 hidden md:flex items-center px-4 gap-2"
        >
          <NavBtn
            onClick={() => navigate('/')}
            icon={() => <span className="text-white font-bold text-lg tracking-wide">MovieDB</span>}
            label=""
            isActive={false}
            className="mr-4"
          />

          <nav className="flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(({ label, icon, path }) => (
              <NavBtn
                key={label}
                onClick={() => navigate(path)}
                icon={icon}
                label={label}
                isActive={isActive(path)}
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <NavBtn
                  onClick={() => navigate('/profile')}
                  icon={User}
                  label={user.displayName || user.email?.split('@')[0] || 'Profile'}
                  isActive={false}
                />
                <NavBtn
                  onClick={handleLogout}
                  icon={LogOut}
                  label="Logout"
                  isActive={false}
                  className="text-white/60"
                />
              </>
            ) : (
              <>
                <NavBtn
                  onClick={() => navigate('/login')}
                  icon={LogIn}
                  label="Login"
                  isActive={false}
                />
                <NavBtn
                  onClick={() => navigate('/register')}
                  icon={UserPlus}
                  label="Register"
                  isActive={false}
                  className="bg-primary text-white hover:bg-primary-dark"
                />
              </>
            )}
          </div>
        </header>
      </FocusContext.Provider>

      {/* Mobile: top bar with hamburger */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-bg-paper/95 backdrop-blur-sm border-b border-white/10 h-14 flex md:hidden items-center px-4">
        <button
          onClick={() => navigate('/')}
          className="text-white font-bold text-lg mr-auto focus:outline-none"
        >
          MovieDB
        </button>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-white p-2 focus:outline-none focus:ring-2 focus:ring-primary rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="flex-1 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="w-64 bg-bg-paper h-full flex flex-col p-4 gap-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-bold text-lg">Menu</span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-white/60 hover:text-white focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                  isActive(path)
                    ? 'text-primary bg-primary/10'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}

            <div className="mt-auto pt-4 border-t border-white/10 flex flex-col gap-2">
              {user ? (
                <>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <User className="w-5 h-5" />
                    Profile
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left text-white/80 hover:text-white hover:bg-white/10"
                  >
                    <LogIn className="w-5 h-5" />
                    Login
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-left bg-primary text-white hover:bg-primary-dark"
                  >
                    <UserPlus className="w-5 h-5" />
                    Register
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-bg-paper/95 backdrop-blur-sm border-t border-white/10 flex">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[0.6rem] font-medium transition-colors focus:outline-none ${
              isActive(path) ? 'text-primary' : 'text-white/50 hover:text-white/80'
            }`}
          >
            <Icon className="w-5 h-5" />
            {label}
          </button>
        ))}
      </nav>

      {/* Bottom padding for mobile nav */}
      <div className="h-14 md:hidden" />
    </>
  );
};

export default Navbar;
