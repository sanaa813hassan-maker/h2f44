import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

// Brand showcase videos by category
const CATEGORY_VIDEOS = {
  old_money: 'https://videos.pexels.com/video-files/7706468/7706468-hd_1920_1080_25fps.mp4',
  star_boy:  'https://videos.pexels.com/video-files/6198843/6198843-hd_1920_1080_30fps.mp4',
  essentials:'https://videos.pexels.com/video-files/7706468/7706468-hd_1920_1080_25fps.mp4',
  default:   'https://videos.pexels.com/video-files/7706468/7706468-hd_1920_1080_25fps.mp4',
};

export default function ProductVideo({ product }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const src = CATEGORY_VIDEOS[product?.category] || CATEGORY_VIDEOS.default;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
      setPlaying(false);
    } else {
      videoRef.current.play();
      setPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !muted;
    setMuted(!muted);
  };

  return (
    <section className="px-6 md:px-12 py-16 border-t border-border">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-muted-foreground">In Motion</span>
            <h2 className="font-serif text-3xl italic font-light mt-1">The Look, Alive</h2>
          </div>
          <span className="font-mono text-[9px] tracking-wider uppercase text-accent">{product?.collection || 'Archive'}</span>
        </div>

        {/* Video container */}
        <div className="relative aspect-video overflow-hidden group bg-foreground/5 grain-overlay">
          <video
            ref={videoRef}
            src={src}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent pointer-events-none" />

          {/* Play/Pause center button */}
          <motion.button
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center"
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: playing ? 0 : 1 }}
              className="w-16 h-16 rounded-full bg-background/80 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:opacity-100 transition-opacity"
              style={{ opacity: playing ? 0 : 1 }}
            >
              {playing
                ? <Pause className="w-6 h-6 text-foreground ml-0" />
                : <Play className="w-6 h-6 text-foreground ml-1" />
              }
            </motion.div>
          </motion.button>

          {/* Controls bar */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 bg-background/60 backdrop-blur-sm border border-white/10 hover:bg-background/80 transition-colors"
              >
                {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
              </button>
              <span className="font-mono text-[9px] tracking-wider text-white/80 uppercase">
                {product?.name}
              </span>
            </div>
            <button
              onClick={toggleMute}
              className="p-2 bg-background/60 backdrop-blur-sm border border-white/10 hover:bg-background/80 transition-colors"
            >
              {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Category label */}
          <div className="absolute top-4 left-4 pointer-events-none">
            <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-white/70 bg-foreground/30 backdrop-blur-sm px-3 py-1.5">
              {product?.category?.replace('_', ' ')} · H²F
            </span>
          </div>
        </div>

        {/* Caption */}
        <p className="font-body text-sm text-muted-foreground mt-4 max-w-lg italic">
          "{product?.name}" — crafted for those who move through the world with intention.
        </p>
      </motion.div>
    </section>
  );
}
