'use client';

import React, { useState } from 'react';
import { Play, X } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
  title: string;
  chef?: string;
  restaurant?: string;
  thumbnailQuality?: 'maxresdefault' | 'hqdefault' | 'mqdefault' | 'sddefault';
  autoplay?: boolean;
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  title,
  chef,
  restaurant,
  thumbnailQuality = 'maxresdefault',
  autoplay = true,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?${autoplay ? 'autoplay=1&' : ''}rel=0&modestbranding=1&playsinline=1`;

  if (isPlaying) {
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-black">
        <div className="relative w-full aspect-video">
          <iframe
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
        <button
          onClick={() => setIsPlaying(false)}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
          aria-label="Close video"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsPlaying(true)}
      className="relative w-full rounded-xl overflow-hidden group cursor-pointer block text-left"
      aria-label={`Play: ${title}`}
    >
      <div className="relative w-full aspect-video bg-gray-900">
        <img
          src={thumbnailUrl}
          alt={`${title}${chef ? ` by ${chef}` : ''}${restaurant ? ` at ${restaurant}` : ''} — video on 1-CUISINESG, 1-Group Singapore`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white group-hover:scale-110 flex items-center justify-center transition-all duration-300 shadow-lg">
            <Play size={28} className="text-gray-900 fill-gray-900 ml-1" />
          </div>
        </div>

        {/* Bottom info */}
        {(chef || restaurant) && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {chef && (
              <p className="text-white font-semibold text-sm drop-shadow-lg">{chef}</p>
            )}
            {restaurant && (
              <p className="text-white/80 text-xs drop-shadow-lg">{restaurant}</p>
            )}
          </div>
        )}
      </div>
    </button>
  );
};
