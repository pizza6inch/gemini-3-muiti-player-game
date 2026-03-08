"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";

const SPEED = 0.5; // Percentage per frame (~60fps)

export default function LocalPlayer() {
  // Use percentages (0-100)
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [mounted, setMounted] = useState(false);
  const posRef = useRef(position);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    // Initial emit
    socket.emit("move", { x: 50, y: 50 });
  }, []);

  useEffect(() => {
    posRef.current = position;
  }, [position]);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT") return;
      keysRef.current[e.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    let lastEmitTime = 0;

    const gameLoop = () => {
      let dx = 0;
      let dy = 0;

      const keys = keysRef.current;
      if (keys["w"] || keys["arrowup"]) dy -= 1;
      if (keys["s"] || keys["arrowdown"]) dy += 1;
      if (keys["a"] || keys["arrowleft"]) dx -= 1;
      if (keys["d"] || keys["arrowright"]) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx = (dx / length) * SPEED;
        dy = (dy / length) * SPEED;

        setPosition((prev) => {
          const newX = Math.max(0, Math.min(100, prev.x + dx));
          const newY = Math.max(0, Math.min(100, prev.y + dy));
          return { x: newX, y: newY };
        });

        const now = Date.now();
        if (now - lastEmitTime > 50) {
          socket.emit("move", posRef.current);
          lastEmitTime = now;
        }
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div 
      className="absolute w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 transition-none"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs shadow-inner">
        🙂
      </div>
      <div className="absolute top-12 whitespace-nowrap bg-blue-600/50 text-white text-[10px] px-1 rounded">
        You
      </div>
    </div>
  );
}
