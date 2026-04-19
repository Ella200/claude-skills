import React from 'react';
import { ZuzuImproved } from './characters/ZuzuImproved';
import { COLORS } from './constants/colors';

const STATES = [
  { state: 'idle'        as const, label: 'idle',        x: 210  },
  { state: 'walking'     as const, label: 'walking →',   x: 490  },
  { state: 'running'     as const, label: 'running →',   x: 770  },
  { state: 'celebrating' as const, label: 'celebrating', x: 1050 },
  { state: 'thinking'    as const, label: 'thinking',    x: 1330 },
  { state: 'sleeping'    as const, label: 'sleeping',    x: 1570 },
  { state: 'scared'      as const, label: 'scared',      x: 1760 },
];

export const ZuzuStateTest: React.FC = () => {
  return (
    <div style={{ width: '100%', height: '100%', background: COLORS.sky }}>
      <svg width="1920" height="1080" viewBox="0 0 1920 1080">

        {/* Sky gradient */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#5bb8d4" />
            <stop offset="100%" stopColor={COLORS.skyHorizon} />
          </linearGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#skyGrad)" />

        {/* Ground */}
        <rect x="0" y="820" width="1920" height="260" fill={COLORS.grassFront} />
        <rect x="0" y="820" width="1920" height="20"  fill={COLORS.grassMid} />

        {/* Title */}
        <text
          x="960" y="60"
          textAnchor="middle"
          fontSize="40"
          fill={COLORS.white}
          fontFamily="sans-serif"
          fontWeight="bold"
          opacity="0.85"
        >
          ZuzuImproved — All States
        </text>

        {/* Characters */}
        {STATES.map(({ state, label, x }) => (
          <g key={state}>
            <ZuzuImproved
              state={state}
              x={x}
              y={740}
              scale={state === 'scared' ? 1.6 : 1.8}
              direction="right"
            />
            {/* Label */}
            <text
              x={x}
              y={870}
              textAnchor="middle"
              fontSize="28"
              fill={COLORS.white}
              fontFamily="sans-serif"
              fontWeight="bold"
              opacity="0.9"
            >
              {label}
            </text>
          </g>
        ))}

      </svg>
    </div>
  );
};
