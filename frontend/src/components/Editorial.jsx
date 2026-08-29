import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  Minimize2,
} from "lucide-react";

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMiniPlayer, setIsMiniPlayer] = useState(false);

  const storageKey = `video-progress-${secureUrl}`;

  // Format time
  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Play / Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  // Progress update + save
  const handleTimeUpdate = () => {
    const current = videoRef.current.currentTime;
    const duration = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / duration) * 100);
    localStorage.setItem(storageKey, current);
  };

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved && videoRef.current) {
      videoRef.current.currentTime = parseFloat(saved);
    }
  }, []);

  // Seek
  const handleSeek = (e) => {
    const rect = e.target.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = percent * videoDuration;
  };

  // Volume
  const handleVolume = (e) => {
    const value = e.target.value;
    setVolume(value);
    videoRef.current.volume = value;
    setIsMuted(value == 0);
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "ArrowRight") videoRef.current.currentTime += 5;
      if (e.code === "ArrowLeft") videoRef.current.currentTime -= 5;
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isPlaying]);

  // Auto-hide controls
  useEffect(() => {
    let timeout;
    if (isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 2500);
    }
    return () => clearTimeout(timeout);
  }, [isPlaying]);

  return (
    <div className="relative">
      {/* Cinematic Background */}
      {isPlaying && (
        <div
          className="absolute inset-0 blur-3xl opacity-30 scale-110"
          style={{
            backgroundImage: `url(${thumbnailUrl})`,
            backgroundSize: "cover",
          }}
        />
      )}

      <motion.div
        ref={containerRef}
        className={`relative w-full max-w-5xl mx-auto rounded-2xl overflow-hidden bg-black shadow-2xl group aspect-video ${
          isMiniPlayer ? "fixed bottom-4 right-4 w-80 z-50" : ""
        }`}
        onMouseMove={() => setShowControls(true)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {/* Thumbnail */}
        {!isPlaying && (
          <div
            className="absolute inset-0 z-10 cursor-pointer"
            onClick={togglePlay}
          >
            <img
              src={thumbnailUrl}
              alt="thumbnail"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 text-xs rounded">
              {duration}
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="bg-white/20 backdrop-blur-lg p-4 rounded-full"
              >
                <Play className="text-white" size={32} />
              </motion.div>
            </div>
          </div>
        )}

        {/* Video */}
        <video
          ref={videoRef}
          src={secureUrl}
          className="w-full h-full object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => {
            setVideoDuration(videoRef.current.duration);
            setIsLoading(false);
          }}
          onWaiting={() => setIsLoading(true)}
          onPlaying={() => setIsLoading(false)}
        />

        {/* Loader */}
        <AnimatePresence>
          {isLoading && (
            <motion.div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Loader2 className="animate-spin text-white" size={32} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <AnimatePresence>
          {showControls && (
            <motion.div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              {/* Progress */}
              <div
                className="w-full h-1 bg-white/20 rounded cursor-pointer mb-3"
                onClick={handleSeek}
              >
                <motion.div
                  className="h-full bg-red-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex justify-between text-white">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay}>
                    {isPlaying ? <Pause /> : <Play />}
                  </button>

                  <span className="text-sm">
                    {formatTime(currentTime)} /{" "}
                    {formatTime(videoDuration)}
                  </span>

                  <div className="flex items-center gap-2">
                    {isMuted ? <VolumeX /> : <Volume2 />}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={handleVolume}
                    />
                  </div>
                </div>

                {/* Right */}
                <div className="flex items-center gap-3">
                  <select
                    value={playbackRate}
                    onChange={(e) => {
                      const rate = parseFloat(e.target.value);
                      setPlaybackRate(rate);
                      videoRef.current.playbackRate = rate;
                    }}
                    className="bg-black/50 rounded"
                  >
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>

                  <button onClick={() => setIsMiniPlayer(!isMiniPlayer)}>
                    <Minimize2 />
                  </button>

                  <button onClick={toggleFullscreen}>
                    <Maximize />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Editorial;