export type StreamingBusinessModel =
  | 'svod'
  | 'avod'
  | 'tvod'
  | 'fast'
  | 'linear-live'
  | 'partner-licensed'
  | 'creator-upload'
  | 'affiliate-outbound'
  | 'broadcast';

export interface BusinessModelDefinition {
  id: StreamingBusinessModel;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
}

export const STREAMING_BUSINESS_MODELS: Record<StreamingBusinessModel, BusinessModelDefinition> = {
  svod: {
    id: 'svod',
    label: 'SVOD — Subscription Video on Demand',
    shortLabel: 'SVOD',
    description: 'Subscription access. Usually requires high-quality mezzanine or IMF masters from licensed partners.',
    badgeClass: 'bg-purple-500/15 text-purple-200 border-purple-500/30',
  },
  avod: {
    id: 'avod',
    label: 'AVOD — Ad-Supported Video on Demand',
    shortLabel: 'AVOD',
    description: 'Free or ad-supported on-demand viewing. Typically accepts H.264/HEVC web-delivery files at lower bitrates than premium SVOD mezzanines.',
    badgeClass: 'bg-amber-500/15 text-amber-200 border-amber-500/30',
  },
  tvod: {
    id: 'tvod',
    label: 'TVOD — Transactional Video on Demand',
    shortLabel: 'TVOD',
    description: 'Rent-or-buy titles. Often allows self-serve upload with compressed H.264/HEVC and AAC.',
    badgeClass: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30',
  },
  fast: {
    id: 'fast',
    label: 'FAST — Free Ad-Supported Streaming TV',
    shortLabel: 'FAST',
    description: 'Linear ad-supported channels delivered as HLS/DASH adaptive streams, not single flat files.',
    badgeClass: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
  },
  'linear-live': {
    id: 'linear-live',
    label: 'Linear Live Ingest',
    shortLabel: 'Linear',
    description: 'Live or linear channel ingest over IP (MPEG-TS, SRT, MediaConnect) with embedded ad markers.',
    badgeClass: 'bg-rose-500/15 text-rose-200 border-rose-500/30',
  },
  'partner-licensed': {
    id: 'partner-licensed',
    label: 'Licensed Partner Delivery',
    shortLabel: 'Partner',
    description: 'B2B delivery to the platform operator. Not open to public upload; specs are contract-gated.',
    badgeClass: 'bg-blue-500/15 text-blue-200 border-blue-500/30',
  },
  'creator-upload': {
    id: 'creator-upload',
    label: 'Creator / Open Upload',
    shortLabel: 'Upload',
    description: 'Public or semi-open upload path for creators, filmmakers, or channel owners.',
    badgeClass: 'bg-cyan-500/15 text-cyan-200 border-cyan-500/30',
  },
  'affiliate-outbound': {
    id: 'affiliate-outbound',
    label: 'Affiliate / Outbound Syndication',
    shortLabel: 'Affiliate',
    description: 'Outbound masters syndicated from a platform catalog to third-party affiliates and MVPDs.',
    badgeClass: 'bg-indigo-500/15 text-indigo-200 border-indigo-500/30',
  },
  broadcast: {
    id: 'broadcast',
    label: 'Broadcast / Public Media',
    shortLabel: 'Broadcast',
    description: 'Public broadcaster or distributor specs for OTT, station, and international syndication.',
    badgeClass: 'bg-slate-500/15 text-slate-200 border-slate-500/30',
  },
};

export function getBusinessModelDefinition(model: StreamingBusinessModel): BusinessModelDefinition {
  return STREAMING_BUSINESS_MODELS[model];
}

/** Hover tooltip: full name / acronym expansion plus what the model means in practice. */
export function getBusinessModelTooltip(model: StreamingBusinessModel): string {
  const definition = getBusinessModelDefinition(model);
  return `${definition.label}. ${definition.description}`;
}

export function getUniqueBusinessModels(models: StreamingBusinessModel[]): BusinessModelDefinition[] {
  return [...new Set(models)].map(getBusinessModelDefinition);
}
