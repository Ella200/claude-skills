import React from 'react';
import { useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { COLORS } from '../constants/colors';

interface StarsProps {
  x: number;
  y: number;
  startFrame: number;
  durationFrames?: number;
}

export const Stars: React.FC<StarsProps> = ({
  x, y, startFrame, durationFrames = 45,
}) => {
  const frame = useCurrentFrame();
  const rel = frame - startFrame;

  if (rel < 0 || rel > durationFrames) return null;

  const fade = interpolate(rel, [durationFrames - 15, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const starCount = 5;
  const stars = Array.from({ length: starCount }, (_, i) => {
    const angle = (i / starCount) * Math.PI * 2 + rel * 0.08;
    const radius = 25 + rel * 0.8;
    const sx = Math.cos(angle) * radius;
    const sy = Math.sin(angle) * radius;
    const size = 6 - rel * 0.08;
    return { sx, sy, size: Math.max(size, 1) };
  });

  return (
    <g transform={`translate(${x}, ${y})`} opacity={fade}>
      {stars.map((s, i) => (
        <g key={i} transform={`translate(${s.sx}, ${s.sy})`}>
          {/* 4-point star shape */}
          <polygon
            points={`0,${-s.size} ${s.size * 0.3},${-s.size * 0.3} ${s.size},0 ${s.size * 0.3},${s.size * 0.3} 0,${s.size} ${-s.size * 0.3},${s.size * 0.3} ${-s.size},0 ${-s.size * 0.3},${-s.size * 0.3}`}
            fill={COLORS.flicker}
          />
        </g>
      ))}
    </g>
  );
};
