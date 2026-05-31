import { resolveSpecSourceType, type SpecSourceType } from '../utils/specSource';
import type { StreamingDeliveryOption, StreamingService } from '../types/streamingServices';

/** Spec sources we treat as publishable partner ingest documentation. */
const PUBLIC_SPEC_SOURCE_TYPES: SpecSourceType[] = ['official', 'third-party-guide'];

function getOptionSpecSourceType(
  option: StreamingDeliveryOption,
  service: StreamingService
): SpecSourceType {
  return (
    option.specSourceType ??
    resolveSpecSourceType(option.specUrl, {
      serviceWebsiteUrl: service.websiteUrl,
    })
  );
}

/** Whether a catalog row has published ingest specs online (shown on the public site). */
export function isPublicCatalogService(service: StreamingService): boolean {
  if (service.specSourceType === 'not-found') {
    return false;
  }

  const deliveryOptions = service.deliveryOptions ?? [];
  if (deliveryOptions.length > 0) {
    return deliveryOptions.some(option =>
      PUBLIC_SPEC_SOURCE_TYPES.includes(getOptionSpecSourceType(option, service))
    );
  }

  if (service.specSourceType === 'partner-portal' || service.specSourceType === 'industry-article') {
    return false;
  }

  const serviceSpecType =
    service.specSourceType ??
    resolveSpecSourceType(service.specUrl, {
      serviceWebsiteUrl: service.websiteUrl,
    });

  return PUBLIC_SPEC_SOURCE_TYPES.includes(serviceSpecType);
}

export function filterPublicCatalogServices(services: StreamingService[]): StreamingService[] {
  return services.filter(isPublicCatalogService);
}
