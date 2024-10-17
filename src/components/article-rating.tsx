'use client';

import React, { useState } from 'react';

interface ArticleRatingProps {
  onRatingSubmit: (rating: number) => void;
}

export default function ArticleRating({ onRatingSubmit }: ArticleRatingProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setHasRated(true);
    onRatingSubmit(rating);
  };

  return (
    <div className="my-8 text-center">
      <h2 className="text-xl font-semibold mb-4">How did we do?</h2>
      <div className="flex justify-center space-x-4">
        {["😍", "😊", "😐"].map((emoji, index) => (
          <button
            key={index}
            className={`text-4xl hover:scale-110 transition-transform ${selectedRating === 3 - index ? 'text-yellow-500' : ''}`}
            onClick={() => handleRatingClick(3 - index)}
            disabled={hasRated}
          >
            {emoji}
          </button>
        ))}
      </div>
      {hasRated && <p className="mt-2">Thank you for your feedback!</p>}
    </div>
  );
}