import type { IngestWorkflowKind, StreamingCatalogKind } from '../types/streamingServices';

export interface CatalogKindDefinition {
  id: StreamingCatalogKind;
  label: string;
  shortLabel: string;
  description: string;
  badgeClass: string;
}

export const STREAMING_CATALOG_KINDS: Record<StreamingCatalogKind, CatalogKindDefinition> = {
  'broadcast-cable-parent': {
    id: 'broadcast-cable-parent',
    label: 'Broadcast & cable parent',
    shortLabel: 'Broadcast / cable',
    description:
      'One row per parent company (NBCUniversal, Paramount Global, etc.) with brand lists and linear ingest workflows.',
    badgeClass: 'bg-slate-500/15 text-slate-200 border-slate-500/30',
  },
  'streaming-ott': {
    id: 'streaming-ott',
    label: 'OTT streaming app',
    shortLabel: 'OTT',
    description: 'Consumer streaming service ingest (SVOD, AVOD, etc.) — may link to a parent broadcast/cable entry.',
    badgeClass: 'bg-purple-500/15 text-purple-200 border-purple-500/30',
  },
  'fast-platform': {
    id: 'fast-platform',
    label: 'FAST / distribution platform',
    shortLabel: 'FAST',
    description: 'Free ad-supported TV platforms, cloud playout, and OEM channel aggregators.',
    badgeClass: 'bg-orange-500/15 text-orange-200 border-orange-500/30',
  },
};

export const INGEST_WORKFLOW_LABELS: Record<IngestWorkflowKind, string> = {
  'linear-cable-program': 'Linear / cable — program mezzanine',
  'linear-on-air-mxf': 'Linear — on-air MXF playout',
  'broadcast-commercial': 'Broadcast — commercial / interstitial',
  'ott-streaming': 'OTT streaming ingest',
};

export const INGEST_WORKFLOW_TOOLTIPS: Record<IngestWorkflowKind, string> = {
  'linear-cable-program':
    'Linear / cable — program mezzanine. Longform masters delivered to a cable network for library playout (ProRes, XDCAM, etc.), not consumer app ingest.',
  'linear-on-air-mxf':
    'Linear — on-air MXF playout. Broadcast-transmit files (often MPEG-2 MXF) for station or network air chains.',
  'broadcast-commercial':
    'Broadcast — commercial / interstitial. Shortform spots, promos, and PSAs for broadcast network commercial pods.',
  'ott-streaming':
    'OTT (Over-The-Top) streaming ingest. Files delivered to a streaming app or DTC service (SVOD/AVOD), separate from linear cable playout.',
};

export function getCatalogKindDefinition(
  kind: StreamingCatalogKind | undefined
): CatalogKindDefinition | undefined {
  return kind ? STREAMING_CATALOG_KINDS[kind] : undefined;
}

export function getIngestWorkflowLabel(workflow: IngestWorkflowKind | undefined): string | undefined {
  return workflow ? INGEST_WORKFLOW_LABELS[workflow] : undefined;
}

export function getIngestWorkflowTooltip(workflow: IngestWorkflowKind): string {
  return INGEST_WORKFLOW_TOOLTIPS[workflow];
}

/** Hover tooltip: full label plus catalog grouping description. */
export function getCatalogKindTooltip(kind: StreamingCatalogKind): string {
  const definition = STREAMING_CATALOG_KINDS[kind];
  return `${definition.label}. ${definition.description}`;
}
