export interface ArchivedItem {
  id: string;
  imageUri: string;
  title: string;
  description: string;
  farewellMessage: string; // New: A direct message from the object to the owner
  sentiment: string;
  category: string;
  dateArchived: number;
  userNote?: string;
}

export interface GeminiResponse {
  title: string;
  description: string;
  farewellMessage: string;
  sentiment: string;
  category: string;
}

export enum AppView {
  HOME = 'HOME',
  SCAN = 'SCAN',
  ANALYZING = 'ANALYZING', // AI is thinking
  RITUAL = 'RITUAL',       // User reviews and performs the "release" action
  GALLERY = 'GALLERY',
  DETAIL = 'DETAIL'
}

export interface UserStats {
  levelTitle: string;
  levelProgress: number;
  totalReleased: number;
  nextLevelThreshold: number;
}