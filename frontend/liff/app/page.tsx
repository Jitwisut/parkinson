"use client";
import { useEffect, useState } from "react";
import liff from "@line/liff";
import { UserProfile } from "../types";
import { useAuth } from "../hooks/useAuth";
import LoadingScreen from "../components/LoadingScreen";
import ErrorScreen from "../components/ErrorScreen";
import ProfileCard from "../components/ProfileCard";
import AskAIForm from "../components/AskAIForm";
import AIResponse from "../components/AIResponse";
import RegistrationForm from "../components/RegistrationForm";
import Navigation from "../components/Navigation";

export default function Home() {
  const { user, login, logout, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();

  // --- States ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAsking, setIsAsking] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // --- 1. LIFF Initialization ---
  useEffect(() => {
    let cancelled = false;

    async function initLiff() {
      try {
        const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
        if (!liffId) throw new Error("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_LIFF_ID");

        await liff.init({ liffId });
        if (cancelled) return;

        if (liff.isLoggedIn()) {
          const userProfile = await liff.getProfile();
          if (!cancelled) {
            setProfile(userProfile as UserProfile);
            // Auto-login with LINE userId as idToken substitute
            if (!isAuthenticated) {
              try {
                await login(userProfile.userId);
              } catch (err) {
                // If login fails, user may need to register first
                setIsRegistering(true);
              }
            }
          }
        } else {
          liff.login();
        }
      } catch (err) {
        if (cancelled) return;
        console.error("LIFF Init Error:", err);
        setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อ LINE");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    initLiff();
    return () => { cancelled = true; };
  }, []);

  // Reset isSent when answer changes
  useEffect(() => { setIsSent(false); }, [answer]);

  // --- 2. Ask AI ---
  async function askAI() {
    if (!question.trim() || isAsking) return;
    setIsAsking(true);
    setAnswer("");
    setErrorMsg(""); // Clear previous error

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, userId: profile?.userId || "" }),
      });

      if (!res.ok) throw new Error("AI ไม่สามารถประมวลผลได้ กรุณาลองใหม่");

      const data = await res.json();
      setAnswer(data.answer || "ไม่มีคำตอบจาก AI");
    } catch (err) {
      console.error("Ask AI Error:", err);
      setErrorMsg(err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI");
    } finally {
      setIsAsking(false);
    }
  }

  // --- 3. Build summary text ---
  function buildSummaryText(): string {
    return `🤖 สรุปผลจาก LINKS AI Assistant\n\nคำถาม: ${question}\nคำตอบ: ${answer}`;
  }

  // --- 4. Send summary to LINE Chat ---
  async function sendToLine() {
    try {
      await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          userId: profile?.userId || '',
          pushToLine: true, // flag บอกให้ push
        }),
      });
      setIsSent(true);
    } catch (err) {
      setErrorMsg('ไม่สามารถส่งข้อความได้');
    }
  }

  // --- Render ---
  if (isLoading || authLoading) return <LoadingScreen />;
  if (errorMsg && !answer && !profile) return <ErrorScreen message={errorMsg} />;

  // Show registration form if user is not authenticated
  if (!isAuthenticated && profile && isRegistering) {
    return (
      <RegistrationForm
        onSubmit={async (data) => {
          try {
            await register(data);
            setIsRegistering(false);
          } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : 'ลงทะเบียนไม่สำเร็จ');
          }
        }}
        onCancel={() => setIsRegistering(false)}
        isLoading={authLoading}
      />
    );
  }

  // Show auth error if login/registration failed
  if (!isAuthenticated && authError) {
    return (
      <div className="min-h-screen py-6 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-4">เกิดข้อผิดพลาด</h2>
          <p className="text-red-600 mb-4">{authError}</p>
          <button
            onClick={() => setIsRegistering(true)}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ลงทะเบียนใหม่
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated && user && (
        <Navigation userRole={user.role} onLogout={logout} />
      )}
      <div className="min-h-screen py-6 px-4 flex flex-col items-center justify-start sm:justify-center">
        {/* Main card */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-white/60 ring-1 ring-black/[0.04]">

          <ProfileCard profile={profile} />

          <AskAIForm
            question={question}
            setQuestion={setQuestion}
            onSubmit={askAI}
            isAsking={isAsking}
          />

          {/* Inline Error Banner */}
          {errorMsg && (
            <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-fade-in-up">
              <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-red-700 text-sm font-medium">{errorMsg}</p>
                <button
                  onClick={() => setErrorMsg("")}
                  className="text-red-400 text-xs mt-1 hover:text-red-600 underline underline-offset-2"
                >
                  ปิดข้อความนี้
                </button>
              </div>
            </div>
          )}

          <AIResponse
            answer={answer}
            onSendToLine={sendToLine}
            isSent={isSent}
          />
        </div>

        {/* Footer */}
        <p className="text-center text-slate-400 text-[11px] mt-6 tracking-wide">
          Powered by <span className="font-semibold text-slate-500">LINKS Platform</span> · AI Assistant
        </p>
      </div>
    </>
  );
}
