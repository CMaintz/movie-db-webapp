import React, { useState } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import DetailCard from './DetailCard';
import { MediaDetails } from '../../types';

const MAX_BILLED = 10;

const MediaCast: React.FC<{ media: MediaDetails }> = ({ media }) => {
  // Pausing on swipe stops the carousel fighting the user mid-drag.
  const [autoPlay, setAutoPlay] = useState(true);

  const cast = media.credits?.cast ?? [];
  if (cast.length === 0) return null;

  // TMDB can list the same actor twice when they play multiple roles.
  const billed = cast
    .filter((actor, index, self) => index === self.findIndex((a) => a.id === actor.id))
    .slice(0, MAX_BILLED);

  return (
    <DetailCard>
      <h2 className="text-white font-semibold mb-4">Cast</h2>
      <Carousel
        showThumbs={false}
        showStatus={false}
        showIndicators={false}
        infiniteLoop
        centerMode
        centerSlidePercentage={22}
        swipeable
        emulateTouch
        showArrows
        autoPlay={autoPlay}
        interval={3000}
        stopOnHover
        onSwipeStart={() => setAutoPlay(false)}
        onSwipeEnd={() => setAutoPlay(true)}
      >
        {billed.map((actor) => (
          <div key={actor.id} className="px-2 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/20 shadow-md mx-auto relative">
              {actor.profile_path ? (
                <img
                  src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                  alt={actor.name}
                  className="w-full h-full object-cover object-[center_20%]"
                />
              ) : (
                <div className="w-full h-full animate-pulse bg-gray-700" />
              )}
            </div>
            <p className="text-white text-xs font-semibold mt-2 leading-tight">{actor.name}</p>
            <p className="text-text-secondary text-[0.65rem] leading-tight">{actor.character}</p>
          </div>
        ))}
      </Carousel>
    </DetailCard>
  );
};

export default MediaCast;
