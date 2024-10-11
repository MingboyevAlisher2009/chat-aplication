import { HOST } from "@/utils/constants";
import { useRef, useState, useEffect } from "react";
import {
  FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaVolumeDown, FaDownload,
} from "react-icons/fa";

const VideoPlayer = ({ message, downloadFile, onPlay }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(`${HOST}/${message.fileUrl}`);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [qualityMenuOpen, setQualityMenuOpen] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const updateTime = () => setCurrentTime(video.currentTime);
      const updateDuration = () => setDuration(video.duration);
      const handleVideoEnd = () => setIsPlaying(false);

      video.addEventListener("timeupdate", updateTime);
      video.addEventListener("loadedmetadata", updateDuration);
      video.addEventListener("ended", handleVideoEnd);
      video.addEventListener("pause", () => setIsPlaying(false));

      return () => {
        video.removeEventListener("timeupdate", updateTime);
        video.removeEventListener("loadedmetadata", updateDuration);
        video.removeEventListener("ended", handleVideoEnd);
        video.removeEventListener("pause", () => setIsPlaying(false));
      };
    }
  }, []);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      onPlay(video);
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleProgressChange = (event) => {
    const video = videoRef.current;
    if (video) {
      const newTime = (event.target.value / 100) * duration;
      video.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const changeQuality = (newSrc) => {
    setCurrentSrc(newSrc);
    const video = videoRef.current;
    if (video) {
      video.src = newSrc;
      video.load();
      video.play();
    }
    setQualityMenuOpen(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div style={{ maxHeight: `${window.innerHeight}px` }} className="relative max-w-3xl bg-cover object-cover bg-gray-900 rounded-lg overflow-hidden shadow-lg">
      <div onClick={togglePlayPause} className="group/video">
        <video ref={videoRef} src={currentSrc} className="w-full bg-cover bg-center object-cover" controls={false} />
        <button className="text-white text-xl opacity-0 group-hover/video:opacity-100 transition-all duration-300 focus:outline-none absolute z-50 top-2/4 left-2/4 bg-black/20 backdrop-blur-lg p-5 rounded-full">
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
      </div>
      <div className="absolute bottom-0 px-3 w-full bg-gray-800 bg-opacity-60 flex items-center justify-between p-2">
        <div className="flex-1 mx-2 px-3">
          <input
            type="range"
            min="0"
            max="100"
            value={duration ? (currentTime / duration) * 100 : 0}
            onChange={handleProgressChange}
            className="w-full bg-gray-700 h-1 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-white text-sm mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex gap-5 items-center">
          <button onClick={toggleMute} className="text-white text-xl focus:outline-none">
            {isMuted ? <FaVolumeMute /> : volume <= 0.5 ? <FaVolumeDown /> : <FaVolumeUp />}
          </button>
          <button
            onClick={() =>
              document.fullscreenElement
                ? document.exitFullscreen()
                : videoRef.current?.requestFullscreen?.() || videoRef.current?.webkitRequestFullscreen?.()
            }
            className="text-white text-xl focus:outline-none"
          >
            ⛶
          </button>
          <button onClick={() => downloadFile(message.fileUrl)} className="text-white text-xl focus:outline-none">
            <FaDownload />
          </button>
        </div>
        {qualityMenuOpen && (
          <div className="absolute top-full right-0 bg-gray-800 text-white p-2 rounded shadow-lg">
            <button onClick={() => changeQuality("low-quality.mp4")} className="block">
              Low Quality
            </button>
            <button onClick={() => changeQuality("medium-quality.mp4")} className="block">
              Medium Quality
            </button>
            <button onClick={() => changeQuality("high-quality.mp4")} className="block">
              High Quality
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
