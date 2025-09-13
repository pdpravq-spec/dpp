import React from 'react';
import { SparklesIcon, RefreshIcon } from './icons/Icons';

interface HeaderProps {
    onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="bg-black/20 backdrop-blur-xl sticky top-0 z-20 px-4 sm:px-8 border-b border-white/10 flex justify-between items-center h-[72px]">
      <div className="flex items-center gap-3">
        <SparklesIcon className="w-8 h-8 text-cyan-400" />
        <h1 className="text-2xl font-bold text-gray-100 tracking-wider">
          AI <span className="text-cyan-400 text-glow-cyan">Poster Forge</span>
        </h1>
      </div>
       <button
        onClick={onReset}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-red-600 border border-white/10 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:border-red-500 hover:shadow-lg hover:shadow-red-500/30"
      >
        <RefreshIcon className="w-5 h-5" />
        Start Over
      </button>
    </header>
  );
};