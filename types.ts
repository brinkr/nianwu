
export type ArchiveMode = 'sentiment' | 'utility';

export interface ArchivedItem {
  id: string;
  imageUris: string[]; // Changed to array to support multiple images
  title: string;
  description: string;
  farewellMessage: string; // For utility, this is the "Disposition Note"
  sentiment: string;       // For utility, this is the "Status"
  category: string;
  dateArchived: number;
  userNote?: string;
  mode: ArchiveMode;
  estimatedVolume?: number; // Estimated volume in cubic meters
}

export interface GeminiResponse {
  title: string;
  description: string;
  farewellMessage: string;
  sentiment: string;
  category: string;
  estimatedVolume: number;
  mode?: ArchiveMode;
}

export enum AppView {
  HOME = 'HOME',
  SCAN = 'SCAN',
  ANALYZING = 'ANALYZING',
  RITUAL = 'RITUAL',
  GALLERY = 'GALLERY',
  DETAIL = 'DETAIL'
}

export interface UserStats {
  levelTitle: string;
  levelProgress: number;
  totalReleased: number;
  nextLevelThreshold: number;
}
