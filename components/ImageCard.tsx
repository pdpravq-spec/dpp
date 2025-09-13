import React from 'react';
import type { GeneratedImage } from '../types';
import { SaveIcon } from './icons/Icons';

interface ImageCardProps {
  image: GeneratedImage;
  isMain: boolean;
  onSaveToFinals: (image: GeneratedImage) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ image, isMain, onSaveToFinals }) => {
  
  return (
    <div className={`relative group w-full ${isMain ? '' : 'aspect-square'}`}>
      <img
        src={image.src}
        alt={image.prompt}
        className="rounded-lg object-contain w-full h-full"
      />
      <div className={`absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg ${isMain ? '' : 'text-xs'}`}>
        <p className="font-semibold text-gray-200">{image.prompt}</p>
        <div className={`flex gap-2 ${isMain ? 'mt-4' : 'mt-2'}`}>
           <button onClick={() => onSaveToFinals(image)} title="Save to Finals" className={`flex items-center gap-1.5 p-2 rounded-lg bg-green-600/80 hover:bg-green-500 text-white font-semibold transition-all duration-300 transform hover:scale-105 ${isMain ? 'px-4' : 'px-2 text-xs'}`}>
            <SaveIcon className="w-4 h-4" /> {isMain && 'Save to Finals'}
          </button>
        </div>
      </div>
    </div>
  );
};