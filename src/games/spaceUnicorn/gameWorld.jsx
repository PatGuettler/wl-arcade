import React, { useEffect, useState, useRef } from "react";

const GameWorld = ({ unicornImage }) => {
  const [words, setWords] = useState([]);
  const [projectiles, setProjectiles] = useState([]);
  const animationRef = useRef();

  // Add a new word every second
  useEffect(() => {
    const interval = setInterval(() => {
      const newWord = {
        id: Date.now(),
        text: ["sparkle", "zoom", "unicorn", "galaxy", "moon", "star"][
          Math.floor(Math.random() * 6)
        ],
        x: Math.random() * 90 + 5, // horizontal position %
        y: 0, // start at top
        speed: 0.2 + Math.random() * 0.3,
      };
      setWords((prev) => [...prev, newWord]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Animate falling words
  useEffect(() => {
    const animate = () => {
      setWords(
        (prev) =>
          prev.map((w) => ({ ...w, y: w.y + w.speed })).filter((w) => w.y < 100) // remove words that reached bottom
      );

      setProjectiles(
        (prev) => prev.map((p) => ({ ...p, y: p.y - 2 })) // projectiles move up
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Handle typing/shooting a word
  const handleWordTyped = (typedWord) => {
    setWords((prev) => prev.filter((w) => w.text !== typedWord));
    setProjectiles((prev) => [
      ...prev,
      { id: Date.now(), x: 50, y: 90, target: typedWord },
    ]);
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-gradient-to-b from-purple-900 via-purple-800 to-black">
      {/* Falling words */}
      {words.map((w) => (
        <div
          key={w.id}
          className="absolute text-white font-bold text-lg select-none"
          style={{
            left: `${w.x}%`,
            top: `${w.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          {w.text}
        </div>
      ))}

      {/* Projectiles */}
      {projectiles.map((p) => (
        <img
          key={p.id}
          src={unicornImage}
          alt="Unicorn"
          className="absolute w-12 h-12"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}

      {/* Example input box for typing */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 w-96">
        <input
          type="text"
          className="w-full p-3 rounded bg-gray-900 text-white"
          placeholder="Type a word to shoot..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              handleWordTyped(e.target.value.trim());
              e.target.value = "";
            }
          }}
        />
      </div>
    </div>
  );
};

export default GameWorld;
