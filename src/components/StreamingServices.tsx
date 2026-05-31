import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Tv } from 'lucide-react';
import SiteNav from './SiteNav';
import BusinessModelBadge from './BusinessModelBadge';
import BusinessModelFilter from './BusinessModelFilter';
import SpecSourceLink from './SpecSourceLink';
import StreamingCatalogDisclaimer from './StreamingCatalogDisclaimer';
import { getStreamingServicesCatalog } from '../data/loadStreamingServices';
import { type StreamingBusinessModel } from '../data/streamingBusinessModels';

const StreamingServices: React.FC = () => {
  const catalog = getStreamingServicesCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState<StreamingBusinessModel | 'all'>('all');

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return catalog.services.filter(service => {
      const matchesModel =
        modelFilter === 'all' ||
        service.businessModels.includes(modelFilter) ||
        service.deliveryOptions.some(option => option.businessModel === modelFilter);

      if (!matchesModel) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = [
        service.name,
        service.tagline,
        service.description,
        service.accessModel,
        service.revenueModel,
        ...(service.businessModelNotes ?? []),
        ...service.businessModels,
        ...service.deliveryOptions.flatMap(option => [
          option.name,
          option.purpose,
          option.summary,
          option.businessModel,
          option.deliveryTier,
          ...option.videoSpecs.map(spec => `${spec.label} ${spec.value}`),
          ...option.audioSpecs.map(spec => `${spec.label} ${spec.value}`),
        ]),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [catalog.services, modelFilter, searchTerm]);

  const modelCounts = useMemo(() => {
    const counts = new Map<StreamingBusinessModel, number>();
    for (const service of catalog.services) {
      for (const model of service.businessModels) {
        counts.set(model, (counts.get(model) ?? 0) + 1);
      }
    }
    return counts;
  }, [catalog.services]);

  return (
    <div className="min-h-screen bg-dark-primary">
      <SiteNav title="Streaming Delivery Specs" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <StreamingCatalogDisclaimer />

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Tv className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Streaming Service Delivery Specs</h1>
          </div>
          <p className="text-gray-400 max-w-3xl leading-relaxed">
            Partner contribution specs for delivering video and audio TO each platform — mezzanine ingest, HLS origins,
            MRSS catalog feeds, and vertical micro-drama episode delivery. FAST entries include OEM platforms (Samsung,
            LG, Vizio) and distribution partners (Amagi, Wurl, Frequency). Micro-drama apps (ReelShort, DramaBox) use
            partner-gated portal or API ingest. The same company often has different ingest paths per business model.
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Last updated {catalog.metadata.lastUpdated}. {catalog.metadata.notes}
          </p>
        </div>

        <BusinessModelFilter
          value={modelFilter}
          onChange={setModelFilter}
          modelCounts={modelCounts}
          totalCount={catalog.services.length}
        />

        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input
            type="search"
            value={searchTerm}
            onChange={event => setSearchTerm(event.target.value)}
            placeholder="Search by service, business model, codec, or container..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-secondary border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map(service => (
            <Link
              key={service.id}
              to={`/streaming-services/${service.id}`}
              className="group rounded-xl border border-gray-800 bg-dark-secondary/70 p-5 hover:border-blue-500/40 hover:bg-dark-secondary transition-all hover-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white group-hover:text-blue-200 transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-sm text-blue-300/80 mt-1">{service.tagline}</p>
                </div>
                <span className="shrink-0 rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-400">
                  {service.deliveryOptions.length} options
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {service.businessModels.map(model => (
                  <BusinessModelBadge key={model} model={model} />
                ))}
              </div>

              <p className="text-sm text-gray-400 mt-3 line-clamp-2">{service.description}</p>
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{service.revenueModel}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {service.deliveryOptions.slice(0, 3).map(option => (
                  <span
                    key={option.id}
                    className="rounded-md bg-dark-primary px-2 py-1 text-xs text-gray-300 border border-gray-700"
                  >
                    {option.name}
                  </span>
                ))}
                {service.deliveryOptions.length > 3 && (
                  <span className="text-xs text-gray-500 self-center">
                    +{service.deliveryOptions.length - 3} more
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-gray-500 gap-2">
                <span className="truncate pr-2">{service.accessModel}</span>
                <SpecSourceLink
                  href={service.specUrl}
                  serviceWebsiteUrl={service.websiteUrl}
                  override={service.specSourceType}
                  short
                  onClick={event => event.stopPropagation()}
                  className="text-blue-400 hover:text-blue-300 shrink-0"
                />
              </div>
            </Link>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-dark-secondary p-8 text-center text-gray-400">
            No services matched your search or business model filter.
          </div>
        )}
      </main>
    </div>
  );
};

export default StreamingServices;
