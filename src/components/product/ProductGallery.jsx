import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ProductGallery — Polo-style gallery
 * Supports: multiple images + video mixed in the thumbnail strip
 * Color-specific images via colorImages map
 */
export default function ProductGallery({ product, selectedColor }) {
  const {
    image_url,
    lifestyle_image_url,
    extra_images = [],
    video_url,
    color_images = {},
  } = product;

  // Build media items: images first, then video if present
  const buildMedia = () => {
    const items = [];

    // Color-specific image takes priority for the primary slot
    if (selectedColor && color_images[selectedColor]) {
      items.push({ type: 'image', src: color_images[selectedColor] });
    } else if (image_url) {
      items.push({ type: 'image', src: image_url });
    }

    if (lifestyle_image_url) items.push({ type: 'image', src: lifestyle_image_url });

    (Array.isArray(extra_images) ? extra_images : []).forEach((url) => {
      if (url) items.push({ type: 'image', src: url });
    });

    if (video_url) items.push({ type: 'video', src: video_url });

    return items;
  };

  const media = buildMedia();
  const [activeIndex, setActiveIndex] = useState(0);

  // Keep activeIndex in bounds when color changes
  const safeIndex = Math.min(activeIndex, media.length - 1);

  const prev = () => setActiveIndex((i) => (i - 1 + media.length) % media.length);
  const next = () => setActiveIndex((i) => (i + 1) % media.length);

  const current = media[safeIndex];

  return (
    <div className="flex gap-3 select-none">
      {/* Thumbnail strip (desktop) */}
      {media.length > 1 && (
        <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0 overflow-y-auto max-h-[600px]">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative w-[72px] h-[88px] overflow-hidden border-2 shrink-0 transition-all duration-200 ${
                safeIndex === i ? 'border-foreground' : 'border-transparent opacity-50 hover:opacity-90'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                  <Play className="w-4 h-4 text-foreground/60" />
                </div>
              ) : (
                <img src={item.src} alt="" className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Main viewer */}
      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${safeIndex}-${selectedColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="relative aspect-[3/4] overflow-hidden grain-overlay bg-muted"
          >
            {current?.type === 'video' ? (
              <VideoPlayer src={current.src} />
            ) : (
              <img
                src={current?.src}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/80 bg-black/40 backdrop-blur-sm px-3 py-1.5">
                {product.category?.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Arrow nav (desktop) */}
            {media.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={next}
                  className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/70 backdrop-blur-sm items-center justify-center hover:bg-background transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile thumbnails strip */}
        {media.length > 1 && (
          <div className="flex gap-2 mt-2 md:hidden overflow-x-auto pb-1">
            {media.map((item, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative w-16 h-20 overflow-hidden border-2 shrink-0 transition-all ${
                  safeIndex === i ? 'border-foreground' : 'border-transparent opacity-50'
                }`}
              >
                {item.type === 'video' ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-3 h-3 text-muted-foreground" />
                  </div>
                ) : (
                  <img src={item.src} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VideoPlayer({ src }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <div className="w-full h-full relative">
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-cover"
        loop
        muted={muted}
        playsInline
        onClick={togglePlay}
      />
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          onClick={togglePlay}
          className="w-9 h-9 bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={toggleMute}
          className="w-9 h-9 bg-background/70 backdrop-blur-sm flex items-center justify-center hover:bg-background transition-colors"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
