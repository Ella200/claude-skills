import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS } from '../constants/colors';

interface FlickerProps {
  x: number;
  y: number;
  scale?: number;
  visible?: boolean;
}

export const Flicker: React.FC<FlickerProps> = ({ x, y, scale = 1, visible = true }) => {
  const frame = useCurrentFrame();
  if (!visible) return null;

  const float = Math.sin(frame * 0.08) * 10;
  const wingFlap = Math.sin(frame * 0.3) * 25;
  const glowPulse = 0.3 + Math.sin(frame * 0.1) * 0.15;

  return (
    <g transform={`translate(${x}, ${y + float}) scale(${scale})`}>
      <circle cx="0" cy="0" r={20 + Math.sin(frame * 0.08) * 8}
        fill={COLORS.flicker} opacity={glowPulse * 0.3} />
      <circle cx="0" cy="0" r="12" fill={COLORS.flickerGlow} opacity={glowPulse * 0.4} />
      <g transform={`rotate(${wingFlap})`} style={{ transformOrigin: '0 0' }}>
        <ellipse cx="-12" cy="-4" rx="8" ry="14"
          fill={COLORS.flicker} opacity="0.5" transform="rotate(-20)" />
      </g>
      <g transform={`rotate(${-wingFlap})`} style={{ transformOrigin: '0 0' }}>
        <ellipse cx="12" cy="-4" rx="8" ry="14"
          fill={COLORS.flicker} opacity="0.5" transform="rotate(20)" />
      </g>
      <circle cx="0" cy="0" r="6" fill={COLORS.flicker} />
      <circle cx="-1.5" cy="-1.5" r="2" fill={COLORS.white} opacity="0.7" />
    </g>
  );
};
