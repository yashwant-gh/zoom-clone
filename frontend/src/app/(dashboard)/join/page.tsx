"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Video } from "lucide-react";

import { getBackendUrl } from "@/lib/api";

function JoinPageContent() {
  const backendUrl = getBackendUrl();
  
  const searchParams = useSearchParams();
  const [meetingId, setMeetingId] = useState(searchParams?.get("id") || "");
  const [name, setName] = useState("John Doe");
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingId.trim() || !name.trim()) return;
    
    const formattedId = meetingId.replace(/[^0-9-]/g, '');
    
    try {
      const res = await fetch(`${backendUrl}/api/meetings/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId: formattedId })
      });
      const data = await res.json();
      
      if (data.valid) {
        router.push(`/meeting/${formattedId}?name=${encodeURIComponent(name)}`);
      } else {
        alert("Meeting not found! Please check the ID.");
      }
    } catch (err) {
      alert("Error validating meeting");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-[#E1E3E6] rounded-3xl p-8 shadow-sm">
        <div className="w-12 h-12 bg-[#F0F7FF] rounded-2xl flex items-center justify-center mb-6 mx-auto">
          <Video className="w-6 h-6 text-[#0E71EB]" />
        </div>
        
        <h2 className="text-2xl font-bold text-center text-[#131619] mb-8 tracking-tight">Join Meeting</h2>
        
        <form onSubmit={handleJoin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#6C757D] mb-1">Meeting ID or Personal Link Name</label>
            <input 
              type="text" 
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="e.g. 123-456-789"
              className="w-full px-4 py-3 bg-[#F4F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#0E71EB] outline-none transition-all placeholder-[#6C757D] font-mono text-[#131619]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#6C757D] mb-1">Your Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#0E71EB] outline-none transition-all placeholder-[#6C757D] text-[#131619]"
              required
            />
          </div>

          <div className="pt-4 space-y-3">
            <label className="flex items-center space-x-3 text-sm text-[#6C757D]">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0E71EB] focus:ring-[#0E71EB]" />
              <span>Do not connect to audio</span>
            </label>
            <label className="flex items-center space-x-3 text-sm text-[#6C757D]">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#0E71EB] focus:ring-[#0E71EB]" />
              <span>Turn off my video</span>
            </label>
          </div>

          <div className="pt-6">
            <button 
              type="submit"
              disabled={!meetingId.trim()}
              className="w-full py-3.5 bg-[#0E71EB] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Join
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="text-center mt-12 text-zinc-500">Loading join parameters...</div>}>
      <JoinPageContent />
    </Suspense>
  );
}
