import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS } from '../constants/colors';

interface MomoProps {
  x: number;
  y: number;
  scale?: number;
}

export const Momo: React.FC<MomoProps> = ({ x, y, scale = 1 }) => {
  const frame = useCurrentFrame();
  const breathe = Math.sin(frame * 0.04) * 2;

  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      <ellipse cx="0" cy="30" rx="55" ry="6" fill="rgba(0,0,0,0.08)" />
      <ellipse cx="-20" cy="26" rx="6" ry="4" fill={COLORS.momoDark} />
      <ellipse cx="20" cy="26" rx="6" ry="4" fill={COLORS.momoDark} />
      <ellipse cx="0" cy="0" rx={50 + breathe} ry={28 - breathe * 0.5} fill={COLORS.momo} />
      <defs>
        <radialGradient id="momoSheen" cx="35%" cy="25%" r="60%">
          <stop offset="0%" stopColor={COLORS.momoLight} stopOpacity="0.5" />
          <stop offset="100%" stopColor={COLORS.momo} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx={50 + breathe} ry={28 - breathe * 0.5} fill="url(#momoSheen)" />
      <ellipse cx="-14" cy="-6" rx="6" ry="3" fill={COLORS.white} />
      <ellipse cx="14" cy="-6" rx="6" ry="3" fill={COLORS.white} />
      <ellipse cx="-14" cy="-5" rx="3" ry="2" fill={COLORS.black} />
      <ellipse cx="14" cy="-5" rx="3" ry="2" fill={COLORS.black} />
    </g>
  );
};
