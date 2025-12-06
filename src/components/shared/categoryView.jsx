import { Header } from "./headerView";
import { CATEGORIES } from "../../games/gameConfig";
import { GAMES } from "../../games/gameConfig";
import { ArrowLeft } from "lucide-react";

const CategoryView = ({
  user,
  setCurrentView,
  handleLogout,
  activeCategory,
  goBack,
  userData,
  selectGame,
}) => {
  const category = CATEGORIES.find((c) => c.id === activeCategory);
  const gameList = GAMES[activeCategory] || [];

  return (
    <div className="w-full h-screen bg-slate-950 p-6 overflow-y-auto">
      <div className="max-w-md mx-auto">
        <Header
          user={user}
          setCurrentView={setCurrentView}
          handleLogout={handleLogout}
        />
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back to Dashboard
        </button>
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center text-slate-900`}
          >
            <category.icon size={24} />
          </div>
          <h2 className="text-3xl font-black text-white">{category.title}</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {gameList.length > 0 ? (
            gameList.map((game) => (
              <div
                key={game.id}
                onClick={() => selectGame(game.id)}
                className="bg-slate-900 border border-slate-800 p-4 rounded-2xl cursor-pointer hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.1)] transition-all active:scale-[0.98] flex flex-col items-center text-center aspect-square justify-center"
              >
                <div className="text-4xl mb-3">{game.icon}</div>
                <h3 className="font-bold text-white text-sm mb-1">
                  {game.title}
                </h3>
                <div className="mt-2 px-2 py-1 bg-slate-800 rounded text-[10px] text-emerald-400 font-mono border border-slate-700">
                  {userData[game.id]?.maxLevel > 1
                    ? `Last: ${userData[game.id].maxLevel}`
                    : "Start"}
                </div>
                <p className="text-xs text-slate-500 mt-2">{game.desc}</p>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-10 text-center text-slate-600 border border-dashed border-slate-800 rounded-2xl">
              No games available in this category yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryView;
