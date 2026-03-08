"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function RemotePlayers() {
  const [allPlayers, setAllPlayers] = useState<Record<string, any>>({});
  const [remotePlayers, setRemotePlayers] = useState<Record<string, any>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    function onCurrentPlayers(serverPlayers: any) {
      console.log("RemotePlayers: Received current players", serverPlayers);
      setAllPlayers(serverPlayers);
    }

    function onNewPlayer(player: any) {
      console.log("RemotePlayers: New player joined", player.id);
      setAllPlayers((prev) => ({ ...prev, [player.id]: player }));
    }

    function onPlayerMoved(data: { id: string, position: { x: number, y: number } }) {
      setAllPlayers((prev) => {
        if (!prev[data.id]) return prev;
        return {
          ...prev,
          [data.id]: { ...prev[data.id], position: data.position },
        };
      });
    }

    function onPlayerDisconnected(id: string) {
      console.log("RemotePlayers: Player disconnected", id);
      setAllPlayers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }

    socket.on("currentPlayers", onCurrentPlayers);
    socket.on("newPlayer", onNewPlayer);
    socket.on("playerMoved", onPlayerMoved);
    socket.on("playerDisconnected", onPlayerDisconnected);

    const checkInterval = setInterval(() => {
        if (socket.connected) {
            socket.emit("requestCurrentPlayers");
            clearInterval(checkInterval);
        }
    }, 500);

    return () => {
      socket.off("currentPlayers", onCurrentPlayers);
      socket.off("newPlayer", onNewPlayer);
      socket.off("playerMoved", onPlayerMoved);
      socket.off("playerDisconnected", onPlayerDisconnected);
      clearInterval(checkInterval);
    };
  }, []);

  useEffect(() => {
    const others = { ...allPlayers };
    if (socket.id) {
      delete others[socket.id];
    }
    setRemotePlayers(others);
  }, [allPlayers, socket.id]);

  if (!mounted) return null;

  return (
    <>
      {Object.values(remotePlayers).map((player) => {
        const px = player.position?.x ?? 50;
        const py = player.position?.y ?? 50;
        
        return (
          <div
            key={player.id}
            className="absolute w-10 h-10 bg-red-500 rounded-full border-4 border-white shadow-xl flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-100"
            style={{ left: `${px}%`, top: `${py}%` }}
          >
             <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-xs shadow-inner">
               😎
             </div>
             <div className="absolute top-12 whitespace-nowrap bg-black/50 text-white text-[10px] px-1 rounded">
                Player {player.id.substring(0, 4)}
             </div>
          </div>
        );
      })}
    </>
  );
}
