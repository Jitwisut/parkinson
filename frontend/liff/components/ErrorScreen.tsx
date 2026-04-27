interface ErrorScreenProps {
  message: string;
}

export default function ErrorScreen({ message }: ErrorScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-red-100 text-center max-w-sm w-full">
        {/* Error icon */}
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>

        <h2 className="text-slate-800 font-bold text-lg mb-2">เกิดข้อผิดพลาด</h2>
        <p className="text-slate-500 text-sm whitespace-pre-wrap leading-relaxed mb-5">{message}</p>
        
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm font-semibold shadow-sm active:scale-95"
        >
          ลองใหม่อีกครั้ง
        </button>
      </div>
    </div>
  );
}
