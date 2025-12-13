import React from "react";
import { Lock, Check, ShoppingCart } from "lucide-react";
import { UNICORNS } from "../../utils/storage";
import { UnicornSVG } from "../assets/gameAssets";
import GlobalHeader from "./globalHeader";

const ShopView = ({ userData, onBuy, onEquip, onBack, onHome }) => {
  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col">
      <GlobalHeader
        coins={userData.coins}
        onBack={onBack}
        isSubScreen={true}
        title="Avatar Shop"
        onHome={onHome}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="text-center mb-8">
          <p className="text-slate-500">Customize your jumping companion!</p>
        </div>

        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          {UNICORNS.map((item) => {
            const isOwned = userData.ownedUnicorns.includes(item.id);
            const isEquipped = userData.equippedUnicorn === item.id;
            const canAfford = userData.coins >= item.price;

            return (
              <div
                key={item.id}
                className={`relative bg-slate-900 rounded-3xl p-4 border-2 flex flex-col items-center transition-all ${
                  isEquipped
                    ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                    : "border-slate-800"
                }`}
              >
                <div className="w-24 h-24 mb-4">
                  <UnicornSVG />
                </div>
                <h3 className="font-bold text-white mb-1">{item.name}</h3>

                <div className="mt-auto w-full pt-4">
                  {isOwned ? (
                    <button
                      onClick={() => !isEquipped && onEquip(item.id)}
                      className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 ${
                        isEquipped
                          ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <Check size={16} /> EQUIPPED
                        </>
                      ) : (
                        "EQUIP"
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => canAfford && onBuy(item.id, item.price)}
                      disabled={!canAfford}
                      className={`w-full py-2 rounded-xl font-bold flex items-center justify-center gap-2 ${
                        canAfford
                          ? "bg-yellow-500 text-yellow-950 hover:bg-yellow-400"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      {canAfford ? (
                        <ShoppingCart size={16} />
                      ) : (
                        <Lock size={16} />
                      )}
                      {item.price > 0 ? item.price.toLocaleString() : "FREE"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopView;
