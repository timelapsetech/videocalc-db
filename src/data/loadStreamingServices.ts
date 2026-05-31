import streamingServicesCatalog from '@repo-data/streaming-services.json';
import type { StreamingServicesCatalog } from '../types/streamingServices';

export function getStreamingServicesCatalog(): StreamingServicesCatalog {
  return streamingServicesCatalog as StreamingServicesCatalog;
}

export function getStreamingService(serviceId: string) {
  return getStreamingServicesCatalog().services.find(service => service.id === serviceId);
}

export function getStreamingDeliveryOption(serviceId: string, optionId: string) {
  const service = getStreamingService(serviceId);
  return service?.deliveryOptions.find(option => option.id === optionId);
}
