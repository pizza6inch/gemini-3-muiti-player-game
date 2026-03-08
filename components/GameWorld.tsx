"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import ChatOverlay from "./ChatOverlay";
import LocalPlayer from "./LocalPlayer";
import RemotePlayers from "./RemotePlayers";

// Static background decorative objects for flavor
// x, y are percentages of the screen (0 to 100)
const BG_OBJECTS = [
  { id: 1, type: "🌲", x: 10, y: 15, size: "text-6xl" },
  { id: 2, type: "🌲", x: 25, y: 10, size: "text-5xl" },
  { id: 3, type: "🏠", x: 70, y: 20, size: "text-7xl" },
  { id: 4, type: "🌲", x: 85, y: 35, size: "text-6xl" },
  { id: 5, type: "🍄", x: 45, y: 60, size: "text-4xl" },
  { id: 6, type: "🌲", x: 15, y: 80, size: "text-5xl" },
  { id: 7, type: "🏕️", x: 60, y: 75, size: "text-6xl" },
];

export default function GameWorld() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-green-200 overflow-hidden select-none"
    >
      {/* Background Objects */}
      {BG_OBJECTS.map(obj => (
        <div 
          key={obj.id}
          className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${obj.size} pointer-events-none drop-shadow-lg`}
          style={{ left: `${obj.x}%`, top: `${obj.y}%` }}
        >
          {obj.type}
        </div>
      ))}

      {/* Players */}
      <RemotePlayers />
      <LocalPlayer />

      {/* UI */}
      <ChatOverlay />
      
      {/* Instructions */}
      <div className="absolute top-4 left-4 text-black text-sm bg-white/50 p-2 rounded font-bold pointer-events-none">
        Use W A S D or Arrow Keys to move.
      </div>
    </div>
  );
}
