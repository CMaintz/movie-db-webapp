import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { userSettingsService } from '../services/userSettingsService';
import { detectWatchRegion, COUNTRIES } from '../utils/geoRegion';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [watchRegion, setWatchRegion] = useState('US');
  const [detectingRegion, setDetectingRegion] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  // Auto-detect country from IP address to pre-fill the selector
  useEffect(() => {
    detectWatchRegion().then((code) => {
      setWatchRegion(code);
      setDetectingRegion(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      // Save watch region immediately — auth.currentUser is set synchronously after signUp
      const currentUser = auth.currentUser;
      if (currentUser) {
        await userSettingsService.saveSettings(currentUser.uid, {
          streamingServiceIds: [],
          watchRegion,
        });
      }
      navigate('/');
    } catch {
      setError('Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-white/30';

  return (
    <div className="w-full min-h-[calc(100vh-7rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-bg-paper/95 backdrop-blur border border-white/10 rounded-2xl p-8">
        <h1 className="text-white text-2xl font-bold text-center mb-6">Create Account</h1>

        {error && (
          <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="text-white/70 text-sm mb-1 block">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="you@example.com"
            />
          </div>

          {/* Password fields */}
          {[
            {
              label: 'Password',
              value: password,
              onChange: setPassword,
              show: showPassword,
              toggle: () => setShowPassword((v) => !v),
              autoComplete: 'new-password',
            },
            {
              label: 'Confirm Password',
              value: confirmPassword,
              onChange: setConfirmPassword,
              show: showConfirmPassword,
              toggle: () => setShowConfirmPassword((v) => !v),
              autoComplete: 'new-password',
            },
          ].map(({ label, value, onChange, show, toggle, autoComplete }) => (
            <div key={label}>
              <label className="text-white/70 text-sm mb-1 block">{label}</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete={autoComplete}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  className={`${inputClass} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={toggle}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white focus:outline-none"
                >
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}

          {/* Watch region */}
          <div>
            <label className="text-white/70 text-sm mb-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Streaming region
              {detectingRegion && (
                <span className="text-white/30 text-xs ml-1">(detecting…)</span>
              )}
            </label>
            <select
              value={watchRegion}
              onChange={(e) => setWatchRegion(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
            >
              {COUNTRIES.map(({ code, name }) => (
                <option key={code} value={code} className="bg-bg-paper text-white">
                  {name} ({code})
                </option>
              ))}
            </select>
            <p className="text-white/30 text-xs mt-1">
              Used to show which streaming services have each title in your country
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-paper disabled:opacity-50 mt-2"
          >
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
