import type { AudioSelection } from './audioConfigurations';

// URL Parameter Encoding/Decoding for sharing calculations
export const encodeCalculationURL = (
  category: string, 
  codec: string, 
  variant: string, 
  resolution: string, 
  frameRate: string, 
  hours: number,
  minutes: number,
  seconds: number,
  audioSelection?: AudioSelection,
  videoBitrateOverrideMbps?: number
) => {
  const params = new URLSearchParams();
  
  // Only add parameters if they have values - use simple encoding
  if (category) params.set('category', category);
  if (codec) params.set('codec', codec);
  if (variant) params.set('variant', variant);
  if (resolution) params.set('resolution', resolution);
  if (frameRate) params.set('framerate', frameRate);
  
  // Always include duration
  params.set('hours', hours.toString());
  params.set('minutes', minutes.toString());
  params.set('seconds', seconds.toString());

  if (audioSelection?.enabled && audioSelection.profileId && audioSelection.configurationId) {
    params.set('audio', '1');
    params.set('audioProfile', audioSelection.profileId);
    params.set('audioConfig', audioSelection.configurationId);
  }

  if (videoBitrateOverrideMbps && videoBitrateOverrideMbps > 0) {
    params.set('videoMbps', videoBitrateOverrideMbps.toString());
  }
  
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
};

export const decodeCalculationURL = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    category: params.get('category') || '',
    codec: params.get('codec') || '',
    variant: params.get('variant') || '',
    resolution: params.get('resolution') || '',
    frameRate: params.get('framerate') || '30',
    hours: parseInt(params.get('hours') || '1'),
    minutes: parseInt(params.get('minutes') || '0'),
    seconds: parseInt(params.get('seconds') || '0'),
    audioSelection: {
      enabled: params.get('audio') === '1',
      profileId: params.get('audioProfile') || '',
      configurationId: params.get('audioConfig') || '',
    },
    videoBitrateOverrideMbps: (() => {
      const value = parseFloat(params.get('videoMbps') || '');
      return !Number.isNaN(value) && value > 0 ? value : undefined;
    })(),
  };
};

export const generateShareableLink = (
  category: string,
  codec: string,
  variant: string,
  resolution: string,
  frameRate: string,
  duration: { hours: number; minutes: number; seconds: number },
  audioSelection?: AudioSelection,
  videoBitrateOverrideMbps?: number
) => {
  return encodeCalculationURL(
    category,
    codec,
    variant,
    resolution,
    frameRate,
    duration.hours,
    duration.minutes,
    duration.seconds,
    audioSelection,
    videoBitrateOverrideMbps
  );
};

export const buildCalculatorPath = (
  category: string,
  codec: string,
  variant: string,
  resolution: string,
  frameRate: string,
  duration: { hours: number; minutes: number; seconds: number } = { hours: 1, minutes: 0, seconds: 0 },
  audioSelection?: AudioSelection,
  videoBitrateOverrideMbps?: number
) => {
  const params = new URLSearchParams();

  if (category) params.set('category', category);
  if (codec) params.set('codec', codec);
  if (variant) params.set('variant', variant);
  if (resolution) params.set('resolution', resolution);
  if (frameRate) params.set('framerate', frameRate);
  params.set('hours', duration.hours.toString());
  params.set('minutes', duration.minutes.toString());
  params.set('seconds', duration.seconds.toString());

  if (audioSelection?.enabled && audioSelection.profileId && audioSelection.configurationId) {
    params.set('audio', '1');
    params.set('audioProfile', audioSelection.profileId);
    params.set('audioConfig', audioSelection.configurationId);
  }

  if (videoBitrateOverrideMbps && videoBitrateOverrideMbps > 0) {
    params.set('videoMbps', videoBitrateOverrideMbps.toString());
  }

  return `/?${params.toString()}`;
};