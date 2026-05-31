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
  /** Linear broadcast/cable vs OTT ingest — clarifies workflow on parent-company rows */
  ingestWorkflow?: IngestWorkflowKind;
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

export type StreamingCatalogKind =
  | 'streaming-ott'
  | 'broadcast-cable-parent'
  | 'fast-platform';

/** How content is ingested for a delivery option (linear vs OTT). */
export type IngestWorkflowKind =
  | 'linear-cable-program'
  | 'linear-on-air-mxf'
  | 'broadcast-commercial'
  | 'ott-streaming';

export interface StreamingService {
  id: string;
  name: string;
  tagline: string;
  description: string;
  /** Catalog grouping — parent broadcast/cable rows vs consumer OTT apps */
  catalogKind?: StreamingCatalogKind;
  /** Consumer-facing networks and channels under this parent (when published specs are shared) */
  brands?: string[];
  /** High-level distribution paths covered by this catalog row */
  distributionKinds?: string[];
  /** Other catalog entries with different ingest specs (e.g. OTT apps under the same parent) */
  relatedServiceIds?: string[];
  /** Internal distributor / PPH workflow names that map to this catalog row (searchable) */
  distributorWorkflowAliases?: string[];
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
