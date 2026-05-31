import streamingServicesCatalog from '@repo-data/streaming-services.json';
import broadcastCableParentsCatalog from '@repo-data/broadcast-cable-parents.json';
import distributorPlatformCatalog from '@repo-data/distributor-platform-services.json';
import streamingCalculatorTemplates from '@repo-data/streaming-calculator-templates.json';
import { filterPublicCatalogServices } from './publicCatalogServices';
import type {
  StreamingDeliveryCalculator,
  StreamingDeliveryOption,
  StreamingService,
  StreamingServicesCatalog,
} from '../types/streamingServices';

type RawDeliveryOption = StreamingDeliveryOption;
type TemplateCatalog = {
  templates: Record<string, StreamingDeliveryCalculator>;
};

const templates = (streamingCalculatorTemplates as TemplateCatalog).templates;

function resolveDeliveryCalculator(option: RawDeliveryOption): StreamingDeliveryCalculator {
  if (option.calculator) {
    return option.calculator;
  }

  if (option.calculatorTemplate) {
    const template = templates[option.calculatorTemplate];
    if (!template) {
      throw new Error(`Unknown streaming calculator template: ${option.calculatorTemplate}`);
    }
    return template;
  }

  throw new Error(`Delivery option "${option.id}" is missing calculator and calculatorTemplate`);
}

function resolveDeliveryOption(option: RawDeliveryOption): StreamingDeliveryOption {
  return {
    ...option,
    calculator: resolveDeliveryCalculator(option),
  };
}

function mergeCatalogServices(
  streaming: StreamingService[],
  broadcastParents: StreamingService[],
  distributorPlatforms: StreamingService[]
): StreamingService[] {
  const reservedIds = new Set([
    ...broadcastParents.map(service => service.id),
    ...distributorPlatforms.map(service => service.id),
  ]);
  const streamingOnly = streaming.filter(service => !reservedIds.has(service.id));
  return [...broadcastParents, ...distributorPlatforms, ...streamingOnly].map(service => ({
    ...service,
    deliveryOptions: service.deliveryOptions.map(resolveDeliveryOption),
  }));
}

export function getStreamingServicesCatalog(): StreamingServicesCatalog {
  const catalog = streamingServicesCatalog as StreamingServicesCatalog;
  const parents = (broadcastCableParentsCatalog as StreamingServicesCatalog).services;
  const distributors = (distributorPlatformCatalog as StreamingServicesCatalog).services;
  return {
    metadata: {
      ...catalog.metadata,
      lastUpdated: '2026-05-31',
      notes: `${catalog.metadata.notes} Broadcast/cable parents: broadcast-cable-parents.json. MVPD/distributor platforms: distributor-platform-services.json.`,
    },
    services: filterPublicCatalogServices(
      mergeCatalogServices(catalog.services, parents, distributors)
    ),
  };
}

export function getStreamingService(serviceId: string) {
  return getStreamingServicesCatalog().services.find(service => service.id === serviceId);
}

export function getStreamingDeliveryOption(serviceId: string, optionId: string) {
  const service = getStreamingService(serviceId);
  return service?.deliveryOptions.find(option => option.id === optionId);
}

export function getStreamingCalculatorTemplate(templateId: string): StreamingDeliveryCalculator | undefined {
  return templates[templateId];
}
