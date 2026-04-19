import React, { useMemo } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

interface ConfettiProps {
  startFrame: number;
  durationFrames?: number;
  colors?: string[];
  particleCount?: number;
}

export const Confetti: React.FC<ConfettiProps> = ({
  startFrame,
  durationFrames = 90,
  particleCount = 50,
  colors = ['#FF8C42', '#5BC0EB', '#FFD700', '#FF6B6B', '#9B89B3', '#7EC850'],
}) => {
  const frame = useCurrentFrame();
  const rel = frame - startFrame;

  const particles = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => ({
        x: Math.random() * 1920,
        speed: 2 + Math.random() * 4,
        wobbleSpeed: 0.05 + Math.random() * 0.1,
        wobbleAmount: 20 + Math.random() * 40,
        size: 6 + Math.random() * 10,
        color: colors[i % colors.length],
        rotation: Math.random() * 360,
        rotSpeed: 2 + Math.random() * 6,
        delay: Math.random() * 15,
      })),
    []
  );

  if (rel < 0 || rel > durationFrames) return null;

  const fade = interpolate(rel, [durationFrames - 20, durationFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <g opacity={fade}>
      {particles.map((p, i) => {
        const t = Math.max(0, rel - p.delay);
        const py = -50 + t * p.speed;
        const px = p.x + Math.sin(t * p.wobbleSpeed) * p.wobbleAmount;
        const rot = p.rotation + t * p.rotSpeed;
        if (py > 1100) return null;
        return (
          <rect
            key={i} x={px} y={py}
            width={p.size} height={p.size * 0.6} rx="2"
            fill={p.color}
            transform={`rotate(${rot}, ${px}, ${py})`}
          />
        );
      })}
    </g>
  );
};
