"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// --- Configuration ---
// แก้ไขลิงก์ Ngrok ของคุณที่นี่ทุกครั้งที่รันใหม่
const NGROK_URL = "https://freestyle-papyrus-flatly.ngrok-free.dev";

export default function ShadowGame() {
  const [data, setData] = useState({ img: "", label: "Waiting..." });
  const [status, setStatus] = useState("Connecting...");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    // บังคับใช้ websocket เพื่อเลี่ยงปัญหา Headers ของ Ngrok
    const socket: Socket = io(NGROK_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("✅ Socket Connected ID:", socket.id);
      setStatus("Online");
      setErrorMsg(null);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Connection Error:", err.message);
      setStatus("Offline");
      setErrorMsg(err.message);
    });

    socket.on("disconnect", () => {
      setStatus("Offline");
    });

    // ชื่อท่อ 'shadow_data' ต้องตรงกับที่เขียนใน Python (sio.emit)
    socket.on("shadow_data", (payload) => {
      setData(payload);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-2xl">
        
        {/* --- Header Section --- */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
              SHADOW SIGN AI
            </h1>
            <p className="text-zinc-500 text-xs font-mono mt-1 uppercase tracking-[0.2em]">
              FIBO Robotics Lab | Vision System
            </p>
          </div>
          <div className="text-right">
            <div className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
              status === "Online" 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/50" 
              : "bg-red-500/10 text-red-500 border-red-500/50 animate-pulse"
            }`}>
              {status}
            </div>
          </div>
        </div>

        {/* --- Main Display (Video Feed) --- */}
        <div className="relative aspect-video bg-zinc-900 rounded-[2rem] border-4 border-zinc-800 shadow-[0_0_60px_-15px_rgba(59,130,246,0.2)] overflow-hidden">
          {data.img ? (
            <img 
              src={`data:image/jpeg;base64,${data.img}`} 
              className="w-full h-full object-contain" 
              alt="AI Feed" 
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4"></div>
              <p className="text-zinc-600 font-mono text-sm tracking-widest uppercase">
                {errorMsg ? `Error: ${errorMsg}` : "Awaiting Stream..."}
              </p>
            </div>
          )}
          
          {/* Decorative Overlay */}
          <div className="absolute top-4 right-4 flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
            <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Feed</span>
          </div>
        </div>

        {/* --- Results Section --- */}
        <div className="mt-8 bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold block mb-2">
              Detected Sign
            </span>
            <span className="text-6xl font-black text-white font-mono leading-none">
              {data.label}
            </span>
          </div>

          <div className="flex flex-col gap-3 w-full sm:w-auto">
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold py-3 px-8 rounded-2xl transition-all shadow-lg shadow-blue-900/20 text-sm uppercase tracking-wider"
            >
              Re-Connect
            </button>
            <p className="text-[9px] text-center text-zinc-600 font-mono italic">
              AI Engine: YOLO26n-Shadow-v2
            </p>
          </div>
        </div>

        {/* --- Footer --- */}
        <p className="mt-8 text-center text-zinc-700 text-[9px] uppercase tracking-widest font-medium">
          Created by Thanespol | FRA502 Project
        </p>

      </div>
    </main>
  );
}