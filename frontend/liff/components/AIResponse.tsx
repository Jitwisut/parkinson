interface AIResponseProps {
  answer: string;
  onSendToLine: () => void;
  isSent?: boolean;
  isLoading?: boolean; // เพิ่ม prop สำหรับเช็คสถานะ loading
}

export default function AIResponse({
  answer,
  onSendToLine,
  isSent = false,
  isLoading = false,
}: AIResponseProps) {
  if (!answer) return null;

  return (
    <div className="px-5 pb-6 animate-fade-in-up">
      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">คำตอบจาก AI</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* AI response bubble */}
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="shrink-0 mt-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-sm">
            <span className="text-white text-sm">🤖</span>
          </div>
        </div>

        {/* Message bubble */}
        <div className="flex-1 bg-slate-50 border border-slate-200/80 p-4 rounded-2xl rounded-tl-md text-slate-700 whitespace-pre-wrap text-sm leading-relaxed shadow-sm">
          {answer}
        </div>
      </div>

      {/* Send to LINE button */}
      <button
        onClick={onSendToLine}
        disabled={isSent || isLoading} // ปิดปุ่มถ้าส่งแล้ว หรือ กำลังโหลดอยู่
        className={`mt-4 w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] shadow-sm text-[15px] ${
          isSent
            ? "bg-emerald-100 text-emerald-700 border border-emerald-200 cursor-default"
            : isLoading
              ? "bg-[#06C755]/80 text-white cursor-wait" // สีตอน loading จะดรอปลงนิดนึงและเปลี่ยนเคอร์เซอร์
              : "bg-[#06C755] text-white hover:bg-[#05b34d]"
        }`}
      >
        {isSent ? (
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>ส่งสรุปเรียบร้อยแล้ว ✅</span>
          </>
        ) : isLoading ? (
          <>
            {/* ไอคอนหมุนๆ (Spinner) */}
            <svg
              className="animate-spin -ml-1 mr-2 w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>กำลังส่งเข้าแชท...</span>
          </>
        ) : (
          <>
            {/* LINE icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            <span>ส่งสรุปเข้า LINE Chat</span>
          </>
        )}
      </button>
    </div>
  );
}
