"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";

const SPEED = 0.5; // Percentage per frame (~60fps)
const COLLISION_RADIUS = 3; // Percentage distance to eat apple

export default function LocalPlayer() {
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [score, setScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  const posRef = useRef(position);
  const applesRef = useRef<Record<string, any>>({});
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const animationRef = useRef<number>(0);

  useEffect(() => {
    setMounted(true);
    socket.emit("move", { x: 50, y: 50 });

    const handleApples = (data: any) => { applesRef.current = data; };
    const handleNewApple = (apple: any) => { applesRef.current[apple.id] = apple; };
    const handleAppleEaten = ({ appleId, playerId, newScore }: any) => {
        delete applesRef.current[appleId];
        if (playerId === socket.id) setScore(newScore);
    };

    socket.on("currentApples", handleApples);
    socket.on("newApple", handleNewApple);
    socket.on("appleEaten", handleAppleEaten);

    return () => {
        socket.off("currentApples", handleApples);
        socket.off("newApple", handleNewApple);
        socket.off("appleEaten", handleAppleEaten);
    };
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
          
          // Collision Check
          Object.values(applesRef.current).forEach((apple: any) => {
              const dist = Math.sqrt(Math.pow(newX - apple.x, 2) + Math.pow(newY - apple.y, 2));
              if (dist < COLLISION_RADIUS) {
                  socket.emit("eatApple", apple.id);
                  // Optimistically remove locally to avoid double emit
                  delete applesRef.current[apple.id];
              }
          });

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
      className="absolute w-10 h-10 bg-blue-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-20 transition-none"
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
    >
      <div className="absolute -top-8 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md">
        Score: {score}
      </div>
      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs shadow-inner">
        🙂
      </div>
    </div>
  );
}
