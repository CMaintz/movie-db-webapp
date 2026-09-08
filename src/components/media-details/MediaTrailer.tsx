import React from 'react';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import DetailCard from './DetailCard';
import { MediaDetails } from '../../types';

const MediaTrailer: React.FC<{ media: MediaDetails }> = ({ media }) => {
  const { ref, focused } = useFocusable();

  const trailer = media.videos?.results?.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer'
  );
  if (!trailer) return null;

  return (
    <DetailCard>
      <h2 className="text-white font-semibold mb-4">Trailer</h2>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={`relative w-full ${focused ? 'ring-2 ring-primary rounded-xl' : ''}`}
        style={{ paddingTop: '56.25%' }}
      >
        <iframe
          className="absolute inset-0 w-full h-full rounded-xl border-0"
          src={`https://www.youtube.com/embed/${trailer.key}?autoplay=0&rel=0&modestbranding=1`}
          title="Trailer"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </DetailCard>
  );
};

export default MediaTrailer;
