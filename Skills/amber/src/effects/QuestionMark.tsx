import React from 'react';
import { useCurrentFrame, spring, interpolate, useVideoConfig } from 'remotion';
import { COLORS } from '../constants/colors';

interface QuestionMarkProps {
  x: number;
  y: number;
  startFrame: number;
  durationFrames?: number;
}

export const QuestionMark: React.FC<QuestionMarkProps> = ({
  x, y, startFrame, durationFrames = 60,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - startFrame;

  if (rel < 0 || rel > durationFrames) return null;

  const pop = spring({ frame: rel, fps, config: { damping: 8, stiffness: 200 } });
  const fade = interpolate(rel, [durationFrames - 15, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wobble = Math.sin(rel * 0.3) * 5;

  return (
    <g
      transform={`translate(${x}, ${y - 40 * pop}) scale(${pop}) rotate(${wobble})`}
      opacity={fade}
    >
      <circle cx="0" cy="0" r="22" fill={COLORS.flicker} opacity="0.9" />
      <text
        x="0" y="8" textAnchor="middle" fontSize="30" fontWeight="900"
        fontFamily="Nunito, sans-serif" fill={COLORS.white}
      >
        ?
      </text>
    </g>
  );
};
