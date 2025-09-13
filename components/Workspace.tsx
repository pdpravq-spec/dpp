import React from 'react';
import type { GeneratedImage, AppStep } from '../types';
import { ImageCard } from './ImageCard';
import { ImageIcon } from './icons/Icons';

interface WorkspaceProps {
  imageHistory: GeneratedImage[];
  error: string | null;
  currentStep: AppStep;
  onSaveToFinals: (image: GeneratedImage) => void;
}

export const Workspace: React.FC<WorkspaceProps> = ({ imageHistory, error, currentStep, onSaveToFinals }) => {
  const currentImage = imageHistory[0];

  return (
    <div className="flex flex-col h-full bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-4">
      <div 
        className="relative flex-grow flex items-center justify-center mb-4 min-h-[300px] lg:min-h-0 overflow-hidden rounded-lg bg-black/20"
      >
        {error && <div className="text-center p-4 bg-red-900/50 border border-red-500 rounded-lg"><p className="font-bold">An Error Occurred</p><p className="text-sm text-red-300">{error}</p></div>}
        
        {!error && currentImage && (
          <ImageCard image={currentImage} isMain={true} onSaveToFinals={onSaveToFinals} />
        )}

        {!error && !currentImage && (
          <div className="text-center text-gray-500">
            <ImageIcon className="w-24 h-24 mx-auto text-gray-700" />
            <h2 className="mt-4 text-xl font-semibold text-gray-400">Your Canvas Awaits</h2>
            <p className="mt-1 text-sm">Follow the steps on the left to begin forging your poster.</p>
          </div>
        )}
      </div>
      
      {imageHistory.length > 1 && (
        <>
          <h3 className="text-lg font-semibold mb-3 text-cyan-400 border-b-2 border-white/10 pb-2">Version History</h3>
          <div className="flex-shrink-0 flex gap-4 overflow-x-auto pb-3">
            {imageHistory.slice(1).map(img => (
              <div key={img.id} className="w-32 flex-shrink-0">
                <ImageCard image={img} isMain={false} onSaveToFinals={onSaveToFinals} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};