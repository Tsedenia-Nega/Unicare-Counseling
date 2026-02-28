// src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:4000";
const socket = io(SOCKET_URL, {
  
  transports: ["websocket"],
},);

socket.on("connect", () => {
  console.log("Connected to backend via socket!");
});
export default socket;
