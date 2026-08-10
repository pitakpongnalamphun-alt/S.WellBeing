"use client";

import { useEffect, useRef } from "react";

export type ChromaVideoProps = {
  src: string;
  /** Square canvas size in px — the source is centre-cropped to a square. */
  size?: number;
  className?: string;
};

/**
 * Plays a green-screen video and keys the green out in real time onto a
 * <canvas>, so the subject sits transparently on any background. The green test
 * is dominance-based ("green channel clearly beats red and blue"), which is
 * robust for a pink mascot on green and needs no tuning. Processing happens at
 * display size, so it stays cheap; the source <video> is kept hidden.
 */
export function ChromaVideo({ src, size = 256, className }: ChromaVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    video.muted = true; // belt-and-braces so autoplay is allowed
    let raf = 0;
    let stopped = false;

    const render = () => {
      if (stopped) return;
      if (video.readyState >= 2 && video.videoWidth) {
        // centre-crop the largest square so a 16:9 clip isn't squashed
        const s = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - s) / 2;
        const sy = (video.videoHeight - s) / 2;
        ctx.drawImage(video, sx, sy, s, s, 0, 0, size, size);

        const frame = ctx.getImageData(0, 0, size, size);
        const d = frame.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i];
          const g = d[i + 1];
          const b = d[i + 2];
          if (g > r + 24 && g > b + 24) d[i + 3] = 0; // green-dominant → transparent
        }
        ctx.putImageData(frame, 0, 0);
      }
      raf = requestAnimationFrame(render);
    };

    const play = () => {
      video.play().catch(() => {}); // hidden + muted; ignore autoplay rejections
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
    };
  }, [src, size]);

  return (
    <>
      {/* kept in the tree (not display:none) so it keeps decoding frames */}
      <video
        ref={videoRef}
        src={src}
        muted
        loop
        autoPlay
        playsInline
        preload="auto"
        aria-hidden="true"
        style={{ position: "absolute", width: 1, height: 1, opacity: 0, pointerEvents: "none" }}
      />
      <canvas ref={canvasRef} width={size} height={size} aria-hidden="true" className={className} />
    </>
  );
}

export default ChromaVideo;
