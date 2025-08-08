import YouTube from "react-youtube";

export default function SynctubePlayer({ videoId, onPlayerReady, onPlayerStateChange }) {
  const opts = {
    width: "100%",
    height: "100%",
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  return (
    <div className="w-full h-full">
      <YouTube
        videoId={videoId}
        opts={opts}
        onReady={(e) => onPlayerReady(e.target)}
        onStateChange={onPlayerStateChange}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  );
}
