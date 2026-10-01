import React from 'react';
import { Star } from 'lucide-react';

interface MediaRatingProps {
  voteAverage: number;
  voteCount?: number;
  showVoteCount?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const STAR_SIZES = {
  small: 'w-3.5 h-3.5',
  medium: 'w-4 h-4',
  large: 'w-5 h-5',
};

const MediaRating: React.FC<MediaRatingProps> = ({
  voteAverage,
  voteCount,
  showVoteCount = false,
  size = 'small',
}) => {
  const ratingValue = voteAverage / 2;
  const starSize = STAR_SIZES[size];

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = ratingValue >= star;
          const halfFilled = !filled && ratingValue >= star - 0.5;
          return (
            <span key={star} className="relative inline-block">
              <Star
                className={`${starSize} text-white/20 fill-white/20`}
              />
              {(filled || halfFilled) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: filled ? '100%' : '50%' }}
                >
                  <Star className={`${starSize} text-primary fill-primary`} />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showVoteCount && voteCount !== undefined && (
        <span className="text-text-secondary text-sm">
          ({voteCount.toLocaleString()} votes)
        </span>
      )}
    </div>
  );
};

export default MediaRating;
