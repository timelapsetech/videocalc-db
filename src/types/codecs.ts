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
