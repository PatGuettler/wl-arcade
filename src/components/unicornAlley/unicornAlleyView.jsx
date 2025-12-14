import React, { useState } from "react";
import { Lock, MapPin } from "lucide-react";
import { UNICORNS } from "../../utils/storage";
import { UnicornSVG } from "../assets/gameAssets";
import GlobalHeader from "../shared/globalHeader";
import alleyMap from "./unicornAlleyMap.jpeg";

// CONFIGURATION: Adjust these percentages to match the houses in your image!
// format: { top: '10%', left: '20%' }
const HOUSE_POSITIONS = [
  { top: "15%", left: "20%" }, // Sparkle
  { top: "28%", left: "70%" }, // Rainbow Dash
  { top: "42%", left: "25%" }, // Stardust
  { top: "58%", left: "65%" }, // Nimbus
  { top: "72%", left: "30%" }, // Dreamer
  { top: "85%", left: "75%" }, // Mystic
];

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

      {/* Scrollable Map Container */}
      <div className="flex-1 overflow-y-auto relative bg-slate-950 no-scrollbar">
        <div className="relative w-full min-h-full">
          {/* The Background Image - Scalable */}
          <img
            src={alleyMap}
            alt="Unicorn Alley Map"
            className="w-full h-auto object-cover min-h-[100vh]"
          />

          {/* Overlay Layer */}
          <div className="absolute inset-0">
            {UNICORNS.map((u, index) => {
              const isOwned = userData.ownedUnicorns.includes(u.id);
              // Fallback to the last position if we run out of configured spots
              const pos = HOUSE_POSITIONS[index] || { top: "50%", left: "50%" };

              return (
                <div
                  key={u.id}
                  onClick={() => handleHouseClick(u.id)}
                  style={{ top: pos.top, left: pos.left }}
                  className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer group z-10"
                >
                  {/* Status Indicator (Avatar or Lock) */}
                  <div className="relative transition-transform duration-300 active:scale-95 group-hover:scale-110">
                    {isOwned ? (
                      // Unlocked: Show Unicorn Avatar Floating
                      <div className="flex flex-col items-center">
                        {/* Name Tag */}
                        <div
                          className={`
                          mb-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 
                          text-[10px] font-bold uppercase tracking-wider ${u.accent} shadow-lg whitespace-nowrap
                        `}
                        >
                          {u.name}
                        </div>

                        {/* Avatar */}
                        <div className="w-16 h-16 filter drop-shadow-2xl animate-float">
                          <UnicornSVG />
                        </div>

                        {/* "Enter" hint on hover */}
                        <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap">
                          ENTER HOUSE
                        </div>
                      </div>
                    ) : (
                      // Locked: Show Padlock Overlay
                      <div className="flex flex-col items-center">
                        {/* Name Tag (Grayed out) */}
                        <div className="mb-1 px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur border border-slate-700 text-[10px] font-bold text-slate-500 uppercase tracking-wider shadow-lg whitespace-nowrap">
                          {u.name}
                        </div>

                        <div className="w-14 h-14 bg-slate-900/90 rounded-2xl border-2 border-slate-700 flex items-center justify-center shadow-xl">
                          <Lock className="text-slate-500" size={24} />
                        </div>

                        <div className="mt-1 text-[10px] font-bold text-rose-400 bg-rose-950/50 px-2 rounded">
                          LOCKED
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnicornAlleyView;
