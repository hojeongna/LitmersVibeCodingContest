'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Label } from './label';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  { name: 'Zinc', hex: '#71717A' },
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Violet', hex: '#8B5CF6' },
  { name: 'Green', hex: '#22C55E' },
  { name: 'Yellow', hex: '#F59E0B' },
  { name: 'Red', hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Pink', hex: '#EC4899' },
  { name: 'Cyan', hex: '#06B6D4' },
];

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);

  const handlePresetClick = (hex: string) => {
    onChange(hex);
    setCustomColor(hex);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    if (/^#[0-9A-Fa-f]{6}$/.test(newColor)) {
      onChange(newColor);
    }
  };

  return (
    <div className="space-y-3">
      {label && <Label>{label}</Label>}

      {/* Preset Colors */}
      <div className="grid grid-cols-9 gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color.hex}
            type="button"
            onClick={() => handlePresetClick(color.hex)}
            className={cn(
              'relative h-8 w-8 rounded-md border-2 transition-all hover:scale-110',
              value === color.hex ? 'border-zinc-900 dark:border-zinc-100' : 'border-transparent'
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          >
            {value === color.hex && (
              <Check className="absolute inset-0 m-auto h-5 w-5 text-white drop-shadow-md" />
            )}
          </button>
        ))}
      </div>

      {/* Custom Color Input */}
      <div className="flex items-center gap-2">
        <div
          className="h-8 w-8 flex-shrink-0 rounded-md border-2 border-zinc-200 dark:border-zinc-800"
          style={{ backgroundColor: customColor }}
        />
        <Input
          type="text"
          value={customColor}
          onChange={handleCustomChange}
          placeholder="#3B82F6"
          maxLength={7}
          className="font-mono text-sm"
        />
      </div>
      {customColor && !/^#[0-9A-Fa-f]{6}$/.test(customColor) && (
        <p className="text-xs text-red-600 dark:text-red-400">올바른 HEX 색상 형식이 아닙니다 (#XXXXXX)</p>
      )}
    </div>
  );
}
