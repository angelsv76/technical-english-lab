import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);
  const lastClickTime = useRef<number>(0);

  const handleLogoClick = () => {
    const now = Date.now();
    
    // If more than 3 seconds passed since last click sequence started, reset count
    if (now - lastClickTime.current > 3000) {
      setClickCount(1);
      lastClickTime.current = now;
    } else {
      const newCount = clickCount + 1;
      setClickCount(newCount);
      
      if (newCount >= 5) {
        navigate('/teacher-login');
        setClickCount(0); // Reset after navigation
      }
    }
  };

  return (
    <footer className="bg-zinc-900 text-zinc-500 py-12 px-6 border-t border-zinc-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-3">
          {/* Hidden click trigger on the logo/icon */}
          <div 
            onClick={handleLogoClick}
            className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center cursor-default select-none"
          >
            <Settings size={20} className="text-zinc-600" />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm tracking-tight">Technical English Lab</h3>
            <p className="text-[10px] uppercase tracking-widest font-mono">Software Development</p>
            <div className="mt-2 text-[10px] text-zinc-400">
              <p>Designed by Angel Sanchez</p>
              <p>Instituto Nacional Tecnico Industrial</p>
              <p className="italic">Educational use for Software Development students</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center md:items-end gap-2">
          <div className="text-center md:text-right">
            <p className="text-xs">© Angel Sanchez – Educational Software</p>
            <p className="text-[10px] uppercase tracking-widest">All rights reserved.</p>
          </div>
          <div className="flex gap-4 text-[10px] uppercase tracking-widest font-bold mt-2">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-white transition-colors cursor-pointer">Support</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
