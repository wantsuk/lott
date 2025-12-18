import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Prize } from '../types';

interface ScratchCardProps {
  prize: Prize;
  title: string;
  logo: string | null;
  onReveal: () => void;
  isRevealed: boolean;
  refreshKey: number;
}

export const ScratchCard: React.FC<ScratchCardProps> = ({ 
  prize, 
  title, 
  logo,
  onReveal, 
  isRevealed,
  refreshKey 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [revealedPercent, setRevealedPercent] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas size and scratch layer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // MANDATORY FIX: Explicitly match internal dimensions to visual size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // CLEAN SLATE: Wipe any existing marks from the previous session
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    
    // Solid Pink Cover (#fda4af)
    ctx.fillStyle = '#fda4af';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Texture (Speckles)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for(let i = 0; i < 30; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, Math.random() * 40, 0, Math.PI * 2);
      ctx.fill();
    }

    // Scratch Prompt Text
    const fontSize = Math.min(canvas.width / 12, 64);
    ctx.font = `900 ${fontSize}px Outfit`;
    ctx.fillStyle = '#be185d';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2);
    
    ctx.font = `800 ${fontSize / 3}px Outfit`;
    ctx.fillText('CLICK & DRAG', canvas.width / 2, canvas.height / 2 + (fontSize * 0.8));

    setRevealedPercent(0);
    setIsDrawing(false);
  }, []); // Only runs on mount - parent handles the reset by re-mounting this component

  useEffect(() => {
    if (revealedPercent >= 60 && !isRevealed) {
      onReveal();
    }
  }, [revealedPercent, isRevealed, onReveal]);

  const scratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isRevealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    // PRECISION COORDINATE FIX: Account for visual/canvas ratio
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    // MEGA BRUSH: 100px radius for satisfying reveal
    ctx.arc(x, y, 100, 0, Math.PI * 2);
    ctx.fill();

    // Occasional progress check to avoid lag
    if (Math.random() > 0.9) {
      checkProgress();
    }
  }, [isDrawing, isRevealed]);

  const checkProgress = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] === 0) transparent++;
    }
    setRevealedPercent((transparent / (pixels.length / 4)) * 100);
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    scratch(e);
  };

  const handleEnd = () => {
    setIsDrawing(false);
    checkProgress();
  };

  return (
    <div className="relative w-full max-w-4xl aspect-[2/1] rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(225,29,72,0.3)] bg-white border-[12px] border-white group select-none">
      {/* Hidden Prize Layer - This container only exists for the current winner */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-50 p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fb7185 1px, transparent 0)', backgroundSize: '30px 30px' }} />

        {/* High Visibility Prize Box */}
        <div className={`z-10 transition-all duration-700 transform ${isRevealed ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
          <div className="bg-white px-12 py-10 md:px-24 md:py-16 rounded-[4rem] shadow-2xl border-[10px] border-pink-500 flex flex-col items-center min-w-[320px]">
            <span className="text-pink-400 text-[10px] font-black tracking-[0.6em] uppercase mb-6">OFFICIAL RESULT</span>
            <h3 className="text-5xl md:text-7xl font-outfit font-black text-rose-600 text-center leading-tight tracking-tighter">
              {prize.name}
            </h3>
            <div className="w-16 h-1.5 bg-rose-100 rounded-full mt-10" />
          </div>
        </div>

        {/* Bottom Branding Bar */}
        <div className="absolute bottom-8 left-0 w-full px-12 flex justify-between items-center opacity-30 pointer-events-none text-rose-900 font-black text-[11px] tracking-[0.4em] uppercase">
          {logo ? (
            <img src={logo} alt="Logo" className="h-6 object-contain grayscale invert" />
          ) : (
            <span>{title}</span>
          )}
          <span>VALID UNTIL 2025</span>
        </div>
      </div>

      {/* Interactive Layer */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full touch-none cursor-crosshair transition-opacity duration-1000 ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={handleStart}
        onMouseMove={scratch}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={scratch}
        onTouchEnd={handleEnd}
      />
    </div>
  );
};