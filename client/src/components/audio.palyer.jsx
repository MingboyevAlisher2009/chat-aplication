import React, { useRef, useState, useEffect } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaVolumeDown,
  FaDownload,
} from "react-icons/fa";
import { HOST } from "@/utils/constants";
import { useAppStore } from "@/store";
import { IoCheckmarkDone } from "react-icons/io5";
import { IoMdCheckmark } from "react-icons/io";

const TelegramAudioPlayer = ({ message, title, downloadFile, onPlay }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      onPlay(audio, setIsPlaying);
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
    }
  };

  const handleSeek = (event) => {
    const audio = audioRef.current;
    if (audio) {
      const newTime = (event.target.value / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (event) => {
    const audio = audioRef.current;
    const newVolume = event.target.value / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("loadedmetadata", handleLoadedMetadata);
      audio.addEventListener("pause", () => setIsPlaying(false)); // Pause event listener
    }
    return () => {
      if (audio) {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audio.addEventListener("pause", () => setIsPlaying(false)); // Pause event listener
      }
    };
  }, []);

  return (
    <div className="telegram-audio-player flex items-center justify-between gap-3 p-2 bg-gray-800 rounded-lg">
      <button
        onClick={togglePlayPause}
        className="text-white text-xl focus:outline-none"
      >
        {isPlaying ? <FaPause /> : <FaPlay />}
      </button>
      <div className="flex-1">
        <span>{title}</span>
        <input
          type="range"
          min="0"
          max="100"
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={handleSeek}
          className="w-full bg-gray-700 h-1 rounded cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <div className="flex gap-5">
            <div
              className="flex items-center gap-2 group/item transition-all duration-300 relative"
              onMouseEnter={() => setIsHoveringVolume(true)}
              onMouseLeave={() => setIsHoveringVolume(false)}
            >
              {volume === 0 ? (
                <FaVolumeMute size={20} className="text-white text-xl" />
              ) : volume <= 0.5 ? (
                <FaVolumeDown size={20} className="text-white" />
              ) : (
                <FaVolumeUp size={20} className="text-white" />
              )}
              <div className="absolute bottom-16 -left-11 group-hover/item:opacity-100 flex justify-center p-3 bg-gray-900 rounded-lg -rotate-90 opacity-0">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={handleVolumeChange}
                  className="w-20 mx-auto bg-gray-700 h-1 rounded cursor-pointer"
                />
              </div>
            </div>
            <button
              onClick={() => downloadFile(message.fileUrl)}
              className="text-white "
            >
              <FaDownload size={15} />
            </button>
          </div>
        </div>
      </div>
     
      <audio ref={audioRef} src={`${HOST}/${message.fileUrl}`} />
    </div>
  );
};

export default TelegramAudioPlayer;
