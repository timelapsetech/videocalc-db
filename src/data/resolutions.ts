export interface Resolution {
  id: string;
  name: string;
  width: number;
  height: number;
  category: string;
}

export const resolutions: Resolution[] = [
  // SD
  { id: 'NTSC_DV', name: 'NTSC DV (720×480)', width: 720, height: 480, category: 'SD' },
  { id: 'NTSC_D1', name: 'NTSC D1 (720×486)', width: 720, height: 486, category: 'SD' },
  { id: 'PAL', name: 'PAL (720×576)', width: 720, height: 576, category: 'SD' },
  
  // HD
  { id: '720p', name: '720p HD (1280×720)', width: 1280, height: 720, category: 'HD' },
  { id: '1080i', name: '1080i (1920×1080 interlaced)', width: 1920, height: 1080, category: 'HD' },
  { id: '1080p', name: '1080p FHD (1920×1080)', width: 1920, height: 1080, category: 'HD' },
  { id: '1440x1080', name: '1440×1080 (HDV)', width: 1440, height: 1080, category: 'HD' },
  
  // Cinema
  { id: '2K', name: '2K (2048×1080)', width: 2048, height: 1080, category: 'Cinema' },
  { id: '4K', name: '4K (4096×2160)', width: 4096, height: 2160, category: 'Cinema' },
  { id: '6K', name: '6K (6144×3240)', width: 6144, height: 3240, category: 'Cinema' },
  { id: '8K', name: '8K (8192×4320)', width: 8192, height: 4320, category: 'Cinema' },
  
  // UHD
  { id: 'UHD', name: 'UHD (3840×2160)', width: 3840, height: 2160, category: 'UHD' },
  { id: '8K UHD', name: '8K UHD (7680×4320)', width: 7680, height: 4320, category: 'UHD' }
];

export const frameRates = [
  { id: '23.98', name: '23.98 fps (Film on TV)', value: 23.976, category: 'Film on TV' },
  { id: '24', name: '24 fps (True Cinema)', value: 24, category: 'Cinema' },
  { id: '25', name: '25 fps (PAL/European)', value: 25, category: 'Broadcast' },
  { id: '29.97', name: '29.97 fps (NTSC)', value: 29.97, category: 'Broadcast' },
  { id: '30', name: '30 fps', value: 30, category: 'Standard' },
  { id: '50', name: '50 fps (PAL Progressive)', value: 50, category: 'Broadcast' },
  { id: '59.94', name: '59.94 fps (NTSC Progressive)', value: 59.94, category: 'Broadcast' },
  { id: '60', name: '60 fps', value: 60, category: 'Standard' },
  { id: '120', name: '120 fps (High Frame Rate)', value: 120, category: 'HFR' },
  { id: '240', name: '240 fps (Super Slow Motion)', value: 240, category: 'HFR' }
];

// Workflow presets for common use cases
export const workflowPresets = {
  'YouTube 1080p': { 
    category: 'delivery', 
    codec: 'h264', 
    variant: 'High Profile', 
    resolution: '1080p' 
  },
  'Netflix 4K': { 
    category: 'broadcast', 
    codec: 'jpeg2000', 
    variant: 'J2K IMF 4K', 
    resolution: 'UHD' 
  },
  'News TV': { 
    category: 'camera', 
    codec: 'xdcam', 
    variant: 'XDCAM HD422', 
    resolution: '1080i' 
  },
  'Episodic TV': { 
    category: 'professional', 
    codec: 'dnxhd', 
    variant: 'DNxHD 145', 
    resolution: '1080p' 
  },
  'Documentary Edit': { 
    category: 'professional', 
    codec: 'dnxhd', 
    variant: 'DNxHR HQ', 
    resolution: '1080p' 
  },
  'Color Grading': { 
    category: 'professional', 
    codec: 'prores', 
    variant: 'ProRes 4444', 
    resolution: 'UHD' 
  },
  'RAW Cinema': { 
    category: 'raw', 
    codec: 'braw', 
    variant: 'BRAW 5:1', 
    resolution: 'UHD' 
  },
  'Cinema 2K': { 
    category: 'raw', 
    codec: 'arri_raw', 
    variant: 'ARRIRAW 3.2K', 
    resolution: '2K' 
  }
};