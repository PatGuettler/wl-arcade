
const LoginView = ({ user, setUser, handleLogin }) => {
  return(
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500" />
          <div className="text-center mb-10"><div className="w-20 h-20 bg-slate-800 rounded-2xl mx-auto mb-4 flex items-center justify-center border border-slate-700 shadow-inner"><span className="text-4xl">🎮</span></div><h1 className="text-3xl font-black text-white mb-2">WL<span className="text-cyan-400">ARCADE</span></h1><p className="text-slate-400 text-sm">Train your brain with code-based games.</p></div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div><label className="block text-slate-500 text-xs font-bold uppercase mb-2 ml-1">Username</label><input type="text" value={user} onChange={(e) => setUser(e.target.value)} placeholder="Enter player name..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 transition-colors" autoFocus /></div>
            <button type="submit" disabled={!user.trim()} className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:bg-cyan-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]">ENTER ARCADE</button>
          </form>
        </div>
      </div>
  );
};

export default LoginView;