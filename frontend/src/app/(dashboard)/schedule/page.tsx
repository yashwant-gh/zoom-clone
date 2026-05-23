"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";

export default function SchedulePage() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  
  const [topic, setTopic] = useState("John Doe's Zoom Meeting");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("60");
  const [description, setDescription] = useState("");
  
  const router = useRouter();

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    const dt = new Date(date);
    
    // Schedule API Call
    const res = await fetch(`${backendUrl}/api/meetings/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: topic,
        description,
        scheduledFor: dt.toISOString(),
        duration: parseInt(duration, 10)
      })
    });
    
    if (res.ok) {
      router.push("/");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-[#E1E3E6] rounded-3xl p-8 shadow-sm">
        
        <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-[#E1E3E6]">
          <div className="w-12 h-12 bg-[#F0F7FF] rounded-2xl flex items-center justify-center">
            <Calendar className="w-6 h-6 text-[#0E71EB]" />
          </div>
          <h2 className="text-2xl font-bold text-[#131619] tracking-tight">Schedule Meeting</h2>
        </div>
        
        <form onSubmit={handleSchedule} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#6C757D] mb-1">Topic</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 bg-[#F4F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#0E71EB] outline-none transition-all text-[#131619]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#6C757D] mb-1">Date & Time</label>
              <input 
                type="datetime-local" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#F4F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#0E71EB] outline-none transition-all text-[#131619]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#6C757D] mb-1">Duration (Minutes)</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-3 bg-[#F4F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#0E71EB] outline-none transition-all text-[#131619]"
              >
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6C757D] mb-1">Description (Optional)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-[#F4F5F7] border-none rounded-xl focus:ring-2 focus:ring-[#0E71EB] outline-none transition-all text-[#131619]"
            />
          </div>

          <div className="pt-6 border-t border-[#E1E3E6] flex justify-end space-x-3">
            <button 
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-3 border border-[#E1E3E6] text-[#131619] font-medium rounded-xl hover:bg-[#F4F5F7] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-[#0E71EB] hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Save Meeting
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
