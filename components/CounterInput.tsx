import React from 'react';
import { Plus, Minus } from 'lucide-react';

interface CounterInputProps {
  label: string;
  sublabel?: string;
  value: number;
  onChange: (val: number) => void;
  icon?: React.ReactNode;
  max?: number;
}

export const CounterInput: React.FC<CounterInputProps> = ({ 
  label, 
  sublabel,
  value, 
  onChange, 
  icon,
  max 
}) => {
  const handleIncrement = () => {
    if (max !== undefined && value >= max) return;
    onChange(value + 1);
  };
  const handleDecrement = () => onChange(Math.max(0, value - 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) newValue = 0;
    newValue = Math.max(0, newValue);
    if (max !== undefined && newValue > max) {
      newValue = max;
    }
    onChange(newValue);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const isActive = value > 0;
  const isMaxReached = max !== undefined && value >= max;

  return (
    <div 
      className={`group flex flex-col justify-between h-full p-3.5 rounded-xl border transition-colors ${
        isActive 
          ? 'bg-neutral-50/80 border-neutral-700 shadow-2xs' 
          : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
      }`}
    >
      <div className="min-w-0 flex-1 mb-3">
        <div className="flex items-center gap-1.5">
          {icon && (
            <div className={`shrink-0 transition-colors ${isActive ? 'text-neutral-900' : 'text-gray-400'}`}>
              {icon}
            </div>
          )}
          <div className={`text-sm font-semibold leading-snug truncate transition-colors ${isActive ? 'text-neutral-950' : 'text-gray-800'}`}>
            {label}
          </div>
        </div>
        {sublabel && (
          <div className="text-xs text-gray-400 leading-tight mt-1 line-clamp-2">
            {sublabel}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100 mt-auto">
        <span className="text-xs font-medium text-gray-400">
          {isMaxReached ? (
            <span className="text-amber-600 font-semibold">Máx. atingido ({max})</span>
          ) : (
            'Quantidade'
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDecrement}
            disabled={value === 0}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-gray-200 bg-white hover:bg-gray-100 active:scale-95 disabled:opacity-20 disabled:hover:bg-white text-gray-600 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            type="button"
            tabIndex={-1}
            aria-label={`Diminuir ${label}`}
          >
            <Minus size={13} strokeWidth={2.5} />
          </button>
          <input
            type="number"
            min="0"
            max={max}
            value={value.toString()}
            onChange={handleInputChange}
            onFocus={handleFocus}
            className={`w-11 text-center font-bold text-sm py-1 rounded-md border outline-none transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${
              isActive
                ? isMaxReached 
                  ? 'bg-amber-50/50 border-amber-400 text-neutral-950 shadow-2xs'
                  : 'bg-white border-neutral-400 text-neutral-950 shadow-2xs'
                : 'bg-gray-50 border-gray-200 text-gray-600 focus:bg-white focus:border-neutral-400 focus:text-neutral-900'
            }`}
          />
          <button
            onClick={handleIncrement}
            disabled={isMaxReached}
            className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-300 bg-neutral-900 hover:bg-neutral-800 text-white active:scale-95 disabled:opacity-20 disabled:hover:bg-neutral-900 transition-colors cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            type="button"
            tabIndex={-1}
            aria-label={`Aumentar ${label}`}
          >
            <Plus size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
