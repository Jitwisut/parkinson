import { UserProfile } from "../types";

interface ProfileCardProps {
  profile: UserProfile | null;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient header background */}
      <div className="bg-gradient-to-br from-cyan-600 via-cyan-500 to-emerald-500 px-6 pt-8 pb-10 text-white text-center">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-8" />

        {profile ? (
          <div className="relative flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={profile.pictureUrl || "https://via.placeholder.com/150"}
                className="w-20 h-20 rounded-full border-[3px] border-white/80 shadow-lg object-cover bg-white/20"
                alt="User avatar"
              />
              {/* Online indicator */}
              <div className="absolute bottom-0.5 right-0.5 w-5 h-5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{profile.displayName}</h1>
              <p className="text-cyan-100 text-sm mt-0.5">LINKS AI Assistant ยินดีให้บริการ</p>
            </div>
          </div>
        ) : (
          <div className="py-4 relative">
            <p className="font-semibold">กรุณาเข้าสู่ระบบผ่าน LINE</p>
          </div>
        )}
      </div>

      {/* Curved bottom edge */}
      <div className="h-4 bg-gradient-to-br from-cyan-600 via-cyan-500 to-emerald-500 rounded-b-[2rem]" />
    </div>
  );
}
