
"use client";

import { useEffect, useRef } from "react";

type AutoplayVideoProps = {
  src: string;
  poster: string;
  className?: string;
};

export function AutoplayVideo({
  src,
  poster,
  className = "",
}: AutoplayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const startPlayback = () => {
      if (video.paused) {
        video.play().catch(() => {
          // Browser may block autoplay.
          // Poster remains visible.
        });
      }
    };

    startPlayback();

    video.addEventListener("canplay", startPlayback);

    return () => {
      video.removeEventListener("canplay", startPlayback);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      aria-hidden="true"
      tabIndex={-1}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
}
