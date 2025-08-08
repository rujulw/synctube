import { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./pages/LandingPage";
import SynctubePlayer from "./components/SynctubePlayer";

const socket = io("https://synctube-backend.onrender.com");

function App() {
  const [joined, setJoined] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const playerRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => console.log("✅ Connected:", socket.id));

    socket.on("video-loaded", (id) => setVideoId(id));

    socket.on("video-event", (event) => {
      if (playerRef.current) {
        if (event.type === "play") playerRef.current.playVideo();
        else if (event.type === "pause") playerRef.current.pauseVideo();
      }
    });

    return () => {
      socket.off("connect");
      socket.off("video-loaded");
      socket.off("video-event");
    };
  }, []);

  const generateRoomCode = () =>
    Math.random().toString(36).substring(2, 8).toUpperCase();

  const createRoom = () => {
    const newRoom = generateRoomCode();
    setRoomId(newRoom);
    socket.emit("join-room", newRoom);
    setJoined(true);
  };

  const joinRoom = (code) => {
    if (code.trim()) {
      socket.emit("join-room", code.toUpperCase());
      setRoomId(code.toUpperCase());
      setJoined(true);
    }
  };

  const loadVideo = () => {
    const id = extractVideoId(url);
    if (id) {
      setVideoId(id);
      socket.emit("load-video", { roomId, videoId: id });
    } else {
      alert("Invalid YouTube URL");
    }
  };

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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {!joined ? (
          <LandingPage onCreateRoom={createRoom} onJoinRoom={joinRoom} />
        ) : (
          <div className="p-8 max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4">
              Room:{" "}
              <span className="text-purple-400 font-mono">{roomId}</span>
            </h2>

            <div className="flex mb-6">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL"
                className="flex-1 px-4 py-2 rounded-l-xl text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={loadVideo}
                className="bg-purple-600 hover:bg-purple-700 transition px-4 py-2 rounded-r-xl font-semibold"
              >
                load video
              </button>
            </div>

            {videoId && (
              <div className="rounded-xl overflow-hidden shadow-lg border border-purple-700 hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition">
                <SynctubePlayer
                  videoId={videoId}
                  onPlayerReady={(player) => (playerRef.current = player)}
                  onPlayerStateChange={(event) =>
                    socket.emit("video-event", {
                      roomId,
                      event: {
                        type: event.data === 1 ? "play" : "pause",
                      },
                    })
                  }
                />
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
