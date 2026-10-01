import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface UserSettings {
  streamingServiceIds: number[]; // TMDB provider IDs the user subscribes to
  watchRegion: string;           // ISO 3166-1 alpha-2, e.g. "US"
}

const DEFAULT_SETTINGS: UserSettings = {
  streamingServiceIds: [],
  watchRegion: '',
};

export const userSettingsService = {
  getSettings: async (userId: string): Promise<UserSettings> => {
    if (!userId) return DEFAULT_SETTINGS;
    try {
      const snap = await getDoc(doc(db, 'users', userId, 'meta', 'settings'));
      if (snap.exists()) {
        return { ...DEFAULT_SETTINGS, ...snap.data() } as UserSettings;
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings: async (userId: string, settings: UserSettings): Promise<void> => {
    if (!userId) return;
    await setDoc(doc(db, 'users', userId, 'meta', 'settings'), settings, { merge: true });
  },
};
