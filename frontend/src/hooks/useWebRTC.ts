import { useEffect, useRef, useState, useCallback } from "react";

interface PeerConnection {
  peerConnection: RTCPeerConnection;
  stream: MediaStream;
  userName: string;
  pendingCandidates: RTCIceCandidateInit[];
}

export function useWebRTC(roomId: string, userId: string, userName: string) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, PeerConnection>>({});
  
  const socketRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Record<string, PeerConnection>>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  const createPeerConnection = (targetUserId: string, targetUserName: string, stream: MediaStream | null, socket: WebSocket) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
      ]
    });

    if (!peersRef.current[targetUserId]) {
      peersRef.current[targetUserId] = {
        peerConnection,
        stream: new MediaStream(),
        userName: targetUserName,
        pendingCandidates: []
      };
      setPeers({ ...peersRef.current });
    } else {
      peersRef.current[targetUserId].peerConnection = peerConnection;
    }

    if (stream) {
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });
    } else {
      peerConnection.addTransceiver('audio', { direction: 'recvonly' });
      peerConnection.addTransceiver('video', { direction: 'recvonly' });
    }

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "ice-candidate",
          target: targetUserId,
          caller: userId,
          candidate: event.candidate
        }));
      }
    };

    peerConnection.ontrack = (event) => {
      const peer = peersRef.current[targetUserId];
      if (peer) {
        let streamToUse;
        if (event.streams && event.streams[0]) {
          streamToUse = event.streams[0];
        } else {
          streamToUse = peer.stream || new MediaStream();
          streamToUse.addTrack(event.track);
        }
        
        peersRef.current[targetUserId] = { ...peer, stream: streamToUse };
        setPeers({ ...peersRef.current });
      }
    };

    return peerConnection;
  };

  const connectToSocket = useCallback(async (stream: MediaStream | null) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) return;
    
    const getWsUrl = () => {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (backendUrl) {
        return backendUrl.replace(/^http/, "ws");
      }
      if (typeof window !== "undefined") {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname;
        return `${protocol}//${host}:8000`;
      }
      return "ws://localhost:8000";
    };

    const wsBaseUrl = getWsUrl();
    const socketUrl = `${wsBaseUrl}/ws/meeting/${roomId}/`;
    
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      socket.send(JSON.stringify({
        type: "join-room",
        roomId,
        userId,
        userName
      }));
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      const type = data.type;

      if (type === "user-connected") {
        const { userId: currentUserId, userName: currentUserName } = data;
        const peerConnection = createPeerConnection(currentUserId, currentUserName, stream, socket);
        
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        socket.send(JSON.stringify({
          type: "offer",
          target: currentUserId,
          caller: userId,
          callerName: userName,
          sdp: offer
        }));
      }

      else if (type === "offer") {
        const { caller, callerName, sdp } = data;
        const peerConnection = createPeerConnection(caller, callerName, stream, socket);
        
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        
        const peer = peersRef.current[caller];
        if (peer && peer.pendingCandidates) {
          for (const candidate of peer.pendingCandidates) {
            peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          }
          peer.pendingCandidates = [];
        }

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.send(JSON.stringify({
          type: "answer",
          target: caller,
          caller: userId,
          sdp: answer
        }));
      }

      else if (type === "answer") {
        const { caller, sdp } = data;
        const pc = peersRef.current[caller]?.peerConnection;
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          
          const peer = peersRef.current[caller];
          if (peer && peer.pendingCandidates) {
            for (const candidate of peer.pendingCandidates) {
              pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
            }
            peer.pendingCandidates = [];
          }
        }
      }

      else if (type === "ice-candidate") {
        const { caller, candidate } = data;
        const peer = peersRef.current[caller];
        if (peer) {
          const pc = peer.peerConnection;
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate)).catch(console.error);
          } else {
            peer.pendingCandidates.push(candidate);
          }
        }
      }

      else if (type === "user-disconnected") {
        const { userId: disconnectedUserId } = data;
        if (peersRef.current[disconnectedUserId]) {
          peersRef.current[disconnectedUserId].peerConnection.close();
          const updatedPeers = { ...peersRef.current };
          delete updatedPeers[disconnectedUserId];
          peersRef.current = updatedPeers;
          setPeers(updatedPeers);
        }
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket connection error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed.");
    };

  }, [roomId, userId, userName]);

  useEffect(() => {
    let mounted = true;

    const initLocalStream = async () => {
      let stream: MediaStream | null = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (mounted) {
          setLocalStream(stream);
          localStreamRef.current = stream;
        } else {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
      
      if (mounted) {
        await connectToSocket(stream);
      }
    };

    initLocalStream();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      Object.values(peersRef.current).forEach((peer: any) => {
        peer.peerConnection.close();
      });
      peersRef.current = {};
      setPeers({});
    };
  }, [roomId, connectToSocket]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return false;
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return false;
  }, []);

  return { 
    localStream, 
    peers, 
    toggleAudio, 
    toggleVideo, 
    socket: socketRef.current 
  };
}
