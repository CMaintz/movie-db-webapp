import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { userSettingsService, UserSettings } from '../services/userSettingsService';

export const useUserSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({ streamingServiceIds: [], watchRegion: 'US' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings({ streamingServiceIds: [], watchRegion: 'US' });
      setLoading(false);
      return;
    }
    setLoading(true);
    userSettingsService.getSettings(user.uid).then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, [user]);

  const saveSettings = useCallback(
    async (newSettings: Partial<UserSettings>) => {
      if (!user) return;
      const merged = { ...settings, ...newSettings };
      setSettings(merged);
      await userSettingsService.saveSettings(user.uid, merged);
    },
    [user, settings]
  );

  return { settings, loading, saveSettings };
};
