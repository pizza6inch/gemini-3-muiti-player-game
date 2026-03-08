"use client";

import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

export default function RemotePlayers() {
  const [players, setPlayers] = useState<Record<string, { id: string; position: [number, number, number] }>>({});

  useEffect(() => {
    function onCurrentPlayers(serverPlayers: any) {
      const others = { ...serverPlayers };
      delete others[socket.id || ""];
      setPlayers(others);
    }

    function onNewPlayer(player: any) {
      if (player.id === socket.id) return;
      setPlayers((prev) => ({ ...prev, [player.id]: player }));
    }

    function onPlayerMoved(data: any) {
      if (data.id === socket.id) return;
      setPlayers((prev) => {
        if (!prev[data.id]) return prev;
        return {
          ...prev,
          [data.id]: { ...prev[data.id], position: data.position },
        };
      });
    }

    function onPlayerDisconnected(id: string) {
      setPlayers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }

    socket.on("currentPlayers", onCurrentPlayers);
    socket.on("newPlayer", onNewPlayer);
    socket.on("playerMoved", onPlayerMoved);
    socket.on("playerDisconnected", onPlayerDisconnected);

    return () => {
      socket.off("currentPlayers", onCurrentPlayers);
      socket.off("newPlayer", onNewPlayer);
      socket.off("playerMoved", onPlayerMoved);
      socket.off("playerDisconnected", onPlayerDisconnected);
    };
  }, []);

  return (
    <>
      {Object.values(players).map((player) => (
        <mesh key={player.id} position={player.position} castShadow>
          <capsuleGeometry args={[0.5, 1, 4, 8]} />
          <meshStandardMaterial color="cyan" />
        </mesh>
      ))}
    </>
  );
}
