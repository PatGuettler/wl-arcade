import React, { useState } from "react";
import { Lock, Home, MapPin } from "lucide-react";
import { UNICORNS } from "../../utils/storage";
import { UnicornSVG } from "../assets/gameAssets";
import GlobalHeader from "../shared/globalHeader";

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
    <div className="w-full h-screen bg-slate-950 flex flex-col relative overflow-hidden">
      <GlobalHeader
        coins={userData.coins}
        onBack={onBack}
        onHome={onHome}
        isSubScreen={true}
        title="Unicorn Alley"
      />

      {/* Toast Message */}
      {toast && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-bold py-2 px-6 rounded-full shadow-xl z-50 animate-pop-in text-sm whitespace-nowrap flex items-center gap-2">
          <Lock size={16} /> {toast}
        </div>
      )}

      <div className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950">
        {/* Central Road Line */}
        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-4 bg-slate-900 border-x border-slate-800 z-0">
          <div className="w-full h-full flex flex-col items-center gap-12 pt-6">
            {/* Road Dashes */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="w-1 h-8 bg-slate-800 rounded-full" />
            ))}
          </div>
        </div>

        <div className="relative z-10 pb-20 pt-10 px-4 max-w-lg mx-auto flex flex-col gap-12">
          {UNICORNS.map((u, index) => {
            const isOwned = userData.ownedUnicorns.includes(u.id);
            const isLeft = index % 2 === 0;

            return (
              <div
                key={u.id}
                className={`flex items-center ${
                  isLeft ? "flex-row" : "flex-row-reverse"
                } gap-4`}
              >
                {/* The House Card */}
                <div
                  onClick={() => handleHouseClick(u.id)}
                  className={`
                    relative flex-1 group cursor-pointer transition-all duration-300
                    ${isOwned ? "hover:scale-105" : "grayscale opacity-70"}
                  `}
                >
                  {/* Connection to Road */}
                  <div
                    className={`absolute top-1/2 -translate-y-1/2 w-8 h-4 bg-slate-800 border-y border-slate-700
                    ${
                      isLeft
                        ? "-right-8 rounded-r-full"
                        : "-left-8 rounded-l-full"
                    }
                    `}
                  />

                  {/* House Structure */}
                  <div className="relative overflow-hidden rounded-3xl border-4 border-slate-800 bg-slate-900 shadow-2xl">
                    {/* Roof / Background Style */}
                    <div className={`h-24 w-full ${u.style} relative`}>
                      {/* Window Shine */}
                      <div className="absolute top-4 left-4 w-8 h-8 bg-white/10 rounded-lg border border-white/20" />
                    </div>

                    {/* House Bottom */}
                    <div className="h-16 bg-slate-800 flex items-end justify-center pb-0 relative">
                      {/* Door */}
                      <div
                        className={`
                            w-12 h-14 rounded-t-full border-4 border-slate-800 
                            ${
                              isOwned
                                ? "bg-amber-900/50 group-hover:bg-amber-500/20"
                                : "bg-slate-900"
                            } 
                            flex items-center justify-center transition-colors
                        `}
                      >
                        {isOwned ? (
                          <div className="w-2 h-2 rounded-full bg-amber-500 ml-6 mt-2 shadow-[0_0_5px_rgba(245,158,11,0.8)]" />
                        ) : (
                          <Lock size={16} className="text-slate-600" />
                        )}
                      </div>
                    </div>

                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur px-3 py-1 rounded-full border border-white/10">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isOwned ? u.accent : "text-slate-500"
                        }`}
                      >
                        {u.name}
                      </span>
                    </div>

                    {!isOwned && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-slate-900 rounded-full border border-slate-700 shadow-xl">
                          <Lock className="text-slate-500" size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          Locked
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-20 flex flex-col items-center justify-center shrink-0">
                  {isOwned ? (
                    <div className="w-16 h-16 animate-float drop-shadow-2xl">
                      <div className={`${isLeft ? "" : "-scale-x-100"}`}>
                        <UnicornSVG />
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-slate-900 rounded-full border-2 border-dashed border-slate-800 flex items-center justify-center">
                      <MapPin size={20} className="text-slate-700" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* End of Road */}
          <div className="text-center pb-10 opacity-50">
            <div className="text-xs font-bold text-slate-600 uppercase tracking-widest">
              More coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnicornAlleyView;
