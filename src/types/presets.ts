export interface CustomPreset {
  id: string;
  name: string;
  category: string;
  codec: string;
  variant: string;
  resolution: string;
  frameRate: string;
  audioEnabled?: boolean;
  audioProfileId?: string;
  audioConfigurationId?: string;
  videoBitrateOverrideMbps?: number;
}
