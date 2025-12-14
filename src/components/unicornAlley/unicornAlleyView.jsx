import React, { useState } from "react";
import { Lock } from "lucide-react";
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
  { top: "50%", left: "50%" }, // Mystic
];

const UnicornAlleyView = ({ userData, onEnterRoom, onBack, onHome }) => {
  const handleHouseClick = (unicornId) => {
    if (userData.ownedUnicorns.includes(unicornId)) {
      onEnterRoom(unicornId);
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

      {/* Main Map Container - Ensures full visibility */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden w-full h-full">
        {/* Relative wrapper that shrinks to fit the image dimensions */}
        <div className="relative shadow-2xl rounded-2xl border border-slate-800 bg-slate-900">
          <img
            src={alleyMap}
            alt="Unicorn Alley Map"
            className="max-w-full max-h-[calc(100vh-8rem)] w-auto h-auto block rounded-2xl object-contain pointer-events-none select-none"
          />

          {/* Overlay Layer - Matches the exact size of the rendered image */}
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
                  <div className="relative transition-transform duration-300 active:scale-95 group-hover:scale-110">
                    {/* Unified Avatar Display with Conditional Styling */}
                    <div
                      className={`flex flex-col items-center transition-all duration-300 ${
                        isOwned ? "" : "grayscale opacity-70"
                      }`}
                    >
                      {/* Name Tag */}
                      <div
                        className={`
                        mb-1 px-2 py-0.5 rounded-full backdrop-blur border text-[10px] font-bold uppercase tracking-wider shadow-lg whitespace-nowrap
                        ${
                          isOwned
                            ? `bg-slate-900/80 border-white/20 ${u.accent}`
                            : "bg-slate-900/90 border-slate-700 text-slate-500"
                        }
                      `}
                      >
                        {u.name}
                      </div>

                      {/* Avatar */}
                      <div
                        className={`w-16 h-16 filter drop-shadow-2xl ${
                          isOwned ? "animate-float" : ""
                        }`}
                      >
                        <UnicornSVG />
                      </div>

                      {/* Locked Badge Overlay */}
                      {!isOwned && (
                        <div className="absolute bottom-6 -right-2 bg-slate-900 p-1.5 rounded-full border border-slate-600 shadow-lg z-20">
                          <Lock size={12} className="text-slate-400" />
                        </div>
                      )}

                      {/* "Enter" hint on hover (Only for owned) */}
                      {isOwned && (
                        <div className="absolute -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-slate-900 text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap shadow-lg z-20">
                          ENTER HOUSE
                        </div>
                      )}
                    </div>
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
