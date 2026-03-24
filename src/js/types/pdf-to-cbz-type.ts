export interface CbzOptions {
  imageFormat: 'jpeg' | 'png' | 'webp';
  quality: number;
  scale: number;
  grayscale: boolean;
  manga: boolean;
  includeMetadata: boolean;
  title: string;
  series: string;
  number: string;
  volume: string;
  author: string;
  publisher: string;
  tags: string;
  year: string;
  rating: string;
}

export interface ComicMetadata {
  title?: string;
  series?: string;
  number?: string;
  volume?: string;
  writer?: string;
  publisher?: string;
  genre?: string;
  year?: string;
  communityRating?: string;
  pageCount: number;
  manga?: boolean;
  blackAndWhite?: boolean;
}
