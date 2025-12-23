import React from "react";
import { Lock } from "lucide-react";
import { UNICORNS } from "../../utils/storage";
import { UnicornAvatar } from "../assets/gameAssets";
import GlobalHeader from "../shared/globalHeader";

const UnicornAlleyView = ({ userData, onEnterRoom, onBack, onHome }) => {
  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col">
      <GlobalHeader
        coins={userData?.coins || 0}
        onBack={onBack}
        isSubScreen={true}
        title="Unicorn Alley"
        onHome={onHome}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-white mb-2">
              Your Unicorn Collection
            </h2>
            <p className="text-slate-400">
              Visit each unicorn's room to decorate and personalize!
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {UNICORNS.map((unicorn) => {
              const isOwned = userData?.ownedUnicorns?.includes(unicorn.id);

              return (
                <div
                  key={unicorn.id}
                  onClick={() => isOwned && onEnterRoom(unicorn.id)}
                  className={`
                    relative bg-slate-900 border-2 rounded-3xl p-6 transition-all
                    ${
                      isOwned
                        ? "border-slate-700 hover:border-cyan-500 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] cursor-pointer group"
                        : "border-slate-800 opacity-60"
                    }
                  `}
                >
                  {!isOwned && (
                    <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm rounded-3xl flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock
                          size={32}
                          className="text-slate-600 mx-auto mb-2"
                        />
                        <p className="text-slate-500 text-sm font-bold">
                          Not Owned
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="relative transition-transform duration-300 active:scale-95 group-hover:scale-110">
                    <div
                      className={`flex flex-col items-center transition-all duration-300 ${
                        isOwned ? "" : "grayscale opacity-70"
                      }`}
                    >
                      <div className="w-32 h-32 mb-4">
                        <UnicornAvatar
                          image={unicorn.image}
                          className="w-full h-full"
                        />
                      </div>

                      <h3
                        className={`text-xl font-bold mb-2 ${unicorn.accent}`}
                      >
                        {unicorn.name}
                      </h3>

                      <p className="text-slate-400 text-sm text-center">
                        {unicorn.desc}
                      </p>

                      {isOwned && (
                        <div className="mt-4 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-bold">
                          ENTER ROOM →
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
