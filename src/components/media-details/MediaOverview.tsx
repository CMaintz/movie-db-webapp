import React from 'react';
import RatingsPanel from '../RatingsPanel';
import DetailCard from './DetailCard';
import { MediaDetails, MovieDetails } from '../../types';
import { CrewMember, getCreators, getDirector } from './credits';

const CreditPortrait: React.FC<{ person: CrewMember; size: string }> = ({ person, size }) =>
  person.profile_path ? (
    <img
      src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
      alt={person.name}
      className={`${size} rounded-full object-cover object-top border border-white/20`}
    />
  ) : (
    <div className={`${size} rounded-full bg-gray-700 animate-pulse`} />
  );

const MediaOverview: React.FC<{ media: MediaDetails }> = ({ media }) => {
  const movieMedia = media.media_type === 'movie' ? (media as MovieDetails) : null;
  const director = getDirector(media);
  const creators = getCreators(media);

  const releaseYear = movieMedia?.release_date
    ? new Date(movieMedia.release_date).getFullYear()
    : null;

  return (
    <DetailCard>
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Poster */}
        <div className="w-full sm:w-36 flex-shrink-0">
          {media.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w500${media.poster_path}`}
              alt={media.title}
              className="w-full rounded-xl aspect-[2/3] object-cover shadow-lg"
            />
          ) : (
            <div className="w-full aspect-[2/3] rounded-xl bg-gray-800 animate-pulse" />
          )}
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <RatingsPanel media={media} releaseYear={releaseYear} />

          <div>
            <h2 className="text-white font-semibold mb-2">Overview</h2>
            <p className="text-white/80 text-sm leading-relaxed">{media.overview}</p>
          </div>

          {director && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">Director</h3>
              <div className="flex items-center gap-3">
                <CreditPortrait person={director} size="w-12 h-12" />
                <span className="text-white text-sm">{director.name}</span>
              </div>
            </div>
          )}

          {creators.length > 0 && (
            <div>
              <h3 className="text-white font-semibold text-sm mb-2">
                Creator{creators.length > 1 ? 's' : ''}
              </h3>
              <div className="flex flex-wrap gap-3">
                {creators.slice(0, 2).map((creator) => (
                  <div key={creator.id} className="flex items-center gap-2">
                    <CreditPortrait person={creator} size="w-10 h-10" />
                    <span className="text-white text-sm">{creator.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DetailCard>
  );
};

export default MediaOverview;
