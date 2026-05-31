import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDownAZ, ArrowUpAZ, Search, Tv } from 'lucide-react';
import SiteNav from './SiteNav';
import BusinessModelBadge from './BusinessModelBadge';
import BusinessModelFilter from './BusinessModelFilter';
import SpecSourceLink from './SpecSourceLink';
import StreamingCatalogDisclaimer from './StreamingCatalogDisclaimer';
import { getStreamingServicesCatalog } from '../data/loadStreamingServices';
import { type StreamingBusinessModel } from '../data/streamingBusinessModels';
import InfoTooltip from './InfoTooltip';
import {
  getCatalogKindDefinition,
  getCatalogKindTooltip,
  STREAMING_CATALOG_KINDS,
  type StreamingCatalogKind,
} from '../data/streamingCatalogKinds';

type CatalogSortOrder = 'name-asc' | 'name-desc';

const StreamingServices: React.FC = () => {
  const catalog = getStreamingServicesCatalog();
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState<StreamingBusinessModel | 'all'>('all');
  const [catalogKindFilter, setCatalogKindFilter] = useState<StreamingCatalogKind | 'all'>('all');
  const [sortOrder, setSortOrder] = useState<CatalogSortOrder>('name-asc');

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

      const serviceCatalogKind = service.catalogKind ?? 'streaming-ott';
      if (catalogKindFilter !== 'all' && serviceCatalogKind !== catalogKindFilter) {
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
        ...(service.brands ?? []),
        ...(service.distributionKinds ?? []),
        ...(service.distributorWorkflowAliases ?? []),
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
  }, [catalog.services, catalogKindFilter, modelFilter, searchTerm]);

  const sortedServices = useMemo(() => {
    const list = [...filteredServices];
    list.sort((a, b) => {
      const comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      return sortOrder === 'name-asc' ? comparison : -comparison;
    });
    return list;
  }, [filteredServices, sortOrder]);

  const catalogKindCounts = useMemo(() => {
    const counts = new Map<StreamingCatalogKind, number>();
    for (const service of catalog.services) {
      const kind = service.catalogKind ?? 'streaming-ott';
      counts.set(kind, (counts.get(kind) ?? 0) + 1);
    }
    return counts;
  }, [catalog.services]);

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
            Partner contribution specs for delivering video and audio TO each platform — only entries with published
            technical documentation are listed. Broadcast and cable parent companies group shared specs across their
            networks; MVPD and store apps reference CableLabs or operator-published requirements where available.
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Last updated {catalog.metadata.lastUpdated}. {catalog.metadata.notes}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() => setCatalogKindFilter('all')}
            className={`rounded-full px-3 py-1.5 text-xs border transition-colors ${
              catalogKindFilter === 'all'
                ? 'border-blue-500/50 bg-blue-500/15 text-blue-200'
                : 'border-gray-700 bg-dark-secondary text-gray-400 hover:border-gray-600'
            }`}
          >
            All catalog ({catalog.services.length})
          </button>
          {(Object.keys(STREAMING_CATALOG_KINDS) as StreamingCatalogKind[]).map(kind => {
            const definition = STREAMING_CATALOG_KINDS[kind];
            const count = catalogKindCounts.get(kind) ?? 0;
            if (count === 0) {
              return null;
            }
            return (
              <InfoTooltip key={kind} content={getCatalogKindTooltip(kind)}>
                <button
                  type="button"
                  onClick={() => setCatalogKindFilter(kind)}
                  className={`rounded-full px-3 py-1.5 text-xs border transition-colors cursor-help ${
                    catalogKindFilter === kind
                      ? definition.badgeClass
                      : 'border-gray-700 bg-dark-secondary text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {definition.shortLabel} ({count})
                </button>
              </InfoTooltip>
            );
          })}
        </div>

        <BusinessModelFilter
          value={modelFilter}
          onChange={setModelFilter}
          modelCounts={modelCounts}
          totalCount={filteredServices.length}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="search"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Search by service, business model, codec, or container..."
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-dark-secondary border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <label htmlFor="catalog-sort" className="text-xs text-gray-500 whitespace-nowrap">
              Sort
            </label>
            <div className="relative">
              {sortOrder === 'name-asc' ? (
                <ArrowDownAZ
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  aria-hidden
                />
              ) : (
                <ArrowUpAZ
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500"
                  aria-hidden
                />
              )}
              <select
                id="catalog-sort"
                value={sortOrder}
                onChange={event => setSortOrder(event.target.value as CatalogSortOrder)}
                className="appearance-none rounded-lg bg-dark-secondary border border-gray-700 text-white text-sm pl-9 pr-8 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
              >
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
              </select>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 -mt-4 mb-6">
          Showing {sortedServices.length} of {catalog.services.length} partners
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedServices.map(service => (
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
                  {getCatalogKindDefinition(service.catalogKind) && (
                    <InfoTooltip
                      content={getCatalogKindTooltip(service.catalogKind!)}
                      className="mt-2"
                    >
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide border cursor-help ${getCatalogKindDefinition(service.catalogKind)?.badgeClass}`}
                      >
                        {getCatalogKindDefinition(service.catalogKind)?.shortLabel}
                      </span>
                    </InfoTooltip>
                  )}
                </div>
                <span className="shrink-0 rounded-full bg-gray-800 px-2.5 py-1 text-xs text-gray-400">
                  {service.deliveryOptions.length} options
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {service.businessModels.map(model => (
                  <BusinessModelBadge key={model} model={model} showTooltip />
                ))}
              </div>

              <p className="text-sm text-gray-400 mt-3 line-clamp-2">{service.description}</p>
              {service.brands && service.brands.length > 0 && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                  <span className="text-gray-600">Brands: </span>
                  {service.brands.join(', ')}
                </p>
              )}
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

        {sortedServices.length === 0 && (
          <div className="rounded-xl border border-gray-800 bg-dark-secondary p-8 text-center text-gray-400">
            No services matched your search or business model filter.
          </div>
        )}
      </main>
    </div>
  );
};

export default StreamingServices;
