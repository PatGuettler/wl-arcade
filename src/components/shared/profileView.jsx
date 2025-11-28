import React from 'react';
// Add 'User' to the list of imports
import { ArrowLeft, User } from 'lucide-react';

const ProfileView = ({ user, data, onBack }) => {
  return(
    <div className="w-full h-screen bg-slate-950 p-6 overflow-y-auto animate-fade-in">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-white mb-6 transition-colors group"><ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard</button>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center border-2 border-cyan-500/30"><User size={32} className="text-cyan-400" /></div>
            <div><h2 className="text-2xl font-black text-white">{user}</h2><p className="text-emerald-400 text-xs font-bold uppercase tracking-wider">PRO MEMBER</p></div>
          </div>
        </div>
        <h3 className="text-slate-400 font-bold uppercase text-sm mb-4 pl-2">Game Stats</h3>
        <div className="space-y-4">
           {['unicorn','sliding','coin','cash'].map(g => (
             <div key={g} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                   <h4 className="font-bold text-white capitalize">{g === 'unicorn' ? 'Unicorn Jump' : g === 'sliding' ? 'Sliding Window' : g === 'coin' ? 'Coin Count' : 'Cash Counter'}</h4>
                   <div className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700"><span className="text-slate-400 text-xs">MAX LVL</span> <span className="text-white font-bold ml-1">{data[g]?.maxLevel || 1}</span></div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileView;