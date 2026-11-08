import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Sun, Moon, Eye, EyeOff, Film, Image as ImageIcon } from 'lucide-react';

export const VideoBackground: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [dimLevel, setDimLevel] = useState<'light' | 'medium' | 'deep'>('medium');
  const [blurLevel, setBlurLevel] = useState<'none' | 'light' | 'frost'>('light');
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(false);
  const [showStoryboard, setShowStoryboard] = useState<boolean>(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Browser autoplay policy catch
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const cycleDimLevel = () => {
    if (dimLevel === 'light') setDimLevel('medium');
    else if (dimLevel === 'medium') setDimLevel('deep');
    else setDimLevel('light');
  };

  const cycleBlurLevel = () => {
    if (blurLevel === 'none') setBlurLevel('light');
    else if (blurLevel === 'light') setBlurLevel('frost');
    else setBlurLevel('none');
  };

  // Determine overlay classes
  const getDimClass = () => {
    switch (dimLevel) {
      case 'light':
        return 'bg-neutral-900/40 dark:bg-neutral-950/50';
      case 'deep':
        return 'bg-neutral-950/85 dark:bg-black/90';
      case 'medium':
      default:
        return 'bg-neutral-900/65 dark:bg-neutral-950/75';
    }
  };

  const getBlurClass = () => {
    switch (blurLevel) {
      case 'frost':
        return 'backdrop-blur-md';
      case 'light':
        return 'backdrop-blur-[2px]';
      case 'none':
      default:
        return 'backdrop-blur-none';
    }
  };

  return (
    <>
      {/* Video Container Fixed in Background */}
      <div className="fixed inset-0 w-full h-full -z-20 overflow-hidden pointer-events-none select-none">
        <video
          ref={videoRef}
          src="/assets/aistudio/Camera_transitioning_through_hos__20261026230954_26620750.mp4"
          poster="/assets/aistudio/A_2x3_storyboard_grid_with_20261026230832_37c55701.jpg"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover scale-[1.02] filter contrast-[1.05] brightness-95"
        />
      </div>

      {/* Dynamic Ambient Scrim / Dark Tint Overlay */}
      <div
        className={`fixed inset-0 w-full h-full -z-10 transition-colors duration-500 pointer-events-none ${getDimClass()} ${getBlurClass()}`}
        style={{
          background:
            dimLevel === 'deep'
              ? 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.85) 0%, rgba(2, 6, 23, 0.95) 100%)'
              : dimLevel === 'medium'
              ? 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.55) 0%, rgba(2, 6, 23, 0.80) 100%)'
              : 'radial-gradient(ellipse at center, rgba(15, 23, 42, 0.35) 0%, rgba(2, 6, 23, 0.60) 100%)',
        }}
      />

      {/* Floating Bottom-Left Video Ambience Control Widget */}
      <div className="fixed bottom-5 left-5 z-40 flex items-center gap-2">
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/15 text-white shadow-2xl transition-all">
          {/* Play/Pause Toggle */}
          <button
            type="button"
            onClick={togglePlay}
            className="p-2 rounded-xl hover:bg-white/15 text-white/90 hover:text-white transition"
            title={isPlaying ? 'Sitisha Video ya Nyuma (Pause Video)' : 'Cheza Video ya Nyuma (Play Video)'}
          >
            {isPlaying ? <Pause className="h-4 w-4 text-teal-400" /> : <Play className="h-4 w-4 text-amber-400" />}
          </button>

          {/* Dim Level Switcher */}
          <button
            type="button"
            onClick={cycleDimLevel}
            className="px-2.5 py-1.5 rounded-xl hover:bg-white/15 text-xs font-semibold text-white/90 flex items-center gap-1.5 transition"
            title="Badili Mwangaza wa Mandhari (Video Dimmer)"
          >
            <Sun className="h-3.5 w-3.5 text-amber-300" />
            <span className="text-[10px] uppercase tracking-wider font-mono">
              {dimLevel === 'light' ? 'Bright 40%' : dimLevel === 'medium' ? 'Dim 65%' : 'Dark 85%'}
            </span>
          </button>

          {/* Blur Toggle */}
          <button
            type="button"
            onClick={cycleBlurLevel}
            className="p-2 rounded-xl hover:bg-white/15 text-white/90 hover:text-white transition"
            title="Badili Ukungu wa Kioo (Glass Blur Level)"
          >
            <Film className="h-3.5 w-3.5 text-blue-400" />
          </button>

          {/* Storyboard Grid Preview */}
          <button
            type="button"
            onClick={() => setShowStoryboard(true)}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-600/60 hover:bg-teal-600 text-[10px] font-bold text-white transition border border-teal-400/30"
            title="Tazama Ramani ya Picha ya Hospitali (Hospital Storyboard)"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>Storyboard</span>
          </button>
        </div>
      </div>

      {/* Storyboard Modal */}
      {showStoryboard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 border border-neutral-700 rounded-3xl p-5 max-w-4xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between text-white border-b border-neutral-800 pb-3">
              <div>
                <h3 className="font-black text-sm tracking-wide text-teal-300">
                  RAMANI YA MATUKIO YA HOSPITALI (HOSPITAL STORYBOARD)
                </h3>
                <p className="text-xs text-neutral-400">
                  Mwonekano wa idara zote: OPD/IPD, PHARMACY, MAABARA, LABOUR, USS na RCH.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStoryboard(false)}
                className="p-1.5 rounded-xl bg-neutral-800 text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center">
              <img
                src="/assets/aistudio/A_2x3_storyboard_grid_with_20261026230832_37c55701.jpg"
                alt="Hospital Department Storyboard Grid"
                className="w-full max-h-[70vh] object-contain"
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => setShowStoryboard(false)}
                className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Funga (Close)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
