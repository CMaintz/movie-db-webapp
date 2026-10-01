import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';
import { ArrowRight } from 'lucide-react';
import { Media } from '../types';
import MediaCard from './MediaCard';

interface MediaGridProps {
  media: Media[];
  title?: string;
  showType?: boolean;
  showViewAll?: boolean;
  viewAllPath?: string;
  onViewAll?: () => void;
  showLoadMore?: boolean;
  onLoadMore?: () => void;
  totalCount?: number;
  showCount?: boolean;
  onMediaChange?: () => void;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  media,
  title,
  showType = true,
  showViewAll = true,
  viewAllPath,
  onViewAll,
  showLoadMore = false,
  onLoadMore,
  totalCount,
  showCount = false,
  onMediaChange,
}) => {
  const navigate = useNavigate();

  const { ref, focusKey } = useFocusable({
    trackChildren: true,
    saveLastFocusedChild: true,
  });

  const handleViewAll = () => {
    if (onViewAll) onViewAll();
    else if (viewAllPath) navigate(viewAllPath);
  };

  const handleWishlistChange = (_mediaId: number, _mediaType: 'movie' | 'tv', _isWishlisted: boolean) => {
    onMediaChange?.();
  };

  const { ref: viewAllRef, focused: viewAllFocused } = useFocusable({
    onEnterPress: handleViewAll,
  });

  const { ref: loadMoreRef, focused: loadMoreFocused } = useFocusable({
    onEnterPress: onLoadMore,
  });

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref as React.RefObject<HTMLDivElement>} className="w-full mb-4">
        {/* Header row */}
        <div className="flex items-center gap-3 mb-3 flex-wrap">
          <h2 className="text-white text-xl font-semibold">{title}</h2>
          {showCount && totalCount !== undefined && (
            <span className="text-text-secondary text-sm">({totalCount.toLocaleString()} titles)</span>
          )}
          {showViewAll && (viewAllPath || onViewAll) && (
            <button
              ref={viewAllRef as React.RefObject<HTMLButtonElement>}
              onClick={handleViewAll}
              className={`flex items-center gap-1 text-primary text-sm border border-primary px-3 py-1 rounded-lg hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                viewAllFocused ? 'ring-2 ring-primary bg-primary text-white' : ''
              }`}
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          {media.map((item) => (
            <MediaCard
              key={item.id}
              media={item}
              showType={showType}
              onWishlistChange={handleWishlistChange}
            />
          ))}
        </div>

        {/* Load more */}
        {showLoadMore && onLoadMore && media.length < (totalCount || 0) && (
          <div className="flex justify-center mt-6">
            <button
              ref={loadMoreRef as React.RefObject<HTMLButtonElement>}
              onClick={onLoadMore}
              className={`text-primary border border-primary px-6 py-2 rounded-lg hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${
                loadMoreFocused ? 'ring-2 ring-primary bg-primary text-white' : ''
              }`}
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default MediaGrid;
