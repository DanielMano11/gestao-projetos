import React, { useEffect, useRef, useState } from 'react';
import { Check, RotateCcw, Settings, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import {
  isLightColor,
  SIDEBAR_COLOR_PRESETS,
} from '../../utils/themeColors';

export const SidebarColorPicker: React.FC = () => {
  const {
    customSidebarColor,
    effectiveSidebarColor,
    setSidebarColor,
    resetSidebarColor,
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const activeHex = effectiveSidebarColor.toLowerCase();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label="Personalizar aparência do menu lateral"
        title="Personalizar aparência do menu lateral"
        className="app-sidebar-control flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition"
      >
        <span className="inline-flex items-center gap-2">
          <Settings
            className={`h-4 w-4 transition-transform duration-200 ${
              isOpen ? 'rotate-45' : ''
            }`}
          />
          <span>Aparência do menu</span>
        </span>
        <span
          aria-hidden="true"
          style={{ backgroundColor: activeHex }}
          className="h-4 w-4 shrink-0 rounded-full border border-slate-400/50 shadow-inner"
        />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Aparência do menu lateral"
          className="absolute left-0 top-full z-50 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-3.5 text-slate-900 shadow-xl dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 md:bottom-full md:top-auto md:mb-2 md:mt-0 md:w-full"
        >
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              Aparência do menu
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fechar aparência do menu"
              className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Cor do menu
              </span>
              {customSidebarColor && (
                <button
                  type="button"
                  onClick={resetSidebarColor}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                  title="Restaurar cor padrão do menu"
                >
                  <RotateCcw className="h-3 w-3" />
                  Padrão
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {SIDEBAR_COLOR_PRESETS.map((preset) => {
                const isSelected = activeHex === preset.hex.toLowerCase();
                const lightSwatch = isLightColor(preset.hex);
                const checkColor = lightSwatch
                  ? 'text-slate-900'
                  : 'text-white';

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSidebarColor(preset.hex)}
                    title={`${preset.name} (${preset.hex.toUpperCase()})`}
                    aria-label={`Cor do menu: ${preset.name}`}
                    aria-pressed={isSelected}
                    style={{ backgroundColor: preset.hex }}
                    className={`flex h-7 w-full items-center justify-center rounded-md border transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-1 dark:ring-offset-slate-900'
                        : lightSwatch
                          ? 'border-slate-300 dark:border-slate-600'
                          : 'border-slate-300/40 dark:border-white/20'
                    }`}
                  >
                    {isSelected && (
                      <Check className={`h-3.5 w-3.5 ${checkColor}`} />
                    )}
                  </button>
                );
              })}
            </div>

            <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
              <span className="flex items-center gap-2">
                <input
                  type="color"
                  aria-label="Escolher cor personalizada do menu lateral"
                  value={activeHex}
                  onChange={(e) => setSidebarColor(e.target.value)}
                  className="app-sidebar-color-input h-5 w-5 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <span>Personalizar</span>
              </span>
              <span className="font-mono text-[11px] uppercase text-slate-500 dark:text-slate-400">
                {activeHex}
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
