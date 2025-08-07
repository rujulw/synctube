import YouTube from 'react-youtube';

function SynctubePlayer({ videoId, onPlayerReady, onPlayerStateChange }) {
  const opts = {
    height: '390',
    width: '640',
    playerVars: {
      autoplay: 0,
    },
  };

  return (
    <YouTube
      videoId={videoId}
      opts={opts}
      onReady={(e) => onPlayerReady(e.target)}
      onStateChange={onPlayerStateChange}
    />
  );
}

export default SynctubePlayer;
