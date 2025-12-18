import React, { useState, useCallback, useEffect } from 'react';
import { Settings, RotateCw, Sparkles, Ticket, Heart, Zap, Camera, Trash2 } from 'lucide-react';
import { PrizeManager } from './components/PrizeManager';
import { ScratchCard } from './components/ScratchCard';
import { Prize } from './types';
import { DEFAULT_PRIZES, INITIAL_TITLE } from './constants';
import { getWeightedRandomPrize } from './utils/probability';

const App: React.FC = () => {
  const [title, setTitle] = useState(INITIAL_TITLE);
  const [logo, setLogo] = useState<string | null>(null);
  const [prizes, setPrizes] = useState<Prize[]>(DEFAULT_PRIZES);
  const [currentPrize, setCurrentPrize] = useState<Prize | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const generateNewTicket = useCallback(() => {
    // 1. Reset state to "Clean" before selecting a new winner
    setIsRevealed(false);
    setCurrentPrize(null);
    
    // 2. Short timeout to allow React to clear the UI before rendering the new prize
    setTimeout(() => {
      const prize = getWeightedRandomPrize(prizes);
      setCurrentPrize(prize);
      setRefreshKey(prev => prev + 1);
    }, 50);
  }, [prizes]);

  // Initial ticket generation
  useEffect(() => {
    generateNewTicket();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogo(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden text-rose-900 bg-[#fff1f2]">
      {/* Configuration Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0 w-full md:w-[26rem]' : '-translate-x-full w-0'}
        fixed md:relative z-40 h-full transition-all duration-500 glass flex flex-col shadow-2xl border-r border-rose-100
      `}>
        <div className="p-8 flex items-center justify-between border-b border-rose-100 bg-white/40">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500 rounded-2xl shadow-lg">
              <Heart className="text-white" size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="font-outfit font-black text-xl tracking-tighter uppercase text-rose-600 leading-none">Pink Lotto</h1>
              <p className="text-[9px] font-black text-rose-300 uppercase tracking-widest mt-1">Clean State v11.0</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-rose-400">
            <RotateCw size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Logo Branding */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <Zap size={16} fill="currentColor" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Branding</h3>
            </div>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-rose-300 uppercase tracking-widest ml-1">Logo Overlay</label>
              {!logo ? (
                <label className="w-full flex items-center justify-center gap-3 bg-white/60 border-2 border-dashed border-rose-200 hover:border-rose-400 rounded-2xl p-6 cursor-pointer transition-all">
                  <Camera size={20} className="text-rose-400" />
                  <span className="text-[10px] font-black uppercase text-rose-900">Upload Brand Logo</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
              ) : (
                <div className="relative group">
                  <img src={logo} className="w-full h-24 object-contain bg-white/60 p-4 rounded-2xl border-2 border-rose-200" />
                  <button onClick={() => setLogo(null)} className="absolute -top-2 -right-2 p-2 bg-white text-rose-400 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Probability System */}
          <PrizeManager prizes={prizes} onChange={setPrizes} />
        </div>

        <div className="p-8 border-t border-rose-100 bg-white/40">
          <button 
            onClick={generateNewTicket}
            className="w-full py-5 bg-rose-500 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:bg-rose-600 transition-all shadow-lg active:scale-95 uppercase tracking-widest"
          >
            <RotateCw size={20} />
            New Card
          </button>
        </div>
      </aside>

      {/* Main Game Area */}
      <main className="flex-1 relative flex flex-col items-center justify-center p-8 lg:p-16">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="fixed top-8 left-8 z-50 p-4 bg-white text-rose-500 rounded-2xl shadow-xl hover:scale-105 transition-all border border-rose-100"
          >
            <Settings size={24} />
          </button>
        )}

        <div className="w-full max-w-5xl flex flex-col items-center gap-10">
          {/* Editable Header */}
          <div className="text-center">
            {logo ? (
              <img src={logo} alt="Logo" className="h-32 object-contain mb-4 animate-float" />
            ) : (
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="text-6xl md:text-8xl font-outfit font-black tracking-tighter uppercase text-center bg-transparent border-none focus:ring-0 text-rose-900 w-full outline-none"
              />
            )}
            <div className="flex items-center justify-center gap-3 text-rose-400 mt-4">
              <Sparkles size={16} />
              <p className="text-[12px] font-black tracking-[0.4em] uppercase">100px Precision Brush</p>
            </div>
          </div>

          {/* The Ticket - Keyed component ensures total re-render and no overlap */}
          {currentPrize && (
            <ScratchCard 
              key={refreshKey}
              prize={currentPrize}
              title={title}
              logo={logo}
              onReveal={() => setIsRevealed(true)}
              isRevealed={isRevealed}
              refreshKey={refreshKey}
            />
          )}

          <button
            onClick={generateNewTicket}
            className="mt-8 px-16 py-6 bg-rose-500 text-white font-black rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl text-xl tracking-widest border-4 border-white uppercase"
          >
            Play Again
          </button>
        </div>
      </main>
    </div>
  );
};

export default App;