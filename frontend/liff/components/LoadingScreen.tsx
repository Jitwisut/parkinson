export default function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-5">
        {/* Animated logo / spinner */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 animate-pulse-glow flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold">L</span>
          </div>
          <div className="absolute -inset-1 rounded-2xl border-2 border-cyan-300/40 animate-ping" />
        </div>

        <div className="text-center">
          <p className="text-slate-700 font-semibold text-base">
            กำลังเชื่อมต่อ LINKS AI...
          </p>
          <p className="text-slate-400 text-xs mt-1">กรุณารอสักครู่</p>
        </div>
      </div>
    </div>
  );
}
