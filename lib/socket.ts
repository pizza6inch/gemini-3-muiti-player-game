import { io } from "socket.io-client";

// 因為前後端是在同一個 Render 服務上，這會自動指向您的 Production 網址
const URL = typeof window !== "undefined" ? window.location.origin : "";

export const socket = io(URL, {
  autoConnect: true,
  transports: ["websocket"],
});
