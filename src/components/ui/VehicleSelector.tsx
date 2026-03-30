import React, { useState, useEffect } from 'react';
import { Select } from './Select';
import { getYears, getMakes, getModelsByMake } from '../../utils/vehicleData';

interface VehicleSelectorProps {
  year: string;
  make: string;
  model: string;
  onYearChange: (year: string) => void;
  onMakeChange: (make: string) => void;
  onModelChange: (model: string) => void;
  disabled?: boolean;
}

export const VehicleSelector: React.FC<VehicleSelectorProps> = ({
  year,
  make,
  model,
  onYearChange,
  onMakeChange,
  onModelChange,
  disabled = false,
}) => {
  const [years] = useState(getYears());
  const [makes] = useState(getMakes());
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    if (make) {
      setModels(getModelsByMake(make));
    } else {
      setModels([]);
    }
  }, [make]);

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onMakeChange(e.target.value);
    onModelChange('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Select
        label="Year"
        value={year}
        onChange={(e) => onYearChange(e.target.value)}
        disabled={disabled}
        options={[
          { value: '', label: 'Select Year' },
          ...years.map((y) => ({ value: y, label: y })),
        ]}
      />

      <Select
        label="Make"
        value={make}
        onChange={handleMakeChange}
        disabled={disabled}
        options={[
          { value: '', label: 'Select Make' },
          ...makes.map((m) => ({ value: m, label: m })),
        ]}
      />

      <Select
        label="Model"
        value={model}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled || !make}
        options={[
          { value: '', label: make ? 'Select Model' : 'Select Make First' },
          ...models.map((m) => ({ value: m, label: m })),
        ]}
      />
    </div>
  );
};
