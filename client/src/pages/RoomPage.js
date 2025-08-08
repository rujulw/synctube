import { useState, useRef, useEffect } from "react";
import SynctubePlayer from "../components/SynctubePlayer";

export default function RoomPage({ roomId, socket }) {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const playerRef = useRef(null);
  const ignoreNextEvent = useRef(false);

  // Extract YouTube video ID from URL
  const extractVideoId = (ytUrl) => {
    try {
      const urlObj = new URL(ytUrl);
      if (urlObj.hostname === "youtu.be") return urlObj.pathname.slice(1);
      if (urlObj.hostname.includes("youtube.com"))
        return urlObj.searchParams.get("v");
    } catch {
      return null;
    }
  };

  // Handle loading a video
  const loadVideo = () => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      socket.emit("load-video", { roomId, videoId: id });
    } else {
      alert("Invalid YouTube URL");
    }
  };

  // Receive loaded videos from others
  useEffect(() => {
    socket.on("video-loaded", (id) => {
      setVideoId(id);
    });

    socket.on("video-event", (event) => {
      if (playerRef.current) {
        ignoreNextEvent.current = true;
        if (event.type === "play") playerRef.current.playVideo();
        else if (event.type === "pause") playerRef.current.pauseVideo();
      }
    });

    return () => {
      socket.off("video-loaded");
      socket.off("video-event");
    };
  }, [socket]);

  return (
    <div className="relative w-full h-screen bg-[#0f0f0f] text-white overflow-hidden">

      {/* Floating Room Code Card */}
      <div className="absolute top-8 right-10 bg-[#1e1f22] border border-purple-500/60 
                      rounded-2xl shadow-lg px-6 py-6 min-w-[160px]
                      backdrop-blur-sm transition transform hover:scale-105 
                      hover:shadow-[0_0_25px_rgba(168,85,247,0.9)] flex flex-col items-center gap-4">
        <h2 className="text-lg font-semibold text-purple-200 tracking-wide lowercase">
          room code:
        </h2>
        <p className="text-purple-300 font-mono font-bold text-3xl">{roomId}</p>
        <button
          onClick={() => navigator.clipboard.writeText(roomId)}
          className="w-full bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-xl font-semibold text-white transition"
        >
          copy
        </button>
      </div>

      {/* URL Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl flex gap-2 z-10">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste YouTube URL"
          className="flex-1 px-4 py-3 rounded-xl bg-[#2b2d31] border border-gray-700 text-white 
                     focus:outline-none focus:ring-2 focus:ring-purple-500 lowercase"
        />
        <button
          onClick={loadVideo}
          className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-2xl font-semibold transition"
        >
          load video
        </button>
      </div>

      {/* Video Player */}
      <div className="w-full h-full flex justify-center items-center px-4 pt-18 pb-6">
        {videoId && (
          <div className="w-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-lg 
                          border border-purple-700 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition">
            <SynctubePlayer
              videoId={videoId}
              onPlayerReady={(player) => (playerRef.current = player)}
              onPlayerStateChange={(event) => {
                if (ignoreNextEvent.current) {
                  ignoreNextEvent.current = false;
                  return;
                }
                socket.emit("video-event", {
                  roomId,
                  event: {
                    type: event.data === 1 ? "play" : "pause",
                  },
                });
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}