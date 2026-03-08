import { io } from "socket.io-client";

const URL = typeof window !== "undefined" ? window.location.origin : "";

export const socket = io(URL, {
  autoConnect: true,
});
