"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";

type ChatMessage = { id: string; message: string };

export default function ChatOverlay() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onChatMessage(data: ChatMessage) {
      setMessages((prev) => [...prev.slice(-19), data]);
    }

    socket.on("chatMessage", onChatMessage);

    // Focus chat when Enter is pressed
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement !== inputRef.current && e.key === "Enter") {
        inputRef.current?.focus();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      socket.off("chatMessage", onChatMessage);
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, []);

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      socket.emit("chat", input.trim());
      setInput("");
      // Maintain focus on the input to keep typing or blur to return to game
    }
  };

  return (
    <div className="absolute bottom-4 left-4 w-80 h-64 bg-black/60 rounded flex flex-col justify-end p-2 pointer-events-auto">
      <div className="overflow-y-auto mb-2 flex-grow space-y-1 text-sm flex flex-col justify-end">
        {messages.map((msg, i) => (
          <div key={i} className="break-words">
            <span className="font-bold text-gray-400">
              {msg.id.substring(0, 4)}:
            </span>{" "}
            <span className="text-white">{msg.message}</span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Press Enter to chat..."
          className="flex-grow bg-black/50 text-white rounded px-2 py-1 outline-none text-sm border focus:border-white/50 border-transparent transition-colors"
          onFocus={() => {
            // Can add logic to release pointer lock here, but browser usually does it when input is focused.
          }}
        />
        <button
          type="submit"
          className="bg-white text-black px-3 py-1 rounded text-sm font-bold opacity-80 hover:opacity-100 transition-opacity"
        >
          Send
        </button>
      </form>
    </div>
  );
}
