import { useState, useRef, useEffect } from "react";
import SynctubePlayer from "../components/SynctubePlayer";

export default function RoomPage({ roomId, socket, username }) {
  const [url, setUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChatMobile, setShowChatMobile] = useState(false);
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
      socket.emit("load-video", { roomId, videoId: id });
      setUrl("");
    } else {
      alert("Invalid YouTube URL");
    }
  };

  useEffect(() => {
    const handleVideoLoaded = (id) => {
      setVideoId(id);
      if (playerRef.current && playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(id);
      }
    };

    const handleVideoEvent = (event) => {
      if (playerRef.current) {
        ignoreNextEvent.current = true;
        if (event.type === "play") playerRef.current.playVideo();
        else if (event.type === "pause") playerRef.current.pauseVideo();
      }
    };

    const handleChatMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleChatHistory = (history) => {
      setMessages(history);
    };

    socket.on("video-loaded", handleVideoLoaded);
    socket.on("video-event", handleVideoEvent);
    socket.on("chat-message", handleChatMessage);
    socket.on("chat-history", handleChatHistory);

    socket.emit("join-room", roomId);

    return () => {
      socket.off("video-loaded", handleVideoLoaded);
      socket.off("video-event", handleVideoEvent);
      socket.off("chat-message", handleChatMessage);
      socket.off("chat-history", handleChatHistory);
    };
  }, [socket, roomId]);

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
      const msg = { user: username, text: chatInput };
      socket.emit("chat-message", { roomId, msg });
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

      {/* Main Content */}
      <div className="w-full h-full flex flex-col lg:flex-row px-4 pt-20 pb-4 gap-4">
        {/* Video Player - Adjusted height */}
        <div className="w-full lg:w-3/4 h-[60vh] lg:h-[80vh] flex justify-center items-center">
          {videoId && (
            <div className="w-full h-full max-w-5xl aspect-video rounded-xl overflow-hidden shadow-lg 
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

        {/* Chat Sidebar - Adjusted height and layout */}
        <div className={`${showChatMobile ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-1/4 h-[35vh] lg:h-[80vh] bg-[#1e1f22] border border-purple-500/60 rounded-xl`}>
          {/* Chat Header with toggle button (mobile only) */}
          <div className="lg:hidden flex justify-between items-center p-2 border-b border-purple-500/40">
            <h3 className="text-purple-300 font-semibold">Chat</h3>
            <button 
              onClick={() => setShowChatMobile(false)}
              className="text-purple-400 hover:text-purple-200 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          {/* Messages - Adjusted to ensure input is always visible */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {messages.map((m, i) => (
              <div key={i} className="bg-[#2b2d31] p-2 rounded-lg break-words">
                <strong className="text-purple-400">{m.user}:</strong> <span className="whitespace-pre-wrap">{m.text}</span>
              </div>
            ))}
          </div>

          {/* Input - Now always visible without scrolling */}
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

        {/* Mobile Chat Toggle Button (only visible on mobile) */}
        <button 
          onClick={() => setShowChatMobile(true)}
          className="lg:hidden fixed bottom-4 right-4 bg-purple-600 hover:bg-purple-700 p-3 rounded-full shadow-lg z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>
    </div>
  );
}