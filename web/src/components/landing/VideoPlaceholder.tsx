'use client';

import { useRef, useState } from 'react';

export function VideoPlaceholder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlayClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
        setHasStarted(true);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div
        className="relative rounded-[22px] overflow-hidden cursor-pointer"
        style={{
          background: 'var(--ink)',
          boxShadow: 'var(--shadow-elevated)',
        }}
        onClick={handlePlayClick}
      >
        <video
          ref={videoRef}
          className="w-full h-auto"
          playsInline
          onEnded={handleVideoEnd}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        >
          <source src="/demo-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Play/Pause overlay */}
        <div
          className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
            isPlaying && hasStarted ? 'opacity-0 hover:opacity-100' : 'opacity-100'
          }`}
          style={{
            background: isPlaying && hasStarted ? 'transparent' : 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center transition-transform hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, var(--cta-start), var(--cta-end))',
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            }}
          >
            {isPlaying ? (
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
