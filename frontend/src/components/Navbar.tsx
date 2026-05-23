"use client";

import { Settings, Video } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function Navbar() {
  return (
    <header className="h-16 bg-white border-b border-[#E1E3E6] flex items-center justify-between px-6 md:px-8 shrink-0">
      
      {/* Brand */}
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#0E71EB] rounded-lg flex items-center justify-center">
          <Video className="text-white w-5 h-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#0E71EB]">Zoom Clone</h1>
      </Link>

      {/* Right actions */}
      <div className="flex items-center gap-4 text-[#6C757D]">
        <button onClick={() => toast.info("Settings placeholder")} className="p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer">
          <Settings className="w-5 h-5" />
        </button>
        <button onClick={() => toast.info("Profile placeholder")} className="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded-lg transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-[#0E71EB] text-white rounded-full flex items-center justify-center text-sm font-bold">
            JD
          </div>
        </button>
      </div>
    </header>
  );
}
