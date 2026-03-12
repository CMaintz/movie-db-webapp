import React from 'react';
import { useOmdbRatings } from '../services/omdb';
import { MediaDetails } from '../types';

interface RatingsPanelProps {
  media: MediaDetails;
  releaseYear: string | number | null;
}

const RatingsPanel: React.FC<RatingsPanelProps> = ({ media, releaseYear }) => {
  const { data: omdb } = useOmdbRatings(media.title, releaseYear, media.media_type);

  return (
    <div className="flex flex-wrap gap-4">
      {/* TMDB */}
      <div className="flex flex-col items-center bg-[#01b4e4]/10 border border-[#01b4e4]/30 rounded-xl px-4 py-3 min-w-[90px]">
        <span className="text-[0.65rem] text-white/50 uppercase tracking-wide mb-1">TMDB</span>
        <span className="text-white text-xl font-bold">{media.vote_average.toFixed(1)}</span>
        <span className="text-white/40 text-[0.65rem]">/ 10</span>
        {media.vote_count > 0 && (
          <span className="text-white/30 text-[0.6rem] mt-0.5">{media.vote_count.toLocaleString()} votes</span>
        )}
      </div>

      {/* IMDb */}
      {omdb?.imdbRating && (
        <div className="flex flex-col items-center bg-[#f5c518]/10 border border-[#f5c518]/30 rounded-xl px-4 py-3 min-w-[90px]">
          <span className="text-[0.65rem] text-white/50 uppercase tracking-wide mb-1">IMDb</span>
          <span className="text-white text-xl font-bold">{omdb.imdbRating}</span>
          <span className="text-white/40 text-[0.65rem]">/ 10</span>
          {omdb.imdbVotes && (
            <span className="text-white/30 text-[0.6rem] mt-0.5">{omdb.imdbVotes}</span>
          )}
        </div>
      )}

      {/* Rotten Tomatoes */}
      {omdb?.rottenTomatoes && (
        <div className="flex flex-col items-center bg-[#fa320a]/10 border border-[#fa320a]/30 rounded-xl px-4 py-3 min-w-[90px]">
          <span className="text-[0.65rem] text-white/50 uppercase tracking-wide mb-1">Rotten Tomatoes</span>
          <span className={`text-xl font-bold ${parseInt(omdb.rottenTomatoes) >= 60 ? 'text-green-400' : 'text-red-400'}`}>
            {omdb.rottenTomatoes}
          </span>
        </div>
      )}

      {/* Metacritic */}
      {omdb?.metacritic && (
        <div className="flex flex-col items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3 min-w-[90px]">
          <span className="text-[0.65rem] text-white/50 uppercase tracking-wide mb-1">Metacritic</span>
          <span className="text-white text-xl font-bold">{omdb.metacritic.replace('/100', '')}</span>
          <span className="text-white/40 text-[0.65rem]">/ 100</span>
        </div>
      )}
    </div>
  );
};

export default RatingsPanel;
