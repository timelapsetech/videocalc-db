import streamingServicesCatalog from '@repo-data/streaming-services.json';
import streamingCalculatorTemplates from '@repo-data/streaming-calculator-templates.json';
import type {
  StreamingDeliveryCalculator,
  StreamingDeliveryOption,
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

export function getStreamingServicesCatalog(): StreamingServicesCatalog {
  const catalog = streamingServicesCatalog as StreamingServicesCatalog;
  return {
    ...catalog,
    services: catalog.services.map(service => ({
      ...service,
      deliveryOptions: service.deliveryOptions.map(resolveDeliveryOption),
    })),
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
