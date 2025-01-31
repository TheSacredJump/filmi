// components/StarRating.tsx
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  initialRating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const StarRating = ({ 
  initialRating = 0, 
  onChange,
  readonly = false,
  size = 'md'
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  // Define sizes for the stars
  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  // Define gap sizes
  const gapSizes = {
    xs: 'gap-0.5',
    sm: 'gap-1',
    md: 'gap-1',
    lg: 'gap-1.5'
  };

  // Define text sizes for the rating number
  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base'
  };

  const handleStarClick = (starIndex: number, isHalfStar: boolean) => {
    if (readonly) return;
    
    const newRating = isHalfStar ? starIndex + 0.5 : starIndex + 1;
    const finalRating = rating === newRating ? 0 : newRating;
    
    setRating(finalRating);
    onChange?.(finalRating);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, starIndex: number) => {
    if (readonly) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const isHalfStar = x < rect.width / 2;
    
    setHoverRating(starIndex + (isHalfStar ? 0.5 : 1));
  };

  const renderStar = (index: number) => {
    const activeRating = hoverRating || rating;
    const isHalfStar = Math.abs(activeRating - index - 0.5) < 0.1;
    const isFullStar = activeRating > index + 0.5;
    
    return (
      <div
        key={index}
        className="relative cursor-pointer"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          handleStarClick(index, x < rect.width / 2);
        }}
        onMouseMove={(e) => handleMouseMove(e, index)}
      >
        {/* Background star */}
        <Star className={`${starSizes[size]} text-neutral-700 ${readonly ? 'cursor-default' : ''}`} />
        
        {/* Filled star */}
        <div 
          className="absolute top-0 overflow-hidden"
          style={{ 
            width: isHalfStar ? '50%' : isFullStar ? '100%' : '0%'
          }}
        >
          <Star className={`${starSizes[size]} text-yellow-400`} />
        </div>
      </div>
    );
  };

  return (
    <div 
      className={`flex items-center ${gapSizes[size]}`}
      onMouseLeave={() => !readonly && setHoverRating(0)}
    >
      {[...Array(10)].map((_, i) => renderStar(i))}
      {!readonly && (
        <span
          className={`ml-2 ${textSizes[size]} text-neutral-400 inline-block text-right`}
          style={{ width: '4ch' }} 
        >
          {(hoverRating || rating || 0).toFixed(1)}/10
        </span>
      )}
    </div>
  );
};