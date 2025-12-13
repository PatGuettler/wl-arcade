import React, { useState } from "react";
import { Lock, Home } from "lucide-react";
import { UNICORNS } from "../../utils/storage";
import GlobalHeader from "./globalHeader";

const UnicornAlleyView = ({ userData, onEnterRoom, onBack, onHome }) => {
  const [toast, setToast] = useState(null);

  const handleHouseClick = (unicornId) => {
    if (userData.ownedUnicorns.includes(unicornId)) {
      onEnterRoom(unicornId);
    } else {
      setToast("Unlock in the market to see my house!");
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col relative">
      <GlobalHeader
        coins={userData.coins}
        onBack={onBack}
        onHome={onHome}
        isSubScreen={true}
        title="Unicorn Alley"
      />

      {/* Toast Message */}
      {toast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-bold py-2 px-6 rounded-full shadow-xl z-50 animate-pop-in text-sm whitespace-nowrap">
          {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950">
        <div className="max-w-md mx-auto grid gap-6 pb-20">
          <div className="text-center mb-4">
            <p className="text-slate-400 text-sm">
              Visit your companions' homes!
            </p>
          </div>

          {UNICORNS.map((u) => {
            const isOwned = userData.ownedUnicorns.includes(u.id);

            return (
              <div
                key={u.id}
                onClick={() => handleHouseClick(u.id)}
                className={`relative group cursor-pointer transition-transform active:scale-[0.98] ${
                  !isOwned ? "grayscale opacity-70" : ""
                }`}
              >
                {/* House Body */}
                <div
                  className={`h-32 rounded-3xl border-b-8 border-slate-950 relative overflow-hidden flex items-end justify-center ${
                    isOwned ? "bg-slate-800" : "bg-slate-900"
                  } shadow-2xl`}
                >
                  {/* Roof */}
                  <div
                    className={`absolute top-0 left-0 w-full h-1/2 ${u.style} opacity-50`}
                  />

                  {/* Door */}
                  <div
                    className={`w-16 h-20 rounded-t-full border-4 border-slate-950 bg-slate-700 flex items-center justify-center relative z-10 ${
                      isOwned ? "group-hover:bg-cyan-500/20" : ""
                    }`}
                  >
                    {isOwned ? (
                      <Home className="text-slate-400" />
                    ) : (
                      <Lock className="text-slate-500" />
                    )}
                  </div>

                  {/* Windows */}
                  <div className="absolute top-4 left-6 w-8 h-8 bg-yellow-100/10 rounded-lg border-2 border-slate-950" />
                  <div className="absolute top-4 right-6 w-8 h-8 bg-yellow-100/10 rounded-lg border-2 border-slate-950" />
                </div>

                {/* Label */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 px-4 py-1 rounded-full border border-slate-700 text-xs font-bold text-white shadow-xl whitespace-nowrap">
                  {u.name}'s House
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default UnicornAlleyView;
