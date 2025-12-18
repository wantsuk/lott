
import React from 'react';
import { Prize } from '../types';
import { Plus, Trash2, Award } from 'lucide-react';

interface PrizeManagerProps {
  prizes: Prize[];
  onChange: (prizes: Prize[]) => void;
}

export const PrizeManager: React.FC<PrizeManagerProps> = ({ prizes, onChange }) => {
  const addPrize = () => {
    const newPrize: Prize = {
      id: Date.now().toString(),
      name: 'New Prize',
      weight: 10,
    };
    onChange([...prizes, newPrize]);
  };

  const removePrize = (id: string) => {
    if (prizes.length <= 1) return;
    onChange(prizes.filter(p => p.id !== id));
  };

  const updatePrize = (id: string, updates: Partial<Prize>) => {
    onChange(prizes.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const totalWeight = prizes.reduce((sum, p) => sum + p.weight, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-rose-500" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-rose-300">Prize Logic Pool</h3>
        </div>
        <button 
          onClick={addPrize}
          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-xl transition-all shadow-sm active:scale-90"
        >
          <Plus size={20} />
        </button>
      </div>
      
      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-3 custom-scrollbar">
        {prizes.map((prize) => (
          <div key={prize.id} className="p-5 bg-white/60 border border-rose-50 rounded-[1.5rem] space-y-4 group shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-50 rounded-lg">
                <Award size={16} className="text-rose-400" />
              </div>
              <input
                type="text"
                value={prize.name}
                onChange={(e) => updatePrize(prize.id, { name: e.target.value })}
                className="bg-transparent border-none focus:ring-0 text-sm w-full font-black text-rose-900 tracking-tight"
                placeholder="Prize name..."
              />
              <button 
                onClick={() => removePrize(prize.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={prize.weight}
                onChange={(e) => updatePrize(prize.id, { weight: parseInt(e.target.value) || 1 })}
                className="flex-1 accent-rose-500 h-2 rounded-lg appearance-none bg-rose-50"
              />
              <div className="bg-rose-50 px-3 py-1 rounded-full min-w-[50px] text-center">
                <span className="text-[10px] font-black text-rose-600 uppercase">
                  {((prize.weight / totalWeight) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
