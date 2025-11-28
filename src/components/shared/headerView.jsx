  import { User, LogOut } from 'lucide-react';

  export const Header = ({user, setCurrentView, handleLogout }) => (
    <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('profile')}>
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <User size={20} className="text-slate-400" />
            </div>
            <div>
                <div className="text-xs text-slate-500 font-bold uppercase">Welcome back</div>
                <div className="text-white font-bold">{user}</div>
            </div>
        </div>
        <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white transition-colors">
            <LogOut size={20} />
        </button>
    </header>
  );