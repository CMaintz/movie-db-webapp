import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit, LogOut, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUserSettings } from '../hooks/useUserSettings';
import { KNOWN_STREAMING_SERVICES } from '../utils/streamingServices';
import { COUNTRIES } from '../utils/geoRegion';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { settings, loading: settingsLoading, saveSettings } = useUserSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // TODO: implement display name update via Firebase updateProfile
      toast.success('Profile updated');
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

  const toggleService = async (serviceId: number) => {
    const current = settings.streamingServiceIds;
    const updated = current.includes(serviceId)
      ? current.filter((id) => id !== serviceId)
      : [...current, serviceId];
    await saveSettings({ streamingServiceIds: updated });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white text-lg">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 flex flex-col gap-6">
      <h1 className="text-white text-2xl font-bold text-center">My Profile</h1>

      {error && (
        <div className="bg-red-500/15 border border-red-500/40 text-red-400 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Account card */}
      <div className="bg-bg-paper border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <p className="text-white font-semibold text-lg">{user.displayName || 'User'}</p>
        </div>

        <hr className="border-white/10 mb-6" />

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-white/70 text-sm mb-1 block">Email</label>
            <input
              type="email"
              value={user.email || ''}
              disabled
              className="w-full bg-white/5 border border-white/10 text-white/60 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-white/70 text-sm mb-1 block">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-semibold py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <Edit className="w-4 h-4" />
            {loading ? 'Updating…' : 'Update Profile'}
          </button>
        </form>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full mt-4 border border-red-500/40 text-red-400 hover:border-red-400 hover:bg-red-500/10 font-medium py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Streaming services card */}
      <div className="bg-bg-paper border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">My Streaming Services</h2>
        <p className="text-text-secondary text-xs mb-4">
          Select the services you subscribe to. Use the "My services" filter in Browse and Roulette to show only content available to you.
        </p>

        {settingsLoading ? (
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-24 h-10 animate-pulse bg-white/10 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {KNOWN_STREAMING_SERVICES.map((service) => {
              const selected = settings.streamingServiceIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${
                    selected
                      ? 'border-primary bg-primary/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {service.name}
                  {selected && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Streaming region card */}
      <div className="bg-bg-paper border border-white/10 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          Streaming Region
        </h2>
        <p className="text-text-secondary text-xs mb-4">
          Determines which streaming services are shown as available for each title.
        </p>

        <select
          value={settings.watchRegion || 'US'}
          onChange={(e) => saveSettings({ watchRegion: e.target.value })}
          disabled={settingsLoading}
          className="w-full bg-black/20 border border-white/10 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50 appearance-none"
        >
          {COUNTRIES.map(({ code, name }) => (
            <option key={code} value={code} className="bg-bg-paper text-white">
              {name} ({code})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ProfilePage;
