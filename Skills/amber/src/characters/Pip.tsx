import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS } from '../constants/colors';

interface PipProps {
  x: number;
  y: number;
  scale?: number;
  bouncing?: boolean;
}

export const Pip: React.FC<PipProps> = ({ x, y, scale = 1, bouncing = true }) => {
  const frame = useCurrentFrame();

  const bounceY = bouncing ? Math.abs(Math.sin(frame * 0.15)) * -25 : 0;
  const squashX = bouncing ? 1 + Math.max(0, Math.sin(frame * 0.15)) * 0.15 : 1;
  const squashY = bouncing ? 1 - Math.max(0, Math.sin(frame * 0.15)) * 0.1 : 1;

  return (
    <g transform={`translate(${x}, ${y + bounceY}) scale(${scale})`}>
      <ellipse cx="0" cy="25" rx={10 * squashX} ry="4" fill="rgba(0,0,0,0.08)" />
      <ellipse cx="-6" cy="20" rx="4" ry="3" fill={COLORS.pipDark} />
      <ellipse cx="6" cy="20" rx="4" ry="3" fill={COLORS.pipDark} />
      <ellipse cx="0" cy="0" rx={18 * squashX} ry={18 * squashY} fill={COLORS.pip} />
      <defs>
        <radialGradient id="pipSheen" cx="35%" cy="30%" r="55%">
          <stop offset="0%" stopColor={COLORS.pipLight} stopOpacity="0.7" />
          <stop offset="100%" stopColor={COLORS.pip} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="0" cy="0" rx={18 * squashX} ry={18 * squashY} fill="url(#pipSheen)" />
      <ellipse cx="-6" cy="-3" rx="5" ry="6" fill={COLORS.white} />
      <ellipse cx="6" cy="-3" rx="5" ry="6" fill={COLORS.white} />
      <circle cx="-5" cy="-3" r="3.5" fill={COLORS.black} />
      <circle cx="7" cy="-3" r="3.5" fill={COLORS.black} />
      <circle cx="-6" cy="-5" r="1.5" fill={COLORS.white} />
      <circle cx="6" cy="-5" r="1.5" fill={COLORS.white} />
    </g>
  );
};
