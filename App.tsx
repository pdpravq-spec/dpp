import React, { useState, useCallback, useEffect } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { Workspace } from './components/Workspace';
import { FinalsPanel } from './components/FinalsPanel';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { removeBackground, createPoster, refinePoster, getConceptSuggestion } from './services/geminiService';
import type { GeneratedImage, AppState, AppStep } from './types';
import { fileToBase64 } from './utils/fileUtils';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    productImages: [],
    primaryImageIndex: null,
    aspectRatio: '1:1',
    concept: '',
    refinement: '',
    imageHistory: [],
    finalPosters: [],
    isLoading: false,
    loadingMessage: '',
    error: null,
    currentStep: 'upload',
  });

  const updateState = <K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState(prevState => ({ ...prevState, [key]: value, error: null }));
  };
  
  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setState(prevState => ({
        ...prevState,
        productImages: files,
        primaryImageIndex: 0,
        currentStep: 'background_removed',
        imageHistory: [],
        concept: '',
        refinement: '',
        error: null,
      }));
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(state.finalPosters);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    updateState('finalPosters', items);
  };

  const handleSaveToFinals = (image: GeneratedImage) => {
    if (!state.finalPosters.some(p => p.id === image.id)) {
      updateState('finalPosters', [...state.finalPosters, image]);
    }
  };

  const handleRemoveFromFinals = (id: string) => {
    updateState('finalPosters', state.finalPosters.filter(p => p.id !== id));
  };
  
  const handleError = (message: string) => {
    console.error(message);
    setState(prevState => ({
      ...prevState,
      isLoading: false,
      error: message,
    }));
  };

  const executeAIAction = async <T,>(
    action: () => Promise<T>,
    loadingMessage: string,
    nextStep: AppStep
  ): Promise<T | void> => {
    setState(prevState => ({ ...prevState, isLoading: true, loadingMessage, error: null }));
    try {
      const result = await action();
      setState(prevState => ({ ...prevState, isLoading: false, currentStep: nextStep }));
      return result;
    } catch (err) {
      handleError(err instanceof Error ? err.message : 'An unknown AI error occurred.');
    }
  };

  const handleAnalyzeProduct = useCallback(async () => {
    if (state.productImages.length === 0) return;

    const action = async () => {
        const imagePromises = state.productImages.map(fileToBase64);
        const images = await Promise.all(imagePromises);
        const suggestion = await getConceptSuggestion(images);
        updateState('concept', suggestion);
    };

    const currentStep = state.currentStep;
    await executeAIAction(action, 'Analyzing product for ideas...', currentStep);
  }, [state.productImages]);

  useEffect(() => {
    // Automatically get concept suggestion when new images are uploaded
    if (state.productImages.length > 0 && state.currentStep === 'background_removed' && state.concept === '') {
        handleAnalyzeProduct();
    }
  }, [state.productImages, state.currentStep, state.concept, handleAnalyzeProduct]);

  const handleRemoveBackground = useCallback(async () => {
    if (state.primaryImageIndex === null) return;
    const productImage = state.productImages[state.primaryImageIndex];
    if (!productImage) return;

    const action = async () => {
      const { base64, mimeType } = await fileToBase64(productImage);
      const resultBase64 = await removeBackground(base64, mimeType);
      const newImage: GeneratedImage = {
        id: `bg-removed-${Date.now()}`,
        src: `data:image/png;base64,${resultBase64}`,
        prompt: 'Background Removed',
      };
      updateState('imageHistory', [newImage]);
    };

    await executeAIAction(action, 'Removing background...', 'concept');
  }, [state.productImages, state.primaryImageIndex]);

  const handleCreatePoster = useCallback(async () => {
    if (state.imageHistory.length === 0 || !state.concept) return;

    const action = async () => {
      const bgRemovedImage = state.imageHistory[0];
      const resultBase64 = await createPoster(bgRemovedImage.src, state.concept, state.aspectRatio);
      const newImage: GeneratedImage = {
        id: `poster-${Date.now()}`,
        src: `data:image/png;base64,${resultBase64}`,
        prompt: state.concept,
      };
      updateState('imageHistory', [newImage, ...state.imageHistory]);
    };

    await executeAIAction(action, 'Generating initial poster...', 'refine');
  }, [state.imageHistory, state.concept, state.aspectRatio]);

  const handleRefinePoster = useCallback(async () => {
    if (state.imageHistory.length === 0 || !state.refinement) return;
    
    const action = async () => {
      const currentImage = state.imageHistory[0];
      const resultBase64 = await refinePoster(currentImage.src, state.refinement, state.aspectRatio);
      const newImage: GeneratedImage = {
        id: `refine-${Date.now()}`,
        src: `data:image/png;base64,${resultBase64}`,
        prompt: state.refinement,
      };
      updateState('imageHistory', [newImage, ...state.imageHistory]);
      updateState('refinement', '');
    };
    
    await executeAIAction(action, `Applying refinement: "${state.refinement}"`, 'refine');
  }, [state.imageHistory, state.refinement, state.aspectRatio]);
  
  const handleReset = () => {
    setState({
      productImages: [],
      primaryImageIndex: null,
      aspectRatio: '1:1',
      concept: '',
      refinement: '',
      imageHistory: [],
      finalPosters: [],
      isLoading: false,
      loadingMessage: '',
      error: null,
      currentStep: 'upload',
    });
  };

  return (
    <div className="min-h-screen font-sans">
      {state.isLoading && <Loader message={state.loadingMessage} />}
      <Header onReset={handleReset} />
      <main className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-72px)]">
        <div className="lg:col-span-3 h-full overflow-y-auto pr-2 custom-scrollbar">
          <ControlPanel
            state={state}
            updateState={updateState}
            onFilesSelected={handleFilesSelected}
            onRemoveBackground={handleRemoveBackground}
            onCreatePoster={handleCreatePoster}
            onRefinePoster={handleRefinePoster}
          />
        </div>
        <div className="lg:col-span-6 h-full overflow-y-auto">
          <Workspace
            imageHistory={state.imageHistory}
            error={state.error}
            currentStep={state.currentStep}
            onSaveToFinals={handleSaveToFinals}
          />
        </div>
        <div className="lg:col-span-3 h-full overflow-y-auto pl-2">
          <FinalsPanel
            posters={state.finalPosters}
            onRemove={handleRemoveFromFinals}
          />
        </div>
      </main>
    </div>
  );
};

export default App;