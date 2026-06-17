import { Box, Button, Text } from '@inithium/ui';
import React, { useState } from 'react';
import AssetPickerDialog from './asset-picker-dialog';
import FontPickerField from './font-picker-field';

interface AssetPickerFieldProps {
  value: string;
  onChange: (val: string) => void;
}

const AssetPickerField: React.FC<AssetPickerFieldProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Box flex align="center" className="gap-3">
        {value ? (
          <Box flex align="center" className="gap-2 px-2 py-1 rounded-md border border-surface4 bg-surface2">
            <img
              src={value}
              alt="Current logo"
              className="h-8 w-8 rounded object-contain border border-surface4 shrink-0 bg-surface"
            />
            <Text variant="caption" overrideClassName="text-xs text-surface-contrast truncate max-w-40">
              {value.split('/').pop()}
            </Text>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-secondary hover:text-danger transition-colors ml-1 shrink-0"
              aria-label="Clear selection"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </Box>
        ) : (
          <Text variant="caption" color="secondary" overrideClassName="text-xs italic">
            No image selected
          </Text>
        )}
        <Button size="sm" color="secondary" variant="outline" leadingIcon="image" onClick={() => setOpen(true)}>
          {value ? 'Change' : 'Select Image'}
        </Button>
      </Box>

      <AssetPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        onSelect={onChange}
        selectedUrl={value}
      />
    </>
  );
};

const FONT_KEYS = new Set(['primary-font-asset', 'secondary-font-asset']);

interface SettingPickerFieldProps {
  settingKey: string;
  value: string;
  onChange: (val: string) => void;
}

const SettingPickerField: React.FC<SettingPickerFieldProps> = ({ settingKey, value, onChange }) => {
  if (FONT_KEYS.has(settingKey)) {
    return <FontPickerField value={value} onChange={onChange} />;
  }
  return <AssetPickerField value={value} onChange={onChange} />;
};

export default SettingPickerField;