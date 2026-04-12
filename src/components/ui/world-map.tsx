'use client';

import DottedMapMod from 'dotted-map';
import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';


interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}


// Work around CJS/ESM interop in some bundlers
const DottedMap = (DottedMapMod as any).default ?? DottedMapMod;

const readColor = (name: string, fallback: string) => {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return v ? `hsl(${v})` : fallback;
};

export default function WorldMap({
  dots = [],
  lineColor = '#b3adcc',
}: MapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mounted, setMounted] = useState(false);
  const [svgDataUrl, setSvgDataUrl] = useState<string>('');

  // SSR guard
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;

    const docEl = document.documentElement;

    const rebuild = () => {
      // DARK must be exact
      const isDark = docEl.classList.contains('dark');
      const bg = isDark ? '#050505' : readColor('--obsidian', '#FAFAFA');
      const dot = isDark ? '#24222D' : readColor('--ebony', '#C8C3D7');

      // wait a frame so the class change + CSS vars are applied
      requestAnimationFrame(() => {
        const map = new DottedMap({ height: 100, grid: 'diagonal' });
        const svg = map.getSVG({
          radius: 0.22,
          color: dot,
          shape: 'circle',
          backgroundColor: bg,
        });
        setSvgDataUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
      });
    };

    // initial build
    rebuild();

    // react to theme toggles by observing class changes on <html>
    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        if (m.attributeName === 'class') {
          rebuild();
          break;
        }
      }
    });
    mo.observe(docEl, { attributes: true, attributeFilter: ['class'] });

    // also react if another tab changes localStorage('theme')
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'theme') rebuild();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      mo.disconnect();
      window.removeEventListener('storage', onStorage);
    };
  }, [mounted]);

  if (!mounted) return null;

  const project = (lat: number, lng: number) => ({
    x: (lng + 180) * (800 / 360),
    y: (90 - lat) * (400 / 180),
  });

  const curve = (s: { x: number; y: number }, e: { x: number; y: number }) => {
    const mx = (s.x + e.x) / 2;
    const my = Math.min(s.y, e.y) - 50;
    return `M ${s.x} ${s.y} Q ${mx} ${my} ${e.x} ${e.y}`;
  };

  return (
    <div className="bg-obsidian relative h-full w-[200%] overflow-hidden font-sans lg:aspect-[2/1] lg:h-auto lg:w-full">
      {svgDataUrl && (
        <img
          src={svgDataUrl}
          alt="world map"
          width={1056}
          height={495}
          draggable={false}
          className="pointer-events-none h-full w-auto select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] lg:w-full"
        />
      )}

      <svg
        ref={svgRef}
        viewBox="0 0 800 400"
        className="pointer-events-none absolute inset-0 h-full w-auto select-none lg:w-full"
      >
        {dots.map((d, i) => {
          const s = project(d.start.lat, d.start.lng);
          const e = project(d.end.lat, d.end.lng);
          return (
            <g key={`path-${i}`}>
              <motion.path
                d={curve(s, e)}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 * i, ease: 'easeOut' }}
              />
            </g>
          );
        })}

        <defs>
          <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>

        {dots.map((d, i) => {
          const s = project(d.start.lat, d.start.lng);
          const e = project(d.end.lat, d.end.lng);
          return (
            <g key={`pts-${i}`}>
              {[s, e].map((p, j) => (
                <g key={j}>
                  <circle cx={p.x} cy={p.y} r="2" fill={lineColor} />
                  <circle cx={p.x} cy={p.y} r="2" fill={lineColor} opacity="0.5">
                    <animate attributeName="r" from="2" to="8" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                  </circle>
                </g>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
