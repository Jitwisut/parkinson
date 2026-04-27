interface AskAIFormProps {
  question: string;
  setQuestion: (q: string) => void;
  onSubmit: () => void;
  isAsking: boolean;
}

export default function AskAIForm({ question, setQuestion, onSubmit, isAsking }: AskAIFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (question.trim() && !isAsking) onSubmit();
    }
  };

  return (
    <div className="px-5 py-6 space-y-4">
      <label className="block text-sm font-semibold text-slate-600">
        💬 ถามคำถามเกี่ยวกับบริการ LINKS
      </label>

      <div className="relative">
        <textarea
          className="w-full border border-slate-200 bg-slate-50/50 p-4 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 outline-none text-slate-800 transition-all resize-none text-[15px] leading-relaxed placeholder:text-slate-400"
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="เช่น LINKS Platform มีบริการอะไรบ้าง?"
          disabled={isAsking}
        />
        <span className="absolute bottom-3 right-3 text-[11px] text-slate-300 select-none hidden sm:block">
          Ctrl + Enter เพื่อส่ง
        </span>
      </div>

      <button
        onClick={onSubmit}
        disabled={isAsking || !question.trim()}
        className={`w-full py-3 rounded-xl font-semibold text-white shadow-sm transition-all flex items-center justify-center gap-2 text-[15px] ${
          isAsking || !question.trim()
            ? "bg-slate-300 cursor-not-allowed"
            : "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 hover:shadow-md active:scale-[0.98]"
        }`}
      >
        {isAsking ? (
          <>
            <div className="w-4.5 h-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>กำลังประมวลผล...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>ถาม AI</span>
          </>
        )}
      </button>
    </div>
  );
}
