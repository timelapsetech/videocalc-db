import type { Resolution } from '../data/resolutions';
import type { Codec, CodecVariant } from '../types/codecs';
import type { ResolvedAudioConfiguration } from './audioConfigurations';

export interface FfmpegCommandInput {
  codec: Codec;
  variant: CodecVariant;
  resolution: Resolution;
  frameRate: {
    id: string;
    value: number;
  };
  videoBitrateMbps: number;
  audioConfiguration?: ResolvedAudioConfiguration;
}

export type FfmpegCommandResult =
  | {
      supported: true;
      command: string;
      outputFile: string;
      outputExtension: string;
      containerLabel: string;
      notes: string[];
      requirements: string[];
    }
  | {
      supported: false;
      reason: string;
      notes: string[];
      requirements: string[];
    };

type CommandPart = string | { value: string; quote: true };

interface VideoRecipe {
  codecOptions: CommandPart[];
  muxer: string;
  outputExtension: string;
  containerLabel: string;
  pixelFormat?: string;
  extraFilterSteps?: string[];
  allowAudio: boolean;
  notes?: string[];
  requirements?: string[];
  movFastStart?: boolean;
}

interface AudioRecipe {
  codecOptions: CommandPart[];
  notes?: string[];
}

const INPUT_PLACEHOLDER = 'INPUT_FILE';
const OUTPUT_BASENAME = 'OUTPUT_FILE';

const unsupportedRawCodecs: Record<string, string> = {
  arri_raw: 'ARRIRAW and ARRICORE are proprietary camera recording formats; FFmpeg can decode some workflows but cannot author exact ARRI camera-original files.',
  braw: 'Blackmagic RAW is proprietary and FFmpeg does not provide a BRAW encoder for authoring exact .braw camera originals.',
  canon_raw: 'Canon Cinema RAW Light is proprietary and FFmpeg does not provide an encoder for exact .crm/.rmf camera-original files.',
  prores_raw: 'ProRes RAW encoding is not available in FFmpeg, so an exact ProRes RAW output command cannot be generated.',
  red_r3d: 'RED R3D is proprietary and FFmpeg does not provide an encoder for exact .r3d camera-original files.',
};

const h264Profiles: Record<string, string> = {
  'Baseline Profile': 'baseline',
  'Main Profile': 'main',
  'High Profile': 'high',
};

const hevcProfiles: Record<string, { profile: string; pixelFormat: string }> = {
  'Main Profile': { profile: 'main', pixelFormat: 'yuv420p' },
  'Main 10': { profile: 'main10', pixelFormat: 'yuv420p10le' },
  'Main 4:2:2 10': { profile: 'main422-10', pixelFormat: 'yuv422p10le' },
};

const av1Profiles: Record<string, { profile: string; pixelFormat: string }> = {
  'Main Profile': { profile: '0', pixelFormat: 'yuv420p' },
  'High Profile': { profile: '1', pixelFormat: 'yuv444p10le' },
  'Professional Profile': { profile: '2', pixelFormat: 'yuv422p10le' },
};

const vp9Profiles: Record<string, { profile: string; pixelFormat: string }> = {
  'Profile 0': { profile: '0', pixelFormat: 'yuv420p' },
  'Profile 2': { profile: '2', pixelFormat: 'yuv420p10le' },
};

const proResProfiles: Record<string, { profile: string; pixelFormat: string }> = {
  'ProRes 422 Proxy': { profile: 'proxy', pixelFormat: 'yuv422p10le' },
  'ProRes 422 LT': { profile: 'lt', pixelFormat: 'yuv422p10le' },
  'ProRes 422': { profile: 'standard', pixelFormat: 'yuv422p10le' },
  'ProRes 422 HQ': { profile: 'hq', pixelFormat: 'yuv422p10le' },
  'ProRes 4444': { profile: '4444', pixelFormat: 'yuva444p10le' },
  'ProRes 4444 XQ': { profile: '4444xq', pixelFormat: 'yuva444p10le' },
};

const dnxHrProfiles: Record<string, { profile: string; pixelFormat: string }> = {
  'DNxHR LB': { profile: 'dnxhr_lb', pixelFormat: 'yuv422p' },
  'DNxHR SQ': { profile: 'dnxhr_sq', pixelFormat: 'yuv422p' },
  'DNxHR HQ': { profile: 'dnxhr_hq', pixelFormat: 'yuv422p' },
  'DNxHR HQX': { profile: 'dnxhr_hqx', pixelFormat: 'yuv422p10le' },
  'DNxHR 444': { profile: 'dnxhr_444', pixelFormat: 'yuv444p10le' },
};

const dnxHdTenBitVariants = new Set(['DNxHD 185x', 'DNxHD 220x']);

function q(value: string): CommandPart {
  return { value, quote: true };
}

function renderCommandPart(part: CommandPart): string {
  if (typeof part === 'string') {
    return part;
  }

  return `"${part.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function renderCommand(parts: CommandPart[]): string {
  return parts.map(renderCommandPart).join(' ');
}

function bitrateKbps(mbps: number): number {
  return Math.round(mbps * 1000);
}

function bitrateArg(mbps: number): string {
  return `${bitrateKbps(mbps)}k`;
}

function doubledBitrateArg(mbps: number): string {
  return `${bitrateKbps(mbps) * 2}k`;
}

function frameRateArg(frameRate: FfmpegCommandInput['frameRate']): string {
  switch (frameRate.id) {
    case '23.98':
      return '24000/1001';
    case '29.97':
      return '30000/1001';
    case '59.94':
      return '60000/1001';
    default:
      return Number.isInteger(frameRate.value) ? String(frameRate.value) : String(frameRate.id);
  }
}

function gopSize(frameRate: FfmpegCommandInput['frameRate']): number {
  return Math.max(1, Math.round(frameRate.value * 2));
}

function videoFilter(
  resolution: Resolution,
  frameRate: FfmpegCommandInput['frameRate'],
  pixelFormat?: string,
  extraSteps: string[] = []
): CommandPart | null {
  const steps = [
    `scale=${resolution.width}:${resolution.height}:flags=lanczos`,
    `fps=${frameRateArg(frameRate)}`,
    ...extraSteps,
  ];

  if (pixelFormat) {
    steps.push(`format=${pixelFormat}`);
  }

  if (steps.length === 0) {
    return null;
  }

  return q(steps.join(','));
}

function h264Level(resolution: Resolution, frameRate: FfmpegCommandInput['frameRate']): string {
  const macroblocksPerFrame = Math.ceil(resolution.width / 16) * Math.ceil(resolution.height / 16);
  const macroblocksPerSecond = macroblocksPerFrame * frameRate.value;
  const levels = [
    { level: '3.0', maxMbPerSecond: 40500, maxFrameSize: 1620 },
    { level: '3.1', maxMbPerSecond: 108000, maxFrameSize: 3600 },
    { level: '3.2', maxMbPerSecond: 216000, maxFrameSize: 5120 },
    { level: '4.0', maxMbPerSecond: 245760, maxFrameSize: 8192 },
    { level: '4.2', maxMbPerSecond: 522240, maxFrameSize: 8704 },
    { level: '5.1', maxMbPerSecond: 983040, maxFrameSize: 36864 },
    { level: '5.2', maxMbPerSecond: 2073600, maxFrameSize: 36864 },
    { level: '6.1', maxMbPerSecond: 8355840, maxFrameSize: 139264 },
  ];

  return levels.find(level =>
    macroblocksPerFrame <= level.maxFrameSize &&
    macroblocksPerSecond <= level.maxMbPerSecond
  )?.level ?? '6.2';
}

function buildH264Recipe(input: FfmpegCommandInput): VideoRecipe | null {
  const profile = h264Profiles[input.variant.name];

  if (!profile) {
    return null;
  }

  const keyint = String(gopSize(input.frameRate));
  const options: CommandPart[] = [
    '-c:v',
    'libx264',
    '-profile:v',
    profile,
    '-level:v',
    h264Level(input.resolution, input.frameRate),
    '-preset',
    'slow',
    '-b:v',
    bitrateArg(input.videoBitrateMbps),
    '-maxrate:v',
    bitrateArg(input.videoBitrateMbps),
    '-bufsize:v',
    doubledBitrateArg(input.videoBitrateMbps),
    '-g',
    keyint,
    '-keyint_min',
    keyint,
    '-sc_threshold',
    '0',
    '-x264-params',
    q('nal-hrd=vbr'),
  ];

  if (profile === 'baseline') {
    options.push('-bf:v', '0', '-coder:v', 'vlc');
  }

  return {
    codecOptions: options,
    muxer: 'mp4',
    outputExtension: 'mp4',
    containerLabel: 'MP4',
    pixelFormat: 'yuv420p',
    allowAudio: true,
    movFastStart: true,
    requirements: ['FFmpeg built with libx264'],
  };
}

function buildHevcRecipe(input: FfmpegCommandInput): VideoRecipe | null {
  const profile = hevcProfiles[input.variant.name];

  if (!profile) {
    return null;
  }

  const keyint = gopSize(input.frameRate);
  const maxrate = bitrateKbps(input.videoBitrateMbps);
  const bufsize = maxrate * 2;

  return {
    codecOptions: [
      '-c:v',
      'libx265',
      '-profile:v',
      profile.profile,
      '-preset',
      'medium',
      '-b:v',
      bitrateArg(input.videoBitrateMbps),
      '-tag:v',
      'hvc1',
      '-x265-params',
      q(`vbv-maxrate=${maxrate}:vbv-bufsize=${bufsize}:keyint=${keyint}:min-keyint=${keyint}:scenecut=0`),
    ],
    muxer: 'mp4',
    outputExtension: 'mp4',
    containerLabel: 'MP4',
    pixelFormat: profile.pixelFormat,
    allowAudio: true,
    movFastStart: true,
    requirements: ['FFmpeg built with libx265'],
  };
}

function buildAv1Recipe(input: FfmpegCommandInput): VideoRecipe | FfmpegCommandResult | null {
  const profile = av1Profiles[input.variant.name];

  if (!profile) {
    return null;
  }

  if (profile.profile !== '0') {
    return unsupported('The FFmpeg SVT-AV1 encoder used by this command generator supports AV1 Main Profile 4:2:0 output, but this variant requires a higher-chroma AV1 profile.');
  }

  const usesMp4Audio = input.audioConfiguration?.profile.id === 'mp4-aac';
  const muxer = usesMp4Audio ? 'mp4' : 'webm';

  return {
    codecOptions: [
      '-c:v',
      'libsvtav1',
      '-profile:v',
      profile.profile,
      '-preset',
      '8',
      '-b:v',
      bitrateArg(input.videoBitrateMbps),
      '-g',
      String(gopSize(input.frameRate)),
    ],
    muxer,
    outputExtension: muxer,
    containerLabel: usesMp4Audio ? 'MP4' : 'WebM',
    pixelFormat: profile.pixelFormat,
    allowAudio: true,
    movFastStart: usesMp4Audio,
    requirements: ['FFmpeg built with libsvtav1'],
  };
}

function buildVp9Recipe(input: FfmpegCommandInput): VideoRecipe | null {
  const profile = vp9Profiles[input.variant.name];

  if (!profile) {
    return null;
  }

  return {
    codecOptions: [
      '-c:v',
      'libvpx-vp9',
      '-profile:v',
      profile.profile,
      '-deadline',
      'good',
      '-cpu-used',
      '2',
      '-b:v',
      bitrateArg(input.videoBitrateMbps),
      '-g',
      String(gopSize(input.frameRate)),
    ],
    muxer: 'webm',
    outputExtension: 'webm',
    containerLabel: 'WebM',
    pixelFormat: profile.pixelFormat,
    allowAudio: true,
    requirements: ['FFmpeg built with libvpx-vp9'],
  };
}

function buildProResRecipe(input: FfmpegCommandInput): VideoRecipe | null {
  const profile = proResProfiles[input.variant.name];

  if (!profile) {
    return null;
  }

  const options: CommandPart[] = [
    '-c:v',
    'prores_ks',
    '-profile:v',
    profile.profile,
    '-vendor',
    'apl0',
  ];

  if (profile.pixelFormat === 'yuva444p10le') {
    options.push('-alpha_bits', '16');
  }

  return {
    codecOptions: options,
    muxer: 'mov',
    outputExtension: 'mov',
    containerLabel: 'QuickTime MOV',
    pixelFormat: profile.pixelFormat,
    allowAudio: true,
    notes: profile.pixelFormat === 'yuva444p10le'
      ? ['The ProRes 4444 command writes an alpha-capable pixel format; sources without alpha will encode an opaque alpha plane.']
      : undefined,
  };
}

function buildDnxRecipe(input: FfmpegCommandInput): VideoRecipe | FfmpegCommandResult | null {
  const dnxHrProfile = dnxHrProfiles[input.variant.name];

  if (dnxHrProfile) {
    return {
      codecOptions: ['-c:v', 'dnxhd', '-profile:v', dnxHrProfile.profile],
      muxer: 'mov',
      outputExtension: 'mov',
      containerLabel: 'QuickTime MOV',
      pixelFormat: dnxHrProfile.pixelFormat,
      allowAudio: true,
    };
  }

  if (!input.variant.name.startsWith('DNxHD ')) {
    return null;
  }

  if (input.variant.name === 'DNxHD 220x') {
    return unsupported('FFmpeg rejected the catalog DNxHD 220x operating points in validation. This variant is disabled until the catalog includes the exact Avid raster, frame-rate, bit-depth, and bitrate combinations FFmpeg accepts.');
  }

  return {
    codecOptions: ['-c:v', 'dnxhd', '-b:v', bitrateArg(input.videoBitrateMbps)],
    muxer: 'mov',
    outputExtension: 'mov',
    containerLabel: 'QuickTime MOV',
    pixelFormat: dnxHdTenBitVariants.has(input.variant.name) ? 'yuv422p10le' : 'yuv422p',
    allowAudio: true,
    notes: ['DNxHD accepts only specific resolution, frame-rate, and bitrate combinations; FFmpeg will fail if the selected combination is not a legal DNxHD operating point.'],
  };
}

function buildAvcIntraRecipe(input: FfmpegCommandInput): VideoRecipe | FfmpegCommandResult | null {
  const match = input.variant.name.match(/^AVC-Intra (\d+)$/);

  if (!match) {
    return null;
  }

  const avcIntraClass = match[1];

  if (avcIntraClass === '50') {
    return unsupported('FFmpeg libx264 rejects the AVC-Intra 50 full-raster combinations in this catalog. This command is disabled until coded-raster metadata for AVC-Intra 50 is represented separately.');
  }

  if (input.frameRate.id === '24' || input.frameRate.id === '30' || input.frameRate.id === '60') {
    return unsupported('FFmpeg libx264 AVC-Intra encoding supports only a subset of Panasonic AVC-Intra frame rates here; exact 24, 30, and 60 fps are rejected by the encoder for these catalog modes.');
  }

  if (
    avcIntraClass === '200' &&
    input.resolution.id === '720p' &&
    input.frameRate.id !== '50' &&
    input.frameRate.id !== '59.94'
  ) {
    return unsupported('FFmpeg libx264 AVC-Intra 200 only accepts the 720p high-frame-rate modes represented in this catalog.');
  }

  return {
    codecOptions: ['-c:v', 'libx264', '-avcintra-class', avcIntraClass],
    muxer: 'mxf',
    outputExtension: 'mxf',
    containerLabel: 'MXF',
    pixelFormat: avcIntraClass === '50' ? 'yuv420p10le' : 'yuv422p10le',
    allowAudio: true,
    requirements: ['FFmpeg built with libx264'],
    notes: ['AVC-Intra output assumes a legal Panasonic AVC-Intra raster and frame-rate combination.'],
  };
}

function buildMpeg2Recipe(input: FfmpegCommandInput): VideoRecipe | null {
  const is422 = input.variant.name.includes('422P');
  const isInterlaced = input.resolution.id === '1080i';
  const codecOptions: CommandPart[] = [
    '-c:v',
    'mpeg2video',
    '-b:v',
    bitrateArg(input.videoBitrateMbps),
    '-minrate:v',
    bitrateArg(input.videoBitrateMbps),
    '-maxrate:v',
    bitrateArg(input.videoBitrateMbps),
    '-bufsize:v',
    doubledBitrateArg(input.videoBitrateMbps),
    '-g',
    String(input.frameRate.value >= 29 ? 15 : 12),
  ];

  if (isInterlaced) {
    codecOptions.push('-flags:v', '+ildct+ilme', '-top', '1');
  }

  return {
    codecOptions,
    muxer: 'mpegts',
    outputExtension: 'ts',
    containerLabel: 'MPEG-TS',
    pixelFormat: is422 ? 'yuv422p' : 'yuv420p',
    extraFilterSteps: isInterlaced ? ['setfield=tff'] : undefined,
    allowAudio: true,
    notes: isInterlaced
      ? ['The 1080i command marks top-field-first interlaced output and assumes the source cadence is appropriate for interlaced encoding.']
      : undefined,
  };
}

function buildMxfD10Recipe(input: FfmpegCommandInput): VideoRecipe | FfmpegCommandResult {
  if (input.resolution.id !== 'PAL' || input.frameRate.id !== '25') {
    return unsupported('FFmpeg MXF D-10 output is only enabled here for PAL 25 fps. NTSC D-10 muxing is known to be fragile in FFmpeg because the required fixed frame byte count can be off by one byte.');
  }

  return {
    codecOptions: [
      '-c:v',
      'mpeg2video',
      '-pix_fmt',
      'yuv422p',
      '-b:v',
      bitrateArg(input.videoBitrateMbps),
      '-minrate:v',
      bitrateArg(input.videoBitrateMbps),
      '-maxrate:v',
      bitrateArg(input.videoBitrateMbps),
      '-bufsize:v',
      '2000000',
      '-rc_init_occupancy:v',
      '2000000',
      '-flags:v',
      '+ildct+ilme',
      '-top',
      '1',
    ],
    muxer: 'mxf_d10',
    outputExtension: 'mxf',
    containerLabel: 'MXF D-10',
    pixelFormat: 'yuv422p',
    extraFilterSteps: ['setfield=tff'],
    allowAudio: true,
    notes: ['MXF D-10 is tightly constrained to legal SD IMX rasters and frame rates; FFmpeg will reject invalid combinations.'],
  };
}

function buildJpeg2000Recipe(input: FfmpegCommandInput): VideoRecipe | null {
  if (input.variant.name.includes('IMF')) {
    return null;
  }

  const isLossless = input.variant.name.toLowerCase().includes('lossless');
  const options: CommandPart[] = ['-c:v', 'jpeg2000', '-format', 'j2k'];

  if (isLossless) {
    options.push('-pred', '1');
  } else {
    options.push('-b:v', bitrateArg(input.videoBitrateMbps));
  }

  return {
    codecOptions: options,
    muxer: 'mxf',
    outputExtension: 'mxf',
    containerLabel: 'MXF',
    pixelFormat: 'yuv422p10le',
    allowAudio: true,
    notes: ['This creates an MXF-wrapped JPEG 2000 file. A full DCP/IMF package is outside FFmpeg single-file command generation.'],
  };
}

function buildLosslessJpeg2000Recipe(): VideoRecipe {
  return {
    codecOptions: ['-c:v', 'jpeg2000', '-pred', '1'],
    muxer: 'mxf',
    outputExtension: 'mxf',
    containerLabel: 'MXF',
    pixelFormat: 'yuv422p10le',
    allowAudio: true,
  };
}

function buildFfv1Recipe(): VideoRecipe {
  return {
    codecOptions: ['-c:v', 'ffv1', '-level', '3', '-coder', '1', '-context', '1', '-g', '1', '-slicecrc', '1'],
    muxer: 'matroska',
    outputExtension: 'mkv',
    containerLabel: 'Matroska',
    pixelFormat: 'yuv422p10le',
    allowAudio: true,
  };
}

function buildUncompressedRecipe(input: FfmpegCommandInput): VideoRecipe | null {
  if (!input.variant.name.includes('4:2:2')) {
    return null;
  }

  if (input.variant.name.includes('10-bit')) {
    return {
      codecOptions: ['-c:v', 'v210'],
      muxer: 'mov',
      outputExtension: 'mov',
      containerLabel: 'QuickTime MOV',
      pixelFormat: 'yuv422p10le',
      allowAudio: true,
    };
  }

  return {
    codecOptions: ['-c:v', 'rawvideo', '-tag:v', '2vuy'],
    muxer: 'mov',
    outputExtension: 'mov',
    containerLabel: 'QuickTime MOV',
    pixelFormat: 'uyvy422',
    allowAudio: true,
  };
}

function buildVideoRecipe(input: FfmpegCommandInput): FfmpegCommandResult | VideoRecipe {
  const unsupportedReason = unsupportedRawCodecs[input.codec.id];

  if (unsupportedReason) {
    return unsupported(unsupportedReason);
  }

  switch (input.codec.id) {
    case 'h264':
      return buildH264Recipe(input) ?? unsupported(`No FFmpeg H.264 recipe is defined for ${input.variant.name}.`);
    case 'h265':
      return buildHevcRecipe(input) ?? unsupported(`No FFmpeg HEVC recipe is defined for ${input.variant.name}.`);
    case 'av1':
      return buildAv1Recipe(input) ?? unsupported(`No FFmpeg AV1 recipe is defined for ${input.variant.name}.`);
    case 'vp9':
      return buildVp9Recipe(input) ?? unsupported(`No FFmpeg VP9 recipe is defined for ${input.variant.name}.`);
    case 'prores':
      return buildProResRecipe(input) ?? unsupported(`No FFmpeg ProRes recipe is defined for ${input.variant.name}.`);
    case 'dnxhd':
      return buildDnxRecipe(input) ?? unsupported(`No FFmpeg DNxHD/DNxHR recipe is defined for ${input.variant.name}.`);
    case 'cineform':
      return unsupported('FFmpeg can encode CineForm, but this catalog does not yet contain enough metadata to map Low, Medium, High, and Film Scan to exact CFHD encoder settings.');
    case 'avc_intra':
      return buildAvcIntraRecipe(input) ?? unsupported(`No FFmpeg AVC-Intra recipe is defined for ${input.variant.name}.`);
    case 'xavc':
      return unsupported('Sony XAVC is a family of camera operating points and wrappers. The catalog does not yet contain enough Sony-specific metadata to author an exact XAVC file with FFmpeg.');
    case 'xdcam':
      return unsupported('Sony XDCAM files require exact Sony operating-point and wrapper constraints. The catalog does not yet contain enough metadata to generate an exact FFmpeg command.');
    case 'jpeg2000':
      return buildJpeg2000Recipe(input) ?? unsupported('This JPEG 2000 variant represents a package-level delivery profile such as IMF/DCP, not a single FFmpeg-authored media file.');
    case 'mpeg2':
      return buildMpeg2Recipe(input) ?? unsupported(`No FFmpeg MPEG-2 recipe is defined for ${input.variant.name}.`);
    case 'mxf_d10':
      return buildMxfD10Recipe(input);
    case 'lossless_jpeg2000':
      return buildLosslessJpeg2000Recipe();
    case 'ffv1':
      return buildFfv1Recipe();
    case 'uncompressed':
      return buildUncompressedRecipe(input) ?? unsupported(`No FFmpeg uncompressed-video recipe is defined for ${input.variant.name}.`);
    default:
      return unsupported(`FFmpeg command generation has not been researched for ${input.codec.name}.`);
  }
}

function compressedAudioRecipe(input: ResolvedAudioConfiguration): AudioRecipe | FfmpegCommandResult {
  const bitrate = input.configuration.bitrateKbps ?? input.profile.bitrateKbps;
  const sampleRate = input.configuration.sampleRateHz ?? input.profile.sampleRateHz ?? 48000;
  const commonOptions: CommandPart[] = ['-ar', String(sampleRate), '-ac', String(input.configuration.channels)];

  if (!bitrate) {
    return unsupported(`The selected audio profile ${input.profile.name} is missing a bitrate.`);
  }

  switch (input.profile.id) {
    case 'mp4-aac':
    case 'xavc-mp4-aac':
      return {
        codecOptions: ['-c:a', 'aac', '-profile:a', 'aac_low', '-b:a', `${bitrate}k`, ...commonOptions],
      };
    case 'webm-opus':
      return {
        codecOptions: ['-c:a', 'libopus', '-b:a', `${bitrate}k`, '-vbr', 'constrained', ...commonOptions],
      };
    case 'hls-surround': {
      const encoder = input.configuration.id.startsWith('eac3') ? 'eac3' : 'ac3';
      return {
        codecOptions: ['-c:a', encoder, '-b:a', `${bitrate}k`, ...commonOptions],
      };
    }
    case 'broadcast-aac-layer-ac3': {
      const encoder = input.configuration.id.startsWith('layer2')
        ? 'mp2'
        : input.configuration.id.startsWith('ac3')
          ? 'ac3'
          : 'aac';
      const profileOptions = encoder === 'aac' ? ['-profile:a', 'aac_low'] : [];

      return {
        codecOptions: ['-c:a', encoder, ...profileOptions, '-b:a', `${bitrate}k`, ...commonOptions],
      };
    }
    default:
      return unsupported(`No FFmpeg audio recipe is defined for ${input.profile.name}.`);
  }
}

function pcmAudioRecipe(input: ResolvedAudioConfiguration): AudioRecipe | FfmpegCommandResult {
  const bitDepth = input.configuration.bitDepth ?? input.profile.bitDepth;
  const sampleRate = input.configuration.sampleRateHz ?? input.profile.sampleRateHz ?? 48000;

  if (bitDepth !== 16 && bitDepth !== 24 && bitDepth !== 32) {
    return unsupported(`The selected PCM audio profile requires unsupported ${bitDepth ?? 'unknown'}-bit output.`);
  }

  const encoder = bitDepth === 16 ? 'pcm_s16le' : bitDepth === 24 ? 'pcm_s24le' : 'pcm_s32le';

  return {
    codecOptions: ['-c:a', encoder, '-ar', String(sampleRate), '-ac', String(input.configuration.channels)],
  };
}

function buildAudioRecipe(input: ResolvedAudioConfiguration): AudioRecipe | FfmpegCommandResult {
  switch (input.profile.kind) {
    case 'compressed':
      return compressedAudioRecipe(input);
    case 'pcm':
      return pcmAudioRecipe(input);
    default: {
      const exhaustiveKind: never = input.profile.kind;
      return exhaustiveKind;
    }
  }
}

function validateAudioContainer(
  audioRecipe: AudioRecipe,
  audioConfiguration: ResolvedAudioConfiguration,
  videoRecipe: VideoRecipe
): FfmpegCommandResult | null {
  const audioProfileId = audioConfiguration.profile.id;

  if (!videoRecipe.allowAudio) {
    return unsupported(`${videoRecipe.containerLabel} output for this video variant cannot carry the selected audio in a single FFmpeg output file.`);
  }

  if (videoRecipe.muxer === 'webm' && audioProfileId !== 'webm-opus') {
    return unsupported('WebM output requires an audio profile compatible with WebM, such as Opus.');
  }

  if (videoRecipe.muxer === 'mp4') {
    const mp4AudioProfiles = new Set(['mp4-aac', 'xavc-mp4-aac', 'hls-surround']);

    if (!mp4AudioProfiles.has(audioProfileId)) {
      return unsupported('MP4 output cannot carry the selected audio profile in this command generator.');
    }
  }

  if (videoRecipe.muxer === 'mpegts') {
    const transportAudioProfiles = new Set(['broadcast-aac-layer-ac3']);

    if (!transportAudioProfiles.has(audioProfileId)) {
      return unsupported('MPEG-TS output requires a transport-compatible audio profile.');
    }
  }

  if (!audioRecipe.codecOptions.length) {
    return unsupported(`No audio encoder options were generated for ${audioConfiguration.profile.name}.`);
  }

  return null;
}

function unsupported(reason: string, notes: string[] = [], requirements: string[] = []): FfmpegCommandResult {
  return {
    supported: false,
    reason,
    notes,
    requirements,
  };
}

function isUnsupportedResult(value: FfmpegCommandResult | VideoRecipe | AudioRecipe): value is FfmpegCommandResult {
  return 'supported' in value && value.supported === false;
}

export function generateFfmpegCommand(input: FfmpegCommandInput): FfmpegCommandResult {
  const videoRecipe = buildVideoRecipe(input);

  if (isUnsupportedResult(videoRecipe)) {
    return videoRecipe;
  }

  const outputFile = `${OUTPUT_BASENAME}.${videoRecipe.outputExtension}`;
  const commandParts: CommandPart[] = ['ffmpeg', '-y', '-i', q(INPUT_PLACEHOLDER), '-map', '0:v:0'];
  const notes = [...(videoRecipe.notes ?? [])];
  const requirements = [...(videoRecipe.requirements ?? [])];
  const filter = videoFilter(
    input.resolution,
    input.frameRate,
    videoRecipe.pixelFormat,
    videoRecipe.extraFilterSteps
  );

  if (filter) {
    commandParts.push('-vf', filter);
  }

  commandParts.push(...videoRecipe.codecOptions);

  if (input.audioConfiguration) {
    const audioRecipe = buildAudioRecipe(input.audioConfiguration);

    if (isUnsupportedResult(audioRecipe)) {
      return audioRecipe;
    }

    const containerProblem = validateAudioContainer(audioRecipe, input.audioConfiguration, videoRecipe);

    if (containerProblem) {
      return containerProblem;
    }

    notes.push('The command expects INPUT_FILE to contain at least one audio stream for the selected audio output.');
    commandParts.push('-map', '0:a:0', ...audioRecipe.codecOptions);
  } else {
    commandParts.push('-an');
  }

  if (videoRecipe.movFastStart) {
    commandParts.push('-movflags', '+faststart');
  }

  commandParts.push('-f', videoRecipe.muxer, q(outputFile));

  return {
    supported: true,
    command: renderCommand(commandParts),
    outputFile,
    outputExtension: videoRecipe.outputExtension,
    containerLabel: videoRecipe.containerLabel,
    notes,
    requirements,
  };
}
