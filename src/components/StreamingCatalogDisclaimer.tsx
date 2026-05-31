import React from 'react';
import { AlertTriangle } from 'lucide-react';

const StreamingCatalogDisclaimer: React.FC = () => (
  <div
    role="status"
    className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 sm:px-5 sm:py-4"
  >
    <div className="flex gap-3">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
      <div className="text-sm text-gray-200 leading-relaxed">
        <p className="font-medium text-amber-100">New feature — still being validated</p>
        <p className="mt-1 text-gray-300">
          Delivery specs, file-size estimates, and FFmpeg commands here are compiled from public sources and
          typical partner workflows. They may be incomplete or out of date. Always confirm current requirements
          directly with the platform before delivering masters.
        </p>
        <p className="mt-1.5 text-xs text-gray-400">
          Only partners with published ingest documentation (official specs or cited technical guides) appear in
          this catalog. Links labeled as third-party guides are not official platform documentation.
        </p>
      </div>
    </div>
  </div>
);

export default StreamingCatalogDisclaimer;
