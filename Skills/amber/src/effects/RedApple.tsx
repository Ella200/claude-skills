import React from 'react';
import { COLORS } from '../constants/colors';

interface RedAppleProps {
  x: number;
  y: number;
  scale?: number;
  rotation?: number;
}

export const RedApple: React.FC<RedAppleProps> = ({ x, y, scale = 1, rotation = 0 }) => {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale}) rotate(${rotation})`}>
      {/* Apple body */}
      <circle cx="0" cy="0" r="20" fill={COLORS.red} />
      {/* Sheen */}
      <circle cx="-5" cy="-6" r="5" fill={COLORS.redLight} opacity="0.4" />
      {/* Stem */}
      <line x1="0" y1="-20" x2="3" y2="-28" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
      {/* Leaf */}
      <ellipse cx="8" cy="-24" rx="7" ry="4" fill="#4CAF50" transform="rotate(30, 8, -24)" />
    </g>
  );
};
