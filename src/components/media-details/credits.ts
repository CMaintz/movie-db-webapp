import { MediaDetails } from '../../types';

export type CrewMember = MediaDetails['credits']['crew'][number];

/** Jobs that count as "created this show" — TMDB spreads the credit across several. */
const CREATOR_JOBS = ['Creator', 'Executive Producer', 'Showrunner'];

/** Series have no single director, so they return null rather than a first-listed guess. */
export const getDirector = (media: MediaDetails): CrewMember | null => {
  if (media.media_type !== 'movie') return null;
  return media.credits?.crew?.find((p) => p.job === 'Director') ?? null;
};

/** Order is TMDB's, which roughly tracks billing — callers rely on [0] being primary. */
export const getCreators = (media: MediaDetails): CrewMember[] => {
  if (media.media_type !== 'tv') return [];
  return media.credits?.crew?.filter((p) => CREATOR_JOBS.includes(p.job)) ?? [];
};
