import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Calculator,
  ChevronRight,
  ExternalLink,
  HardDrive,
  Info,
} from 'lucide-react';
import SiteNav from './SiteNav';
import BusinessModelBadge from './BusinessModelBadge';
import InfoTooltip from './InfoTooltip';
import DurationInput from './DurationInput';
import FfmpegCommandCard from './FfmpegCommandCard';
import PartnerSpecSummary from './PartnerSpecSummary';
import SpecSourceLink from './SpecSourceLink';
import StreamingCatalogDisclaimer from './StreamingCatalogDisclaimer';
import { useCodecContext } from '../context/CodecContext';
import { getStreamingService } from '../data/loadStreamingServices';
import {
  buildAudioSelection,
  calculateFileSize,
  formatFileSize,
  type Duration,
} from '../utils/fileSizeCalculation';
import { buildCalculatorPath } from '../utils/urlSharing';
import { normalizeCalculatorConfig } from '../utils/calculatorVariants';
import { getBusinessModelDefinition } from '../data/streamingBusinessModels';
import {
  getCatalogKindDefinition,
  getCatalogKindTooltip,
  getIngestWorkflowLabel,
  getIngestWorkflowTooltip,
} from '../data/streamingCatalogKinds';

const StreamingServiceDetail: React.FC = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { categories } = useCodecContext();
  const service = serviceId ? getStreamingService(serviceId) : undefined;

  const initialOptionId = searchParams.get('option') ?? service?.deliveryOptions[0]?.id ?? '';
  const [selectedOptionId, setSelectedOptionId] = useState(initialOptionId);
  const [duration, setDuration] = useState<Duration>({ hours: 1, minutes: 0, seconds: 0 });
  const [useBinaryUnits, setUseBinaryUnits] = useState(true);

  useEffect(() => {
    if (!service) {
      return;
    }

    const optionFromUrl = searchParams.get('option');
    const validOption = service.deliveryOptions.find(option => option.id === optionFromUrl);
    if (validOption) {
      setSelectedOptionId(validOption.id);
      return;
    }

    if (!optionFromUrl && service.deliveryOptions[0]) {
      setSelectedOptionId(service.deliveryOptions[0].id);
    }
  }, [searchParams, service]);

  const selectedOption = useMemo(
    () => service?.deliveryOptions.find(option => option.id === selectedOptionId),
    [service, selectedOptionId]
  );

  const results = useMemo(() => {
    if (!selectedOption) {
      return null;
    }

    return calculateFileSize(categories, selectedOption.calculator, duration);
  }, [categories, duration, selectedOption]);

  const calculatorPath = useMemo(() => {
    if (!selectedOption) {
      return '/';
    }

    const calculatorConfig = normalizeCalculatorConfig(selectedOption.calculator, categories);

    return buildCalculatorPath(
      calculatorConfig.category,
      calculatorConfig.codec,
      calculatorConfig.variant,
      calculatorConfig.resolution,
      calculatorConfig.frameRate,
      duration,
      buildAudioSelection(calculatorConfig),
      calculatorConfig.videoBitrateOverrideMbps
    );
  }, [categories, duration, selectedOption]);

  const selectOption = (optionId: string) => {
    setSelectedOptionId(optionId);
    setSearchParams({ option: optionId });
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-dark-primary">
        <SiteNav backTo={{ label: 'All services', path: '/streaming-services' }} />
        <main className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-semibold text-white mb-3">Service not found</h1>
          <p className="text-gray-400 mb-6">That streaming service is not in the catalog yet.</p>
          <Link
            to="/streaming-services"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
          >
            Browse all services
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-primary">
      <SiteNav
        backTo={{ label: 'All services', path: '/streaming-services' }}
        title={service.name}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <StreamingCatalogDisclaimer />

        <div className="mb-8">
          <p className="text-sm text-blue-300/80">{service.tagline}</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">{service.name}</h1>
          <p className="text-gray-400 mt-3 max-w-3xl leading-relaxed">{service.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {service.catalogKind && getCatalogKindDefinition(service.catalogKind) && (
              <InfoTooltip content={getCatalogKindTooltip(service.catalogKind)}>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs border cursor-help ${getCatalogKindDefinition(service.catalogKind)?.badgeClass}`}
                >
                  {getCatalogKindDefinition(service.catalogKind)?.label}
                </span>
              </InfoTooltip>
            )}
            {service.businessModels.map(model => (
              <BusinessModelBadge key={model} model={model} size="md" showTooltip />
            ))}
          </div>

          {service.distributionKinds && service.distributionKinds.length > 0 && (
            <div className="mt-4 max-w-3xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Distribution paths</p>
              <ul className="flex flex-wrap gap-2">
                {service.distributionKinds.map(kind => (
                  <li
                    key={kind}
                    className="rounded-md bg-dark-secondary px-2.5 py-1 text-xs text-gray-300 border border-gray-700"
                  >
                    {kind}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {service.brands && service.brands.length > 0 && (
            <div className="mt-4 max-w-3xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Networks & channels (shared spec)</p>
              <p className="text-sm text-gray-300 leading-relaxed">{service.brands.join(' · ')}</p>
            </div>
          )}

          {service.distributorWorkflowAliases && service.distributorWorkflowAliases.length > 0 && (
            <div className="mt-4 max-w-3xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Distributor workflow names</p>
              <p className="text-sm text-gray-400 leading-relaxed">
                Also known as: {service.distributorWorkflowAliases.join(' · ')}
              </p>
            </div>
          )}

          {service.relatedServiceIds && service.relatedServiceIds.length > 0 && (
            <div className="mt-4 max-w-3xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Related catalog entries</p>
              <ul className="flex flex-wrap gap-2">
                {service.relatedServiceIds.map(relatedId => {
                  const related = getStreamingService(relatedId);
                  if (!related) {
                    return null;
                  }
                  return (
                    <li key={relatedId}>
                      <Link
                        to={`/streaming-services/${relatedId}`}
                        className="rounded-md bg-dark-secondary px-2.5 py-1 text-xs text-blue-300 border border-gray-700 hover:border-blue-500/40"
                      >
                        {related.name}
                        {related.catalogKind === 'streaming-ott' ? ' (OTT)' : ''}
                        {related.catalogKind === 'broadcast-cable-parent' ? ' (Broadcast / cable)' : ''}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-300 mt-4 max-w-3xl">
            <span className="text-gray-500">Revenue model: </span>
            {service.revenueModel}
          </p>

          {service.businessModelNotes && service.businessModelNotes.length > 0 && (
            <div className="mt-4 rounded-lg border border-gray-800 bg-dark-secondary/50 p-4 max-w-3xl">
              <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">Business model notes</p>
              <ul className="space-y-1.5 text-sm text-gray-300 list-disc pl-4">
                {service.businessModelNotes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-dark-secondary px-3 py-1 text-gray-300 border border-gray-700">
              {service.accessModel}
            </span>
            <a
              href={service.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit max-w-full items-center gap-1 rounded-full bg-dark-secondary px-3 py-1 text-gray-300 border border-gray-700 hover:border-gray-600"
            >
              <span className="truncate">
                {service.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}
              </span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </a>
          </div>
          <div className="mt-3">
            <SpecSourceLink
              href={service.specUrl}
              serviceWebsiteUrl={service.websiteUrl}
              override={service.specSourceType}
              variant="chip"
              showDescription
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          {service.deliveryOptions.length === 0 ? (
            <section className="lg:col-span-2 rounded-xl border border-gray-800 bg-dark-secondary/70 p-6 sm:p-8">
              <h2 className="text-lg font-semibold text-white">Delivery specifications</h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-400 max-w-3xl">
                We could not find published delivery specifications for this platform online. Contact the
                platform directly for current ingest requirements.
              </p>
            </section>
          ) : (
            <>
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Delivery options</h2>
            {service.deliveryOptions.map(option => {
              const isSelected = option.id === selectedOptionId;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectOption(option.id)}
                  className={`w-full text-left rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500/50 bg-blue-500/10'
                      : 'border-gray-800 bg-dark-secondary/70 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-white">{option.name}</h3>
                      <p className="text-xs text-blue-300/80 mt-1">{option.purpose}</p>
                    </div>
                    <ChevronRight className={`h-5 w-5 shrink-0 ${isSelected ? 'text-blue-300' : 'text-gray-600'}`} />
                  </div>
                  <p className="text-sm text-gray-400 mt-2">{option.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <BusinessModelBadge model={option.businessModel} showTooltip />
                    {option.ingestWorkflow && getIngestWorkflowLabel(option.ingestWorkflow) && (
                      <InfoTooltip content={getIngestWorkflowTooltip(option.ingestWorkflow)}>
                        <span className="inline-flex text-xs rounded-md bg-slate-500/10 px-2 py-1 text-slate-200 border border-slate-500/30 cursor-help">
                          {getIngestWorkflowLabel(option.ingestWorkflow)}
                        </span>
                      </InfoTooltip>
                    )}
                    <span className="text-xs rounded-md bg-dark-primary px-2 py-1 text-gray-400 border border-gray-700">
                      {option.deliveryTier}
                    </span>
                    <span className="text-xs rounded-md bg-dark-primary px-2 py-1 text-gray-300 border border-gray-700">
                      {option.calculator.codec} / {option.calculator.variant}
                    </span>
                    <span className="text-xs rounded-md bg-dark-primary px-2 py-1 text-gray-300 border border-gray-700">
                      {option.ffmpegSupported ? 'FFmpeg supported' : 'FFmpeg N/A'}
                    </span>
                  </div>
                </button>
              );
            })}
          </section>

          {selectedOption && (
            <section className="space-y-6">
              <div className="rounded-xl border border-gray-800 bg-dark-secondary/70 p-5 sm:p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <BusinessModelBadge model={selectedOption.businessModel} size="md" showTooltip />
                    <span className="text-xs text-gray-500">{selectedOption.deliveryTier}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">{selectedOption.name}</h2>
                    <p className="mt-2 text-sm leading-relaxed text-gray-400">{selectedOption.summary}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      {getBusinessModelDefinition(selectedOption.businessModel).description}
                    </p>
                    <div className="mt-3">
                      <SpecSourceLink
                        href={selectedOption.specUrl}
                        serviceWebsiteUrl={service.websiteUrl}
                        override={selectedOption.specSourceType}
                        short
                        variant="chip"
                      />
                    </div>
                  </div>
                </div>

                <PartnerSpecSummary
                  option={selectedOption}
                  categories={categories}
                  results={results}
                />

                {selectedOption.additionalNotes && selectedOption.additionalNotes.length > 0 && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <ul className="list-disc space-y-1.5 pl-4 text-sm text-gray-300">
                        {selectedOption.additionalNotes.map(note => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-gray-800 bg-dark-secondary/70 p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calculator className="h-5 w-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">File size estimate</h3>
                </div>

                <DurationInput duration={duration} onChange={setDuration} />

                {results ? (
                  <div className="mt-6 space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg bg-dark-primary p-4 border border-gray-800">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Total file size</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {formatFileSize(results.fileSizeMB, useBinaryUnits)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-dark-primary p-4 border border-gray-800">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Combined bitrate</p>
                        <p className="text-2xl font-bold text-white mt-1">{results.bitrateMbps.toFixed(2)} Mbps</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Video {results.videoBitrateMbps.toFixed(2)} + Audio {results.audioBitrateMbps.toFixed(2)} Mbps
                          {results.audioConfiguration && (
                            <span className="block mt-0.5 text-gray-600">
                              {results.audioConfiguration.profile.name} — {results.audioConfiguration.configuration.label}
                            </span>
                          )}
                          {!results.audioConfiguration && selectedOption.audioSpecs.length > 0 && (
                            <span className="block mt-0.5 text-amber-400/80">
                              Audio spec listed but not included in this estimate — check calculator settings.
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <button
                        type="button"
                        onClick={() => setUseBinaryUnits(current => !current)}
                        className="rounded-md border border-gray-700 px-3 py-1.5 text-gray-300 hover:border-gray-600"
                      >
                        {useBinaryUnits ? 'Showing binary (GiB/TiB)' : 'Showing decimal (GB/TB)'}
                      </button>
                      <span className="text-gray-500 inline-flex items-center gap-1">
                        <HardDrive className="h-4 w-4" />
                        {formatFileSize(results.fileSizeMB / (results.totalSeconds / 60), useBinaryUnits)}/min
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={calculatorPath}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
                      >
                        Open in calculator
                      </Link>
                      <button
                        type="button"
                        onClick={() => navigate(calculatorPath)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:border-gray-600"
                      >
                        Customize settings
                      </button>
                    </div>

                    {selectedOption.ffmpegSupported && (
                      <FfmpegCommandCard
                        codec={results.codec}
                        variant={results.variant}
                        resolution={results.resolution}
                        frameRate={results.frameRate}
                        videoBitrateMbps={results.videoBitrateMbps}
                        audioConfiguration={results.audioConfiguration}
                      />
                    )}

                    {!selectedOption.ffmpegSupported && (
                      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-gray-300">
                        {selectedOption.ffmpegNotes ??
                          'This delivery format is a package-level or proprietary workflow that FFmpeg cannot author as a single output file.'}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-gray-400">
                    Could not calculate file size for this option with the current catalog data.
                  </p>
                )}
              </div>
            </section>
          )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default StreamingServiceDetail;
