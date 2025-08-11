import { useState, useRef, useEffect } from "react";
import SynctubePlayer from "../components/SynctubePlayer";

export default function RoomPage({ roomId, socket }) {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const playerRef = useRef(null);
  const ignoreNextEvent = useRef(false);
  const chatContainerRef = useRef(null);

  // Extract YouTube video ID from URL
  const extractVideoId = (ytUrl) => {
    try {
      const urlObj = new URL(ytUrl);
      if (urlObj.hostname === "youtu.be") return urlObj.pathname.slice(1);
      if (urlObj.hostname.includes("youtube.com")) {
        return urlObj.searchParams.get("v");
      }
    } catch {
      return null;
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

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("video-loaded");
      socket.off("video-event");
      socket.off("chat-message");
    };
  }, [socket]);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = () => {
    if (chatInput.trim() !== "") {
      const msg = { user: "you", text: chatInput };
      socket.emit("chat-message", { roomId, msg });
      setMessages((prev) => [...prev, msg]);
      setChatInput("");
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0f0f0f] text-white overflow-hidden">
      {/* Floating Room Code Card */}
      <div className="absolute top-5 left-4 bg-[#1e1f22] border border-purple-500/60 
                      rounded-2xl shadow-lg px-6 py-3
                      backdrop-blur-sm transition transform hover:scale-105 
                      hover:shadow-[0_0_25px_rgba(168,85,247,0.9)] flex flex-col items-center gap-4 z-20">
        <h2 className="text-lg font-semibold text-purple-200 tracking-wide lowercase">
          room code:
        </h2>
        <p className="text-purple-300 font-mono font-bold text-xl">{roomId}</p>
        <button
          onClick={() => navigator.clipboard.writeText(roomId)}
          className="w-20 bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded-3xl font-semibold text-white transition"
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

      {/* Main Content: Video + Chat */}
      <div className="w-full h-full flex px-4 pt-6 pb-10 gap-4">
        {/* Video Player */}
        <div className="flex-1 flex justify-center items-center">
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

        {/* Chat Sidebar */}
        <div className="w-90 bg-[#1e1f22] border border-purple-500/60 rounded-xl flex flex-col mt-4 h-[calc(100%-5rem)]">
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {messages.map((m, i) => (
              <div key={i} className="bg-[#2b2d31] p-2 rounded-lg">
                <strong className="text-purple-400">{m.user}:</strong> {m.text}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-purple-500/40 flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="type a message.."
              className="flex-1 px-3 py-2 rounded-lg bg-[#2b2d31] border border-gray-700 text-white 
                         focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={sendMessage}
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition"
            >
              send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
