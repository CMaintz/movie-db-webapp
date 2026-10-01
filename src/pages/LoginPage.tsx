import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FocusableInput: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
> = ({ label, ...props }) => {
  const { ref, focused } = useFocusable({
    onEnterPress: () => {
      // Focus the native input so webOS shows the on-screen keyboard
      (ref as React.RefObject<HTMLInputElement>).current?.focus();
    },
  });
  return (
    <div>
      <label className="text-white/70 text-sm mb-1 block">{label}</label>
      <input
        ref={ref as React.RefObject<HTMLInputElement>}
        {...props}
        className={`w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-white/30 ${
          focused ? 'ring-2 ring-primary border-primary' : ''
        } ${props.className || ''}`}
      />
    </div>
  );
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const { ref: formRef, focusKey } = useFocusable({
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch {
      setError('Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const { ref: submitRef, focused: submitFocused } = useFocusable({
    onEnterPress: () => {
      // Trigger form submit
      const form = (submitRef as React.RefObject<HTMLButtonElement>).current?.closest('form');
      form?.requestSubmit();
    },
  });

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={formRef as React.RefObject<HTMLDivElement>} className="w-full min-h-[calc(100vh-7rem)] flex items-center justify-center px-4">
        <div className="w-full max-w-sm bg-bg-paper/95 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h1 className="text-white text-2xl font-bold text-center mb-6">Welcome Back</h1>

          {error && (
            <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FocusableInput
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />

            <div>
              <label className="text-white/70 text-sm mb-1 block">Password</label>
              <div className="relative">
                <FocusableInput
                  label=""
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              ref={submitRef as React.RefObject<HTMLButtonElement>}
              type="submit"
              disabled={loading}
              className={`w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-paper disabled:opacity-50 mt-2 ${
                submitFocused ? 'ring-2 ring-primary ring-offset-2 ring-offset-bg-paper' : ''
              }`}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-white/50 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default LoginPage;
