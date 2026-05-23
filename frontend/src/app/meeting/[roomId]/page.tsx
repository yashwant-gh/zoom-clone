"use client";

import { Video, Mic, MicOff, VideoOff, Shield, Link as LinkIcon, AlertCircle } from "lucide-react";
import { useEffect, useRef, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useWebRTC } from "@/hooks/useWebRTC";
import { cn } from "@/lib/utils";

// Separate VideoComponent for easier ref management
function VideoTile({ stream, isMuted, isLocal, name }: { stream: MediaStream | null, isMuted?: boolean, isLocal?: boolean, name: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasVideo, setHasVideo] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    const checkVideo = () => {
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        setHasVideo(videoTracks.length > 0 && videoTracks[0].enabled);
      } else {
        setHasVideo(false);
      }
    };
    
    checkVideo();
    const interval = setInterval(checkVideo, 1000);
    return () => clearInterval(interval);
  }, [stream]);

  return (
    <div className="relative w-full h-full bg-zinc-800 rounded-2xl overflow-hidden group min-h-[200px] border border-zinc-700/50 shadow-sm flex items-center justify-center">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-300", 
          isLocal ? "scale-x-[-1]" : "",
          hasVideo ? "opacity-100" : "opacity-0"
        )}
      />
      
      {!hasVideo && (
        <div className="w-24 h-24 bg-zinc-700 rounded-full flex items-center justify-center text-4xl text-white font-medium z-10 shadow-lg">
          {name.charAt(0)}
        </div>
      )}

      <div className="absolute bottom-4 left-4 flex items-center space-x-2 z-20">
        <div className="bg-black/60 px-3 py-1.5 rounded-lg text-white text-sm font-medium backdrop-blur-md flex items-center shadow-sm">
          {isMuted && <MicOff className="w-3.5 h-3.5 mr-2 text-red-500" />}
          {name} {isLocal && "(You)"}
        </div>
      </div>
    </div>
  );
}

function MeetingRoomContent() {
  const params = useParams();
  const roomId = params?.roomId as string;
  
  const searchParams = useSearchParams();
  const userName = searchParams?.get('name') || "Guest";
  const router = useRouter();
  
  const [userId] = useState(() => uuidv4());
  
  const { localStream, peers, toggleAudio, toggleVideo } = useWebRTC(roomId, userId, userName);
  
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);

  const handleToggleAudio = () => {
    const isEnabled = toggleAudio();
    setIsAudioEnabled(isEnabled);
  };

  const handleToggleVideo = () => {
    const isEnabled = toggleVideo();
    setIsVideoEnabled(isEnabled);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      const link = `${window.location.origin}/join?id=${roomId}`;
      navigator.clipboard.writeText(link);
      toast.success("Invite link copied!");
    }
  };

  const activePeers = Object.entries(peers);
  const totalParticipants = activePeers.length + 1;
  
  const gridClasses = 
    totalParticipants === 1 ? "grid-cols-1" :
    totalParticipants <= 4 ? "grid-cols-2" :
    totalParticipants <= 6 ? "grid-cols-2 md:grid-cols-3" :
    "grid-cols-3 md:grid-cols-4";

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-white overflow-hidden">
      
      {/* Top Bar */}
      <header className="h-16 flex items-center justify-between px-6 bg-zinc-900/90 border-b border-zinc-800 shrink-0 z-10 relative">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-green-500">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">End-to-End Encrypted</span>
          </div>
        </div>

        <button 
          onClick={handleCopyLink}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg hover:bg-zinc-800 text-zinc-300 transition-colors text-sm cursor-pointer"
        >
          <LinkIcon className="w-4 h-4" />
          <span>Copy Invite Link</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 p-4 relative overflow-y-auto flex items-center justify-center max-w-7xl mx-auto w-full">
          <div className={cn("w-full h-full max-h-[85vh] grid gap-4 p-4", gridClasses)}>
            {/* Local User */}
            <VideoTile stream={localStream} isLocal name={userName} isMuted={!isAudioEnabled} />
            
            {/* Remote Users */}
            {activePeers.map(([id, peer]: [string, any]) => (
              <VideoTile key={id} stream={peer.stream} name={peer.userName} />
            ))}

            {/* Waiting State Overlay */}
            {totalParticipants === 1 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/50 backdrop-blur-md px-6 py-4 rounded-2xl flex flex-col items-center space-y-3 pointer-events-auto">
                  <AlertCircle className="w-8 h-8 text-blue-400" />
                  <p className="text-lg font-medium text-white">Waiting for others to join...</p>
                  <p className="text-sm text-zinc-300">Meeting ID: <span className="font-mono text-white">{roomId}</span></p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Control Bar */}
      <footer className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center px-6 shrink-0 relative z-20">
        <div className="flex items-center justify-between w-full max-w-xl">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleToggleAudio}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors cursor-pointer",
                isAudioEnabled ? "hover:bg-zinc-800 text-zinc-300" : "bg-red-500/10 hover:bg-red-500/20 text-red-500"
              )}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6 mb-1" /> : <MicOff className="w-6 h-6 mb-1" />}
              <span className="text-[11px] font-medium">{isAudioEnabled ? "Mute" : "Unmute"}</span>
            </button>

            <button 
              onClick={handleToggleVideo}
              className={cn(
                "flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-colors cursor-pointer",
                isVideoEnabled ? "hover:bg-zinc-800 text-zinc-300" : "bg-red-500/10 hover:bg-red-500/20 text-red-500"
              )}
            >
              {isVideoEnabled ? <Video className="w-6 h-6 mb-1" /> : <VideoOff className="w-6 h-6 mb-1" />}
              <span className="text-[11px] font-medium">{isVideoEnabled ? "Stop Video" : "Start Video"}</span>
            </button>
          </div>

          <button 
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm cursor-pointer"
          >
            Leave Meeting
          </button>
        </div>
      </footer>
    </div>
  );
}

export default function MeetingRoom() {
  return (
    <Suspense fallback={<div className="flex h-screen bg-zinc-950 items-center justify-center text-white">Loading meeting room...</div>}>
      <MeetingRoomContent />
    </Suspense>
  );
}
