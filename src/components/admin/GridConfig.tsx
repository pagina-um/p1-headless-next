import React from 'react';
import { GridConfig } from '../../types';

interface GridConfigProps {
  config: GridConfig;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function GridConfigPanel({ config, onChange }: GridConfigProps) {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Grid Configuration</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Columns</label>
          <input
            type="number"
            name="columns"
            value={config.columns}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Rows</label>
          <input
            type="number"
            name="rows"
            value={config.rows}
            onChange={onChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}