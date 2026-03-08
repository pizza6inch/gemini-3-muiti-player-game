"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export interface Apple {
    id: string;
    x: number;
    y: number;
}

export default function Apples() {
  const [apples, setApples] = useState<Record<string, Apple>>({});

  useEffect(() => {
    socket.on("currentApples", (data) => setApples(data));
    socket.on("newApple", (apple) => setApples(prev => ({ ...prev, [apple.id]: apple })));
    socket.on("appleEaten", ({ appleId }) => {
      setApples(prev => {
        const next = { ...prev };
        delete next[appleId];
        return next;
      });
    });

    return () => {
      socket.off("currentApples");
      socket.off("newApple");
      socket.off("appleEaten");
    };
  }, []);

  return (
    <>
      {Object.values(apples).map((apple) => (
        <div
          key={apple.id}
          className="absolute text-2xl transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2 animate-bounce flex flex-col items-center"
          style={{ left: `${apple.x}%`, top: `${apple.y}%` }}
        >
          <span>🍎</span>
        </div>
      ))}
    </>
  );
}
