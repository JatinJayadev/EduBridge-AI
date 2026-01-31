import { useEffect, useRef, useState } from 'react';
import { getAudioUrl } from '../services/api';

const YT_IFRAME_API_SRC = 'https://www.youtube.com/iframe_api';

const VideoPlayer = ({ videoId, audioSegments }) => {
  // YouTube player instance
  const playerRef = useRef(null);

  // Stable DOM id for the player host element (avoid collisions / multiple mounts)
  const playerHostIdRef = useRef(
    `youtube-player-${Math.random().toString(36).slice(2)}`
  );

  const timePollRef = useRef(null);

  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Current audio element playing for the active segment
  const currentAudioRef = useRef(null);

  const stopAllAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
  };

  // Sync audio with video currentTime
  const syncAudioWithVideo = (now) => {
    if (!audioSegments || audioSegments.length === 0) return;

    const activeSegment = audioSegments.find((segment) => {
      const segmentEnd = segment.start + segment.duration;
      return now >= segment.start && now < segmentEnd;
    });

    if (!activeSegment) {
      // No audio at this timestamp
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      return;
    }

    // If already playing this segment, don't restart
    if (
      currentAudioRef.current &&
      currentAudioRef.current.dataset.segmentIndex == activeSegment.segmentIndex
    ) {
      return;
    }

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
    }

    const audio = new Audio(getAudioUrl(activeSegment.audioFilePath));
    audio.dataset.segmentIndex = activeSegment.segmentIndex;

    // Offset within this segment based on current video time
    const offset = now - activeSegment.start;
    audio.currentTime = Math.max(0, offset);

    audio.play().catch((err) => {
      // This commonly happens if the browser blocks autoplay.
      // User interaction (click Play) usually unlocks it.
      console.warn('Failed to play audio segment:', err?.message || err);
    });

    currentAudioRef.current = audio;

    audio.onended = () => {
      if (currentAudioRef.current === audio) {
        currentAudioRef.current = null;
      }
    };
  };

  // Initialize / re-initialize the YouTube IFrame player
  useEffect(() => {
    const playerHostId = playerHostIdRef.current;

    const destroyPlayer = () => {
      if (timePollRef.current) {
        clearInterval(timePollRef.current);
        timePollRef.current = null;
      }

      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        playerRef.current.destroy();
      }
      playerRef.current = null;

      setIsPlayerReady(false);
      setIsPlaying(false);
    };

    const startTimePolling = () => {
      if (timePollRef.current) clearInterval(timePollRef.current);

      timePollRef.current = setInterval(() => {
        const p = playerRef.current;
        if (!p || typeof p.getCurrentTime !== 'function') return;

        const t = p.getCurrentTime();
        setCurrentTime(t);

        const d = p.getDuration?.() || 0;
        if (d && d !== duration) setDuration(d);

        syncAudioWithVideo(t);
      }, 100);
    };

    const onPlayerReady = (event) => {
      try {
        event.target.mute();
      } catch {
        // ignore
      }

      setIsPlayerReady(true);
      setDuration(event.target.getDuration?.() || 0);
      startTimePolling();
    };

    const onPlayerStateChange = (event) => {
      // YT.PlayerState.PLAYING = 1
      // YT.PlayerState.PAUSED  = 2
      // YT.PlayerState.ENDED   = 0
      if (event.data === 1) {
        setIsPlaying(true);
      } else if (event.data === 2 || event.data === 0) {
        setIsPlaying(false);
        stopAllAudio();
      }
    };

    const initPlayer = () => {
      if (!videoId) return;

      if (!window.YT || !window.YT.Player) {
        return;
      }

      // If re-initializing, clean up first
      destroyPlayer();

      playerRef.current = new window.YT.Player(playerHostId, {
        videoId,
        playerVars: {
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    // Ensure script is loaded once
    const existingScript = document.querySelector('script[data-youtube-iframe-api="true"]');
    if (!existingScript) {
      const tag = document.createElement('script');
      tag.src = YT_IFRAME_API_SRC;
      tag.async = true;
      tag.defer = true;
      tag.dataset.youtubeIframeApi = 'true';
      document.head.appendChild(tag);
    }

    // If API is already available, init immediately
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Otherwise init when API is ready
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      destroyPlayer();
      stopAllAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, audioSegments]);

  const togglePlayPause = () => {
    const p = playerRef.current;
    if (!p || !isPlayerReady) return;

    if (isPlaying) {
      p.pauseVideo();
    } else {
      p.playVideo();
    }
  };

  const handleSeek = (e) => {
    const p = playerRef.current;
    if (!p || !isPlayerReady || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;

    p.seekTo(newTime, true);
    setCurrentTime(newTime);

    // Immediately re-sync audio after seek
    stopAllAudio();
    syncAudioWithVideo(newTime);
  };

  const formatTime = (seconds) => {
    const s = Number.isFinite(seconds) ? seconds : 0;
    const mins = Math.floor(s / 60);
    const secs = Math.floor(s % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="video-player">
      <div className="video-container">
        <div id={playerHostIdRef.current} className="youtube-player-host" />
      </div>

      <div className="controls">
        <button
          onClick={togglePlayPause}
          className="play-pause-btn"
          disabled={!isPlayerReady}
          title={!isPlayerReady ? 'Loading player…' : isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <div className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>

        <div className="progress-bar" onClick={handleSeek}>
          <div
            className="progress-filled"
            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        {audioSegments && audioSegments.length > 0 && (
          <div className="audio-indicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
            </svg>
            {audioSegments.length} segments
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;