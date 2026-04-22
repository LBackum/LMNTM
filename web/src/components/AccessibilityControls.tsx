"use client";
import { useEffect, useState } from "react";

/**
 * Reader accessibility controls. Preferences persist in localStorage and are
 * applied by toggling classes + CSS variables on <html>, so every page
 * respects the user's choice without a server round-trip.
 *
 * The same preferences mirror `prefers-reduced-motion` and `prefers-contrast`
 * on first visit.
 */

type Prefs = {
  fontScale: number;        // 1.0 = default; 0.9 to 1.4
  highContrast: boolean;
  dyslexicFont: boolean;
  reducedMotion: boolean;
};

const KEY = "lmntm_a11y";
const DEFAULT: Prefs = { fontScale: 1, highContrast: false, dyslexicFont: false, reducedMotion: false };

function load(): Prefs {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) return { ...DEFAULT, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch { /* noop */ }
  return {
    ...DEFAULT,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    highContrast: window.matchMedia?.("(prefers-contrast: more)").matches ?? false,
  };
}

function apply(prefs: Prefs) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--reader-font-scale", String(prefs.fontScale));
  root.classList.toggle("a11y-contrast", prefs.highContrast);
  root.classList.toggle("a11y-dyslexic", prefs.dyslexicFont);
  root.classList.toggle("a11y-reduced-motion", prefs.reducedMotion);
}

export default function AccessibilityControls({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT);

  useEffect(() => {
    const loaded = load();
    setPrefs(loaded);
    apply(loaded);
  }, []);

  function update(p: Partial<Prefs>) {
    const next = { ...prefs, ...p };
    setPrefs(next);
    apply(next);
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Reading settings"
        className="btn-ghost px-3 py-1.5 text-sm"
      >
        {compact ? "Aa" : "Reading settings"}
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="Reading settings"
          className="absolute right-0 z-40 mt-2 w-72 rounded-2xl bg-white p-4 shadow-page ring-1 ring-cocoa/10"
        >
          <fieldset className="space-y-3">
            <div>
              <label htmlFor="fs" className="flex items-center justify-between text-sm font-sans text-cocoa">
                <span>Font size</span>
                <span className="font-mono text-xs text-cocoa/60">{Math.round(prefs.fontScale * 100)}%</span>
              </label>
              <input
                id="fs"
                type="range"
                min={0.9}
                max={1.4}
                step={0.05}
                value={prefs.fontScale}
                onChange={(e) => update({ fontScale: Number(e.target.value) })}
                className="mt-1 w-full accent-sage"
              />
            </div>
            <Toggle
              label="High contrast"
              checked={prefs.highContrast}
              onChange={(v) => update({ highContrast: v })}
            />
            <Toggle
              label="Dyslexia-friendly font"
              checked={prefs.dyslexicFont}
              onChange={(v) => update({ dyslexicFont: v })}
            />
            <Toggle
              label="Reduce motion"
              checked={prefs.reducedMotion}
              onChange={(v) => update({ reducedMotion: v })}
            />
          </fieldset>
          <p className="mt-4 text-xs text-cocoa/60">
            Preferences save to this device. They apply to every page.
          </p>
        </div>
      )}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm font-sans text-cocoa">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-cocoa/30 text-garnet focus:ring-garnet"
      />
    </label>
  );
}
