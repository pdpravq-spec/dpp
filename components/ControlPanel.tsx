import React from 'react';
import type { AppState, AspectRatio } from '../types';
import { ASPECT_RATIOS } from '../constants';
import { UploadIcon, MagicIcon, WandIcon, ArrowRightIcon } from './icons/Icons';

interface ControlPanelProps {
  state: AppState;
  updateState: <K extends keyof AppState>(key: K, value: AppState[K]) => void;
  onFilesSelected: (files: File[]) => void;
  onRemoveBackground: () => void;
  onCreatePoster: () => void;
  onRefinePoster: () => void;
}

const Section: React.FC<{ title: string; step: number; isActive: boolean; children: React.ReactNode }> = ({ title, step, isActive, children }) => (
    <div className={`p-4 border rounded-xl transition-all duration-500 ${isActive ? 'bg-black/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10' : 'bg-black/20 border-white/10'}`}>
        <h3 className="flex items-center text-lg font-semibold mb-4 text-gray-100">
            <span className={`flex items-center justify-center w-7 h-7 mr-3 text-sm rounded-full transition-all duration-500 ${isActive ? 'bg-cyan-500 text-gray-900 font-bold' : 'bg-gray-700 text-gray-300'}`}>{step}</span>
            {title}
        </h3>
        <div className={`${!isActive ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
            {children}
        </div>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ state, updateState, onFilesSelected, onRemoveBackground, onCreatePoster, onRefinePoster }) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(Array.from(e.target.files));
        }
    };

    return (
        <div className="space-y-6">
            <Section title="Upload Product Image(s)" step={1} isActive={state.currentStep === 'upload' || state.currentStep === 'background_removed'}>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-black/20 hover:bg-black/40 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <UploadIcon className="w-8 h-8 mb-3 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-400"><span className="font-semibold text-gray-300">Click to upload</span> or drag</p>
                            <p className="text-xs text-gray-500">PNG, JPG, WEBP (multi-select enabled)</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} multiple />
                    </label>
                </div>

                {state.productImages.length > 0 && (
                    <div className="mt-4">
                        <p className="text-sm font-medium mb-2 text-gray-300">Select primary image:</p>
                        <div className="flex gap-2.5 overflow-x-auto py-2 px-1">
                            {state.productImages.map((file, index) => (
                                <div key={file.name + index} className="relative cursor-pointer group w-20 h-20 flex-shrink-0" onClick={() => updateState('primaryImageIndex', index)}>
                                    <img src={URL.createObjectURL(file)} alt={`product-${index}`} className={`rounded-md w-full h-full object-cover aspect-square transition-all duration-300 ${state.primaryImageIndex === index ? 'shadow-lg shadow-cyan-500/20' : 'opacity-60 group-hover:opacity-100'}`} />
                                     <div className={`absolute inset-0 rounded-md ring-2 ring-inset transition-all duration-300 ${state.primaryImageIndex === index ? 'ring-cyan-400' : 'ring-transparent group-hover:ring-white/50'}`}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                 )}

                {state.productImages.length > 0 && (
                    <div className="mt-4">
                        <button onClick={onRemoveBackground} disabled={state.isLoading || state.primaryImageIndex === null} className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:glow-cyan">
                            <MagicIcon className="w-5 h-5"/> Remove Background
                        </button>
                    </div>
                )}
            </Section>

            <Section title="Define Poster Concept" step={2} isActive={state.currentStep === 'concept'}>
                 <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                        <div className="grid grid-cols-5 gap-2">
                            {ASPECT_RATIOS.map(ratio => (
                                <button key={ratio} onClick={() => updateState('aspectRatio', ratio)} className={`px-2 py-1.5 text-xs font-semibold rounded-md transition-colors duration-300 ${state.aspectRatio === ratio ? 'bg-cyan-500 text-gray-900 glow-cyan' : 'bg-gray-800 hover:bg-gray-700'}`}>{ratio}</button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="concept" className="block text-sm font-medium mb-2">Poster Idea (AI Suggested)</label>
                        <textarea id="concept" rows={4} value={state.concept} onChange={(e) => updateState('concept', e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-2.5 text-sm focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                            placeholder="e.g., A futuristic city skyline at night with neon lights..." />
                    </div>
                    <button onClick={onCreatePoster} disabled={!state.concept || state.isLoading} className="w-full flex items-center justify-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:glow-fuchsia">
                       <WandIcon className="w-5 h-5"/>
                        Generate Poster
                    </button>
                </div>
            </Section>

            <Section title="Iterate & Refine" step={3} isActive={state.currentStep === 'refine'}>
                 <div className="space-y-4">
                    <div>
                        <label htmlFor="refinement" className="block text-sm font-medium mb-2">Refinement Prompt</label>
                         <textarea id="refinement" rows={3} value={state.refinement} onChange={(e) => updateState('refinement', e.target.value)}
                            className="w-full bg-black/30 border border-white/20 rounded-lg p-2.5 text-sm focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500"
                            placeholder="e.g., Make the background darker, add a glowing aura..." />
                    </div>
                    <button onClick={onRefinePoster} disabled={!state.refinement || state.isLoading} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:glow-blue">
                       <ArrowRightIcon className="w-5 h-5"/>
                        Apply Refinement
                    </button>
                </div>
            </Section>
        </div>
    );
};