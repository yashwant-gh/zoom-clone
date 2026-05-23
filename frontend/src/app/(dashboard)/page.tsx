"use client";

import { format } from "date-fns";
import { Video, Plus, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { getBackendUrl } from "@/lib/api";

export default function DashboardPage() {
  const backendUrl = getBackendUrl();
  
  const [time, setTime] = useState<Date | null>(null);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [recent, setRecent] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch(`${backendUrl}/api/meetings/upcoming`).then(r => r.json()).then(data => setUpcoming(data.meetings || []));
    fetch(`${backendUrl}/api/meetings/recent`).then(r => r.json()).then(data => setRecent(data.meetings || []));
  }, [backendUrl]);

  const startInstantMeeting = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/meetings/instant`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hostName: "Zoom Host" })
      });
      const data = await res.json();
      if (data.meetingId) {
        router.push(`/meeting/${data.meetingId}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (!time) return null; // Avoid hydration mismatch for SSR clock

  return (
    <div className="flex-1 md:p-8 grid grid-cols-12 gap-8 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
      
      {/* Left: Action Grid */}
      <div className="col-span-12 md:col-span-7 flex flex-col pt-4 md:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          <button 
            onClick={startInstantMeeting}
            className="flex flex-col items-center justify-center gap-4 bg-[#F26D21] p-6 md:p-8 rounded-3xl shadow-lg transition-transform hover:scale-[1.02] text-white group cursor-pointer"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Video className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-base md:text-lg font-semibold">New Meeting</span>
          </button>
          
          <button 
            onClick={() => router.push('/join')}
            className="flex flex-col items-center justify-center gap-4 bg-[#0E71EB] p-6 md:p-8 rounded-3xl shadow-lg transition-transform hover:scale-[1.02] text-white group cursor-pointer"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Plus className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-base md:text-lg font-semibold">Join</span>
          </button>

          <button 
            onClick={() => router.push('/schedule')}
            className="flex flex-col items-center justify-center gap-4 bg-[#0E71EB] p-6 md:p-8 rounded-3xl shadow-lg transition-transform hover:scale-[1.02] text-white group cursor-pointer"
          >
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <span className="text-base md:text-lg font-semibold">Schedule</span>
          </button>
        </div>
      </div>

      {/* Right: Calendar & Upcoming */}
      <div className="col-span-12 md:col-span-5 flex flex-col pt-4 md:pt-0">
        {/* Time Card */}
        <div className="bg-[url('https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center h-48 rounded-3xl p-8 flex flex-col justify-end text-white relative overflow-hidden mb-8 shadow-md">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative">
            <p className="text-5xl font-bold mb-1">{format(time, "h:mm a")}</p>
            <p className="text-lg opacity-90">{format(time, "EEEE, MMMM do, yyyy")}</p>
          </div>
        </div>

        {/* Upcoming Meetings List */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm flex flex-col border border-[#E1E3E6]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#131619]">Upcoming Meetings</h2>
            <span className="text-[#0E71EB] text-sm font-semibold cursor-pointer hover:underline">View all</span>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2">
            {upcoming.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 pt-10">
                <Calendar className="w-12 h-12 mb-2 text-[#6C757D]" />
                <p className="text-sm">No more meetings today</p>
              </div>
            ) : (
              upcoming.map(m => {
                const date = new Date(m.scheduled_for);
                return (
                  <div key={m.id} className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E1E3E6] flex gap-4 items-center">
                    <div className="w-12 h-12 bg-white rounded-lg border border-[#E1E3E6] flex flex-col items-center justify-center leading-tight">
                      <span className="text-[10px] uppercase font-bold text-gray-400">{format(date, "MMM")}</span>
                      <span className="text-lg font-bold text-[#131619]">{format(date, "d")}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-[#131619]">{m.title}</h3>
                      <p className="text-xs text-[#6C757D]">{format(date, "h:mm a")} · ID: {m.id}</p>
                    </div>
                    <button 
                      onClick={() => router.push(`/meeting/${m.id}`)}
                      className="px-3 py-1.5 bg-[#0E71EB] text-white text-xs font-bold rounded-lg transition-colors hover:bg-blue-700 cursor-pointer"
                    >
                      Start
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Meetings List */}
        <div className="flex-1 bg-white rounded-3xl p-6 shadow-sm flex flex-col border border-[#E1E3E6] mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#131619]">Recent Meetings</h2>
          </div>
          
          <div className="space-y-4 overflow-y-auto pr-2">
             {recent.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center opacity-40 pt-10">
                <Video className="w-12 h-12 mb-2 text-[#6C757D]" />
                <p className="text-sm">No recent meetings to show</p>
              </div>
            ) : (
                recent.map(m => (
                  <div key={m.id} className="p-4 bg-[#F8F9FA] rounded-xl border border-[#E1E3E6] flex gap-4 items-center">
                    <div className="flex-1">
                      <h3 className="font-bold text-sm text-[#131619]">{m.title}</h3>
                      <p className="text-xs text-[#6C757D]">ID: {m.id}</p>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
