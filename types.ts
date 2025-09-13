export type AspectRatio = '1:1' | '9:16' | '16:9' | '3:4' | '4:3';

export interface GeneratedImage {
  id: string;
  src: string;
  prompt: string;
}

export type AppStep = 'upload' | 'background_removed' | 'concept' | 'refine';

export interface AppState {
  productImages: File[];
  primaryImageIndex: number | null;
  aspectRatio: AspectRatio;
  concept: string;
  refinement: string;
  imageHistory: GeneratedImage[];
  finalPosters: GeneratedImage[];
  isLoading: boolean;
  loadingMessage: string;
  error: string | null;
  currentStep: AppStep;
}
