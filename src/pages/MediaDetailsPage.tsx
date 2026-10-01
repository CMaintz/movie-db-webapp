import React from 'react';
import { useParams } from 'react-router-dom';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { useMediaDetails } from '../services/api';
import { config } from '../config';
import { useWatchRegion } from '../hooks/useWatchRegion';
import WatchProviderButtons from '../components/WatchProviderButtons';
import DetailCard from '../components/media-details/DetailCard';
import MediaHeader from '../components/media-details/MediaHeader';
import MediaOverview from '../components/media-details/MediaOverview';
import MediaCast from '../components/media-details/MediaCast';
import MediaTrailer from '../components/media-details/MediaTrailer';
import MediaSeasons from '../components/media-details/MediaSeasons';

/**
 * Composes the details sections. Each section decides for itself whether it has
 * anything to show and returns null if not, so this file stays a layout.
 */
const MediaDetailsPage: React.FC = () => {
  const { mediaType, id } = useParams<{ mediaType: string; id: string }>();
  const { data: media, isLoading, error } = useMediaDetails(
    mediaType as 'movie' | 'tv',
    Number(id)
  );
  const watchRegion = useWatchRegion();

  const { ref: pageRef, focusKey } = useFocusable({
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-red-400">{(error as Error)?.message || 'Media not found'}</p>
      </div>
    );
  }

  return (
    <FocusContext.Provider value={focusKey}>
      <div
        ref={pageRef as React.RefObject<HTMLDivElement>}
        className="flex flex-col min-h-full w-full relative bg-bg-default"
      >
        <MediaHeader media={media} />

        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 pb-16 flex flex-col gap-6">
          <MediaOverview media={media} />

          {config.tmdbReadToken && (
            <DetailCard>
              <WatchProviderButtons
                mediaType={media.media_type}
                mediaId={media.id}
                region={watchRegion}
              />
            </DetailCard>
          )}

          <MediaCast media={media} />
          <MediaTrailer media={media} />
          <MediaSeasons media={media} />
        </div>
      </div>
    </FocusContext.Provider>
  );
};

export default MediaDetailsPage;
