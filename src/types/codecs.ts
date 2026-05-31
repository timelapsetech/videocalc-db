export type AudioProfileKind = 'pcm' | 'compressed';

export interface AudioConfigurationOption {
  id: string;
  label: string;
  channels: number;
  layout?: string;
  sampleRateHz?: number;
  bitDepth?: number;
  bitrateKbps?: number;
  description?: string;
  notes?: string;
}

export interface AudioProfile {
  id: string;
  name: string;
  kind: AudioProfileKind;
  codec: string;
  configurations: AudioConfigurationOption[];
  defaultConfigurationId?: string;
  description?: string;
  sampleRateHz?: number;
  bitDepth?: number;
  bitrateKbps?: number;
  accuracy?: 'spec' | 'estimate';
  sourceUrls?: string[];
  notes?: string;
}

export interface AudioProfileAssignment {
  audioProfiles: AudioProfile[];
  defaultAudioProfileId?: string;
}

export interface CodecVariant {
  name: string;
  bitrates: {
    [resolution: string]: {
      [frameRate: string]: number;
    } | number;
  };
  description?: string;
  accuracy?: 'spec' | 'estimate';
  sourceUrls?: string[];
  notes?: string;
  /** libx264 profile when variant name is a platform/workflow label rather than a profile name */
  ffmpegEncoderProfile?: 'baseline' | 'main' | 'high';
  audioProfiles?: AudioProfile[];
  defaultAudioProfileId?: string;
}

export interface Codec {
  id: string;
  name: string;
  variants: CodecVariant[];
  description?: string;
  workflowNotes?: string;
  accuracy?: 'spec' | 'estimate';
  sourceUrls?: string[];
  notes?: string;
  audioProfiles?: AudioProfile[];
  defaultAudioProfileId?: string;
}

export interface CodecCategory {
  id: string;
  name: string;
  codecs: Codec[];
  description?: string;
}

export interface CodecCatalogFile {
  metadata?: {
    exportDate?: string;
    source?: string;
    totalCategories?: number;
    totalCodecs?: number;
    totalVariants?: number;
    [key: string]: unknown;
  };
  categories: CodecCategory[];
}

export interface AudioConfigurationCatalogFile {
  metadata?: {
    exportDate?: string;
    source?: string;
    sourceUrls?: string[];
    notes?: string;
    [key: string]: unknown;
  };
  codecProfiles?: {
    [codecId: string]: AudioProfileAssignment;
  };
  variantProfiles?: {
    [variantKey: string]: AudioProfileAssignment;
  };
}
