import React from 'react';
import { AlertTriangle, Check, Clipboard, Terminal } from 'lucide-react';
import type { Resolution } from '../data/resolutions';
import type { Codec, CodecVariant } from '../types/codecs';
import { generateFfmpegCommand } from '../utils/ffmpegCommand';
import type { ResolvedAudioConfiguration } from '../utils/audioConfigurations';

interface FfmpegCommandCardProps {
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

const FfmpegCommandCard: React.FC<FfmpegCommandCardProps> = ({
  codec,
  variant,
  resolution,
  frameRate,
  videoBitrateMbps,
  audioConfiguration,
}) => {
  const [copied, setCopied] = React.useState(false);
  const commandResult = React.useMemo(
    () => generateFfmpegCommand({
      codec,
      variant,
      resolution,
      frameRate,
      videoBitrateMbps,
      audioConfiguration,
    }),
    [audioConfiguration, codec, frameRate, resolution, variant, videoBitrateMbps]
  );

  const copyCommand = async () => {
    if (!commandResult.supported) {
      return;
    }

    try {
      await navigator.clipboard.writeText(commandResult.command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy FFmpeg command:', error);
    }
  };

  if (!commandResult.supported) {
    return (
      <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <div>
            <h3 className="text-sm font-semibold text-amber-200">FFmpeg command unavailable for this exact variant</h3>
            <p className="mt-2 text-sm text-gray-300">{commandResult.reason}</p>

            {commandResult.notes.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-gray-400">
                {commandResult.notes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Terminal className="mt-0.5 h-5 w-5 shrink-0 text-green-300" />
          <div>
            <h3 className="text-sm font-semibold text-green-300">FFmpeg Command</h3>
            <p className="mt-1 text-xs text-gray-400">
              Replace <code className="text-gray-200">INPUT_FILE</code> and{' '}
              <code className="text-gray-200">{commandResult.outputFile}</code>. Output container:{' '}
              {commandResult.containerLabel}.
            </p>
          </div>
        </div>

        <button
          onClick={copyCommand}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>

      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-dark-primary p-3 text-xs leading-relaxed text-gray-100">
        <code>{commandResult.command}</code>
      </pre>

      {(commandResult.requirements.length > 0 || commandResult.notes.length > 0) && (
        <div className="mt-3 space-y-2 text-xs text-gray-400">
          {commandResult.requirements.length > 0 && (
            <div>
              <span className="font-medium text-gray-300">Requires: </span>
              {commandResult.requirements.join(', ')}
            </div>
          )}

          {commandResult.notes.map(note => (
            <div key={note}>{note}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FfmpegCommandCard;
