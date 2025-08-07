import { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, onPlayerReady, onPlayerStateChange }) => {
  const playerRef = useRef(null);

  useEffect(() => {
    // Load the IFrame API if it doesn't exist
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    } else {
      loadPlayer();
    }

    window.onYouTubeIframeAPIReady = loadPlayer;

    function loadPlayer() {
      if (playerRef.current) {
        new window.YT.Player(playerRef.current, {
          height: '390',
          width: '640',
          videoId: videoId,
          events: {
            onReady: (event) => {
              onPlayerReady(event.target);
            },
            onStateChange: (event) => {
              onPlayerStateChange(event);
            },
          },
        });
      }
    }
  }, [videoId]);

  return <div ref={playerRef}></div>;
};

export default YouTubePlayer;
