import React, { useState, useEffect } from 'react';
import type { GeneratedImage } from '../types';
import { DownloadIcon, TrashIcon, CollectionIcon, XIcon } from './icons/Icons';

interface FinalsPanelProps {
  posters: GeneratedImage[];
  onRemove: (id: string) => void;
}

const DownloadModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onExport: (quality: 'normal' | 'high' | 'ultra') => void;
  originalDimensions: { w: number; h: number } | null;
}> = ({ isOpen, onClose, onExport, originalDimensions }) => {
  if (!isOpen || !originalDimensions) return null;

  const qualityLevels = { normal: 1024, high: 3072, ultra: 5120 };

  const calculateDimensions = (quality: 'normal' | 'high' | 'ultra') => {
    const targetLongestSide = qualityLevels[quality];
    const { w, h } = originalDimensions;
    if (w >= h) {
      return { w: targetLongestSide, h: Math.round((h / w) * targetLongestSide) };
    }
    return { w: Math.round((w / h) * targetLongestSide), h: targetLongestSide };
  };

  const normalDims = calculateDimensions('normal');
  const highDims = calculateDimensions('high');
  const ultraDims = calculateDimensions('ultra');

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-gray-900/70 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6 w-full max-w-sm shadow-2xl shadow-cyan-500/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-bold text-gray-100 text-glow-cyan">Export Resolution</h4>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                <XIcon className="w-6 h-6 text-gray-400" />
            </button>
        </div>
        <div className="space-y-3">
            <button onClick={() => onExport('normal')} className="w-full text-left p-4 bg-black/20 hover:bg-cyan-600/50 border border-white/10 hover:border-cyan-500 rounded-lg transition-all group">
                <p className="font-semibold text-gray-100">Normal</p>
                <p className="text-sm text-gray-400 group-hover:text-cyan-100">{normalDims.w} x {normalDims.h} px - Good for web</p>
            </button>
            <button onClick={() => onExport('high')} className="w-full text-left p-4 bg-black/20 hover:bg-fuchsia-600/50 border border-white/10 hover:border-fuchsia-500 rounded-lg transition-all group">
                <p className="font-semibold text-gray-100">High Resolution</p>
                <p className="text-sm text-gray-400 group-hover:text-fuchsia-100">{highDims.w} x {highDims.h} px - Good for print</p>
            </button>
            <button onClick={() => onExport('ultra')} className="w-full text-left p-4 bg-black/20 hover:bg-blue-600/50 border border-white/10 hover:border-blue-500 rounded-lg transition-all group">
                <p className="font-semibold text-gray-100">Ultra High Resolution</p>
                <p className="text-sm text-gray-400 group-hover:text-blue-100">{ultraDims.w} x {ultraDims.h} px - Professional quality</p>
            </button>
        </div>
      </div>
    </div>
  );
};


const FinalPosterCard: React.FC<{ poster: GeneratedImage; onRemove: (id: string) => void }> = ({ poster, onRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dimensions, setDimensions] = useState<{w: number, h: number} | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setDimensions({ w: img.width, h: img.height });
    };
    img.src = poster.src;
  }, [poster.src]);

  const handleExport = (quality: 'normal' | 'high' | 'ultra') => {
    if (!dimensions) return;

    const qualityLevels = { normal: 1024, high: 3072, ultra: 5120 };
    const targetLongestSide = qualityLevels[quality];

    const img = new Image();
    img.onload = () => {
        const { w: originalWidth, h: originalHeight } = dimensions;
        let targetWidth, targetHeight;

        if (originalWidth >= originalHeight) {
            targetWidth = targetLongestSide;
            targetHeight = Math.round((originalHeight / originalWidth) * targetLongestSide);
        } else {
            targetHeight = targetLongestSide;
            targetWidth = Math.round((originalWidth / originalHeight) * targetLongestSide);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        const dataUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `poster-${poster.id}-${quality}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setIsModalOpen(false);
    };
    img.src = poster.src;
  };

  return (
    <>
      <DownloadModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onExport={handleExport}
        originalDimensions={dimensions}
      />
      <div className="bg-black/20 rounded-lg overflow-hidden group relative border border-white/10">
        <img 
          src={poster.src} 
          alt={poster.prompt} 
          className="w-full h-auto aspect-[4/5] object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsModalOpen(true)} title="Download Poster" className="p-2 bg-blue-600/80 hover:bg-blue-500 rounded-full text-white transition-all transform hover:scale-110"><DownloadIcon className="w-4 h-4" /></button>
            <button onClick={() => onRemove(poster.id)} title="Remove Poster" className="p-2 bg-red-600/80 hover:bg-red-500 rounded-full text-white transition-all transform hover:scale-110"><TrashIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </>
  );
};

export const FinalsPanel: React.FC<FinalsPanelProps> = ({ posters, onRemove }) => {
  return (
    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-4 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-cyan-400 border-b-2 border-white/10 pb-2">Final Selections</h3>
      {posters.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 p-4">
            <CollectionIcon className="w-16 h-16 text-gray-700"/>
            <p className="mt-4 font-semibold text-gray-400">Your gallery awaits.</p>
            <p className="text-sm mt-1">Click the "Save" icon on a generated poster to add it here for export.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 overflow-y-auto">
          {posters.map(poster => (
            <FinalPosterCard key={poster.id} poster={poster} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
};