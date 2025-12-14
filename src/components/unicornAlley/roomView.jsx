import React, { useState, useRef, useEffect } from "react";
import { Move, Briefcase, Plus, X } from "lucide-react";
import { UNICORNS, FURNITURE } from "../../utils/storage";
import GlobalHeader from "../shared/globalHeader";

const RoomView = ({
  unicornId,
  userData,
  onPlaceItem,
  onRemoveItem,
  onBack,
  onHome,
}) => {
  const [isBagOpen, setIsBagOpen] = useState(false);
  const unicorn = UNICORNS.find((u) => u.id === unicornId);

  const placedItems = userData.furniture.placements[unicornId] || [];

  const getAvailableCount = (itemId) => {
    const totalPurchased = userData.furniture.inventory[itemId] || 0;

    let totalPlaced = 0;
    Object.values(userData.furniture.placements).forEach((roomItems) => {
      roomItems.forEach((i) => {
        if (i.itemId === itemId) totalPlaced++;
      });
    });

    return Math.max(0, totalPurchased - totalPlaced);
  };

  const handleDragStart = (e, item, instanceId = null, startX, startY) => {
    // Basic touch drag implementation
    const touch = e.touches[0];
    const offset = instanceId ? { x: startX, y: startY } : { x: 0, y: 0 };

    //@TODO:
    // This is a simplified DND logic. For production, consider a library like 'react-draggable'
    // or a custom hook like useGameViewport but simpler.
    // For this implementation place item on "Touch End" relative to the container.
  };

  const spawnItem = (itemId) => {
    if (getAvailableCount(itemId) > 0) {
      const instanceId = Date.now().toString();
      onPlaceItem(unicornId, {
        instanceId,
        itemId,
        x: 50, // Percent
        y: 50,
      });
      setIsBagOpen(false);
    }
  };

  return (
    <div className="w-full h-screen bg-slate-950 flex flex-col overflow-hidden">
      <GlobalHeader
        coins={userData.coins}
        onBack={onBack}
        onHome={onHome}
        isSubScreen={true}
        title={`${unicorn?.name}'s Room`}
      />

      <div className="flex-1 relative overflow-hidden">
        {/* Room Background */}
        <div className={`absolute inset-0 ${unicorn?.style} opacity-100`}>
          {/* Floor */}
          <div className="absolute bottom-0 w-full h-1/3 bg-white/5 backdrop-blur-sm border-t border-white/10" />
        </div>

        {/* Placed Items */}
        {placedItems.map((item) => {
          const def = FURNITURE.find((f) => f.id === item.itemId);
          return (
            <DraggableItem
              key={item.instanceId}
              def={def}
              data={item}
              onSave={(x, y) => onPlaceItem(unicornId, { ...item, x, y })}
              onRemove={() => onRemoveItem(unicornId, item.instanceId)}
            />
          );
        })}

        {/* UI Overlay */}
        <div className="absolute bottom-6 right-6 z-50">
          <button
            onClick={() => setIsBagOpen(true)}
            className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-lg border-4 border-white/20 flex items-center justify-center text-yellow-950 animate-bounce"
          >
            <Briefcase size={28} />
          </button>
        </div>

        {/* Bag Modal */}
        {isBagOpen && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end animate-fade-in">
            <div className="w-full bg-slate-900 rounded-t-3xl p-6 border-t border-slate-700 h-[60vh] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-white font-bold text-xl">Furniture Bag</h2>
                <button
                  onClick={() => setIsBagOpen(false)}
                  className="p-2 bg-slate-800 rounded-full text-white"
                >
                  <X />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 overflow-y-auto">
                {FURNITURE.map((f) => {
                  const available = getAvailableCount(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => spawnItem(f.id)}
                      disabled={available <= 0}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 relative ${
                        available > 0
                          ? "bg-slate-800 border-slate-700 active:border-cyan-500"
                          : "bg-slate-900 border-slate-800 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="text-3xl">{f.icon}</div>
                      <div className="text-xs text-slate-400 font-bold">
                        {f.name}
                      </div>
                      <div
                        className={`absolute top-2 right-2 text-[10px] font-black px-2 py-0.5 rounded-full ${
                          available > 0
                            ? "bg-emerald-500 text-emerald-950"
                            : "bg-slate-700 text-slate-500"
                        }`}
                      >
                        x{available}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DraggableItem = ({ def, data, onSave, onRemove }) => {
  const [pos, setPos] = useState({ x: data.x, y: data.y });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setPos({ x: data.x, y: data.y });
  }, [data]);

  const handleStart = (clientX, clientY) => {
    setIsDragging(true);
    startPos.current = { x: clientX, y: clientY };
  };

  const handleMove = (clientX, clientY) => {
    if (!isDragging) return;

    const dxPercent =
      ((clientX - startPos.current.x) / window.innerWidth) * 100;
    const dyPercent =
      ((clientY - startPos.current.y) / window.innerHeight) * 100;

    setPos((prev) => ({
      x: Math.max(0, Math.min(90, prev.x + dxPercent)),
      y: Math.max(0, Math.min(90, prev.y + dyPercent)),
    }));

    startPos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    setIsDragging(false);
    onSave(pos.x, pos.y);
  };

  return (
    <div
      className="absolute flex flex-col items-center justify-center w-16 h-16 touch-none select-none z-20 active:z-50 active:scale-110 transition-transform"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      onTouchStart={(e) =>
        handleStart(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchMove={(e) =>
        handleMove(e.touches[0].clientX, e.touches[0].clientY)
      }
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => isDragging && handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      <div className="text-5xl drop-shadow-xl filter">{def.icon}</div>
      <button
        className="absolute -top-4 -right-4 bg-rose-500 text-white rounded-full p-1 shadow-md scale-0 active:scale-100 transition-transform"
        onTouchEnd={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          onRemove();
        }}
      >
        <X size={12} />
      </button>
    </div>
  );
};

export default RoomView;
