'use client';

import React, { useState } from 'react';
import { HeartHandshake, Meh, ThumbsDown } from 'lucide-react';

interface ArticleRatingProps {
  onRatingSubmit: (rating: number) => void;
}

export default function ArticleRating({ onRatingSubmit }: ArticleRatingProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setSubmitted(true);
    onRatingSubmit(rating);
  };

  const ratingOptions = [
    { icon: HeartHandshake, label: 'Love it', color: 'text-green-500', bgColor: 'bg-green-100', hoverColor: 'hover:bg-green-200' },
    { icon: Meh, label: 'Meh', color: 'text-yellow-500', bgColor: 'bg-yellow-100', hoverColor: 'hover:bg-yellow-200' },
    { icon: ThumbsDown, label: 'Not Happy', color: 'text-red-500', bgColor: 'bg-red-100', hoverColor: 'hover:bg-red-200' },
  ];

  return (
    <div className="my-8 p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
      <h3 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">How did we do?</h3>
      {!submitted ? (
        <div className="flex justify-center space-x-4 sm:space-x-8">
          {ratingOptions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleRatingClick(index + 1)}
              className={`flex flex-col items-center p-4 rounded-lg transition-all duration-300 transform hover:scale-105 ${item.bgColor} ${item.hoverColor} ${selectedRating === index + 1 ? 'ring-4 ring-offset-2 ring-gray-300 dark:ring-gray-700' : ''}`}
              aria-label={item.label}
            >
              <item.icon className={`${item.color} mb-2`} size={40} />
              <span className={`text-sm font-medium ${item.color}`}>{item.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl text-green-600 dark:text-green-400 font-semibold mb-2">Thank you for your feedback!</p>
          <p className="text-gray-600 dark:text-gray-400">Your input helps us improve our content.</p>
        </div>
      )}
    </div>
  );
}