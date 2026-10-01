/**
 * Firestore cache for OMDb/IMDb ratings.
 * Collection: `ratings/{titleKey}` — shared across all users, public-read.
 *
 * Required Firestore rules:
 *   match /ratings/{docId} {
 *     allow read: if true;
 *     allow write: if request.auth != null;
 *   }
 *
 * With 30-day TTL each unique title is queried from OMDb at most once/month,
 * making the 1000 req/day free limit essentially irrelevant for personal use.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface RatingData {
  imdbRating: string | null;
  imdbVotes: string | null;
  rottenTomatoes: string | null;
  metacritic: string | null;
}

interface StoredRating extends RatingData {
  fetchedAt: number;
}

/** Deterministic, Firestore-safe document ID from title + year + type. */
const makeKey = (title: string, year: string | number | null, type: string): string => {
  const slug = `${title}_${year ?? 'x'}_${type}`
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 400); // Firestore doc ID ≤ 1500 bytes; be safe
  return slug;
};

export const getCachedRatings = async (
  title: string,
  year: string | number | null,
  type: string
): Promise<RatingData | null> => {
  try {
    const snap = await getDoc(doc(db, 'ratings', makeKey(title, year, type)));
    if (!snap.exists()) return null;
    const stored = snap.data() as StoredRating;
    if (Date.now() - stored.fetchedAt > TTL_MS) return null; // stale — re-fetch
    return {
      imdbRating:     stored.imdbRating,
      imdbVotes:      stored.imdbVotes,
      rottenTomatoes: stored.rottenTomatoes,
      metacritic:     stored.metacritic,
    };
  } catch {
    return null; // Firestore unavailable or rules deny — fall through to OMDb
  }
};

export const setCachedRatings = async (
  title: string,
  year: string | number | null,
  type: string,
  ratings: RatingData
): Promise<void> => {
  try {
    await setDoc(
      doc(db, 'ratings', makeKey(title, year, type)),
      { ...ratings, fetchedAt: Date.now() }
    );
  } catch {
    // Non-critical — user might not be authed yet, or rules block the write.
  }
};
