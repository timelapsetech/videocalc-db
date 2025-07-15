import React from 'react';
import { Clock } from 'lucide-react';

interface Duration {
  hours: number;
  minutes: number;
  seconds: number;
}

interface DurationInputProps {
  duration: Duration;
  onChange: (duration: Duration) => void;
}

const DurationInput: React.FC<DurationInputProps> = ({ duration, onChange }) => {
  const handleChange = (field: keyof Duration, value: string) => {
    const numValue = Math.max(0, parseInt(value) || 0);
    let newDuration = { ...duration, [field]: numValue };
    
    // Handle overflow
    if (field === 'seconds' && numValue >= 60) {
      newDuration.minutes += Math.floor(numValue / 60);
      newDuration.seconds = numValue % 60;
    }
    if (field === 'minutes' && numValue >= 60) {
      newDuration.hours += Math.floor(numValue / 60);
      newDuration.minutes = numValue % 60;
    }
    
    onChange(newDuration);
  };

  const totalSeconds = duration.hours * 3600 + duration.minutes * 60 + duration.seconds;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300 flex items-center">
        <Clock className="h-4 w-4 mr-2" />
        Duration
      </label>
      
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Hours</label>
          <input
            type="number"
            min="0"
            value={duration.hours}
            onChange={(e) => handleChange('hours', e.target.value)}
            className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Minutes</label>
          <input
            type="number"
            min="0"
            max="59"
            value={duration.minutes}
            onChange={(e) => handleChange('minutes', e.target.value)}
            className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-xs text-gray-400 mb-1">Seconds</label>
          <input
            type="number"
            min="0"
            max="59"
            value={duration.seconds}
            onChange={(e) => handleChange('seconds', e.target.value)}
            className="w-full px-3 py-2 bg-dark-primary border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-2">
        Total: {Math.floor(totalSeconds / 3600)}h {Math.floor((totalSeconds % 3600) / 60)}m {totalSeconds % 60}s ({totalSeconds.toLocaleString()} seconds)
      </div>
    </div>
  );
};

export default DurationInput;