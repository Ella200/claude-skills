import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';

interface SparkleTextProps {
  text: string;
  color: string;
  x: number;
  y: number;
  startFrame: number;
  fontSize?: number;
}

export const SparkleText: React.FC<SparkleTextProps> = ({
  text, color, x, y, startFrame, fontSize = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rel = frame - startFrame;

  if (rel < 0) return null;

  const pop = spring({ frame: rel, fps, config: { damping: 6, stiffness: 150 } });
  const wobble = rel < 30 ? Math.sin(rel * 0.5) * 3 : 0;

  return (
    <g transform={`translate(${x}, ${y}) scale(${pop}) rotate(${wobble})`}>
      <text
        x="0" y="0" textAnchor="middle" dominantBaseline="central"
        fontSize={fontSize} fontWeight="900" fontFamily="Nunito, sans-serif"
        fill={color} opacity="0.3"
      >
        {text}
      </text>
      <text
        x="0" y="0" textAnchor="middle" dominantBaseline="central"
        fontSize={fontSize} fontWeight="900" fontFamily="Nunito, sans-serif"
        fill={color} stroke="white" strokeWidth="4" paintOrder="stroke"
      >
        {text}
      </text>
    </g>
  );
};
