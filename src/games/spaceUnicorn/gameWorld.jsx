import React from "react";

const GameWorld = ({ words, projectiles, unicornImage }) => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Falling words */}
      {words.map((w) => (
        <div
          key={w.id}
          className={`absolute text-white font-bold text-lg select-none transition-opacity duration-300 ${
            w.destroyed ? "opacity-0" : "opacity-100"
          }`}
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 10,
          }}
        >
          {w.text}
        </div>
      ))}

      {/* Projectiles */}
      {projectiles.map((p) => (
        <div
          key={p.id}
          className="absolute w-16 h-16 transition-all duration-500"
          style={{
            left: `${p.target.x}%`,
            top: `${p.status === "flying" ? p.target.y : p.target.y - 10}%`,
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        >
          <img
            src={unicornImage}
            alt="Unicorn"
            className={`w-full h-full ${
              p.status === "hit" ? "animate-ping" : ""
            }`}
          />
          {p.status === "hit" && (
            <div className="absolute inset-0 text-4xl animate-bounce">💥</div>
          )}
        </div>
      ))}
    </div>
  );
};

export default GameWorld;
