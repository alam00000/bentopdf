export interface ScannerEffectState {
  file: File | null;
}

export interface ScanSettings {
  grayscale: boolean;
  border: boolean;
  rotate: number;
  rotateVariance: number;
  brightness: number;
  contrast: number;
  blur: number;
  noise: number;
  yellowish: number;
  resolution: number;
}
