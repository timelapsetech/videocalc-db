import type { CustomPreset } from './presets';
import type { StreamingBusinessModel } from '../data/streamingBusinessModels';
import type { SpecSourceType } from '../utils/specSource';

export interface StreamingServiceSpec {
  label: string;
  value: string;
}

export interface StreamingDeliveryCalculator extends CustomPreset {
  /** Override catalog video bitrate when platform spec differs from variant table */
  videoBitrateOverrideMbps?: number;
}

export interface StreamingDeliveryOption {
  id: string;
  name: string;
  businessModel: StreamingBusinessModel;
  /** e.g. Mezzanine, Editorial proxy, HLS origin, Consumer upload */
  deliveryTier: string;
  purpose: string;
  summary: string;
  videoSpecs: StreamingServiceSpec[];
  audioSpecs: StreamingServiceSpec[];
  containerSpecs: StreamingServiceSpec[];
  additionalNotes?: string[];
  specUrl: string;
  /** Override automatic spec-source classification for this link */
  specSourceType?: SpecSourceType;
  /** Reference to a shared calculator profile in data/streaming-calculator-templates.json */
  calculatorTemplate?: string;
  calculator?: StreamingDeliveryCalculator;
  ffmpegSupported: boolean;
  ffmpegNotes?: string;
}

export interface StreamingService {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Primary monetization / access models offered by this platform */
  businessModels: StreamingBusinessModel[];
  /** How content typically reaches the platform */
  accessModel: string;
  /** Revenue / rights context — subscription, ads, rent/buy, licensing, etc. */
  revenueModel: string;
  businessModelNotes?: string[];
  specUrl: string;
  /** Override automatic spec-source classification for this link */
  specSourceType?: SpecSourceType;
  websiteUrl: string;
  deliveryOptions: StreamingDeliveryOption[];
}

export interface StreamingServicesCatalog {
  metadata: {
    lastUpdated: string;
    notes: string;
  };
  services: StreamingService[];
}
