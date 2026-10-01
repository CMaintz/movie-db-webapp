import React from 'react';
import DetailCard from './DetailCard';
import { MediaDetails, SeriesDetails } from '../../types';
import { formatSeasonYear } from '../../utils/mediaDate';

const MediaSeasons: React.FC<{ media: MediaDetails }> = ({ media }) => {
  if (media.media_type !== 'tv') return null;

  const seasons = (media as SeriesDetails).seasons ?? [];
  if (seasons.length === 0) return null;

  return (
    <DetailCard>
      <h2 className="text-white font-semibold mb-4">Seasons</h2>
      <div className="flex flex-col gap-4">
        {seasons.map((season) => (
          <div key={season.id} className="flex gap-3 items-center">
            {season.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w154${season.poster_path}`}
                alt={season.name}
                className="w-14 rounded-md object-cover flex-shrink-0"
                style={{ aspectRatio: '2/3' }}
              />
            ) : (
              <div className="w-14 flex-shrink-0 aspect-[2/3] rounded-md animate-pulse bg-gray-700" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{season.name}</p>
              <p className="text-text-secondary text-xs">{season.episode_count} episodes</p>
              <p className="text-text-secondary text-xs">{formatSeasonYear(season.air_date)}</p>
            </div>
          </div>
        ))}
      </div>
    </DetailCard>
  );
};

export default MediaSeasons;
