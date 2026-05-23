export const getBackendUrl = (): string => {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("vercel.app") || host.includes("real-zoom")) {
      return "https://zoom-clone.up.railway.app";
    }
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
};

export const getWsUrl = (roomId: string): string => {
  const backendUrl = getBackendUrl();
  const wsBaseUrl = backendUrl.replace(/^http/, "ws");
  return `${wsBaseUrl}/ws/meeting/${roomId}/`;
};
