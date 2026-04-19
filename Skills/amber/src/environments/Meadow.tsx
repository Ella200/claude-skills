import React from 'react';
import { useCurrentFrame } from 'remotion';
import { COLORS, VIDEO } from '../constants/colors';

interface MeadowProps {
  children?: React.ReactNode;
  showAppleOnTree?: boolean;
}

export const Meadow: React.FC<MeadowProps> = ({ children, showAppleOnTree = false }) => {
  const frame = useCurrentFrame();
  const cloudX1 = (frame * 0.5) % (VIDEO.WIDTH + 200) - 200;
  const cloudX2 = (frame * 0.3 + 600) % (VIDEO.WIDTH + 200) - 200;

  return (
    <svg
      viewBox={`0 0 ${VIDEO.WIDTH} ${VIDEO.HEIGHT}`}
      style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={COLORS.sky} />
          <stop offset="100%" stopColor={COLORS.skyHorizon} />
        </linearGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={VIDEO.WIDTH} height={VIDEO.HEIGHT} fill="url(#skyGrad)" />

      {/* Sun */}
      <circle cx="1500" cy="150" r="80" fill="#FFE57F" opacity="0.8" />
      <circle cx="1500" cy="150" r="120" fill="#FFE57F" opacity="0.12" />

      {/* Clouds */}
      <g transform={`translate(${cloudX1}, 120)`} opacity="0.8">
        <ellipse cx="0" cy="0" rx="80" ry="28" fill={COLORS.white} />
        <ellipse cx="-40" cy="10" rx="50" ry="20" fill={COLORS.white} />
        <ellipse cx="40" cy="6" rx="60" ry="24" fill={COLORS.white} />
      </g>
      <g transform={`translate(${cloudX2}, 220)`} opacity="0.6">
        <ellipse cx="0" cy="0" rx="70" ry="22" fill={COLORS.white} />
        <ellipse cx="36" cy="8" rx="44" ry="18" fill={COLORS.white} />
      </g>

      {/* Back hills */}
      <ellipse cx="400" cy="640" rx="600" ry="160" fill={COLORS.grassBack} />
      <ellipse cx="1200" cy="660" rx="700" ry="180" fill={COLORS.grassBack} />

      {/* Mid hills */}
      <ellipse cx="200" cy="720" rx="500" ry="140" fill={COLORS.grassMid} />
      <ellipse cx="1000" cy="700" rx="800" ry="160" fill={COLORS.grassMid} />

      {/* Front ground */}
      <ellipse cx="960" cy="960" rx="1100" ry="340" fill={COLORS.grassFront} />

      {/* Pond */}
      <ellipse cx="1400" cy="760" rx="140" ry="50" fill={COLORS.pond} opacity="0.7" />
      <ellipse cx="1400" cy="755" rx="100" ry="24" fill={COLORS.white} opacity="0.08" />

      {/* Tree trunk */}
      <rect x="330" y="480" width="36" height="220" rx="8" fill={COLORS.treeTrunk} />
      <rect x="340" y="480" width="12" height="220" rx="4" fill="#9E7E57" opacity="0.4" />

      {/* Tree canopy */}
      <circle cx="350" cy="440" r="110" fill={COLORS.treeCanopy} />
      <circle cx="310" cy="460" r="70" fill={COLORS.treeCanopy} />
      <circle cx="400" cy="470" r="60" fill={COLORS.treeCanopy} />
      <circle cx="350" cy="410" r="60" fill="#5A9F4A" opacity="0.5" />

      {/* Apple on tree */}
      {showAppleOnTree && (
        <g transform="translate(410, 420)">
          <circle cx="0" cy="0" r="12" fill={COLORS.red} />
          <line x1="0" y1="-12" x2="2" y2="-18" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
          <ellipse cx="5" cy="-14" rx="5" ry="3" fill="#4CAF50" transform="rotate(30, 5, -14)" />
        </g>
      )}

      {/* Flowers — NO RED */}
      <circle cx="640" cy="820" r="8" fill="#B39DDB" />
      <circle cx="640" cy="820" r="3" fill={COLORS.flicker} />
      <circle cx="960" cy="850" r="7" fill={COLORS.flicker} />
      <circle cx="960" cy="850" r="2.5" fill={COLORS.white} />
      <circle cx="240" cy="810" r="8" fill={COLORS.pip} />
      <circle cx="240" cy="810" r="3" fill={COLORS.white} />
      <circle cx="1600" cy="830" r="6" fill="#B39DDB" />
      <circle cx="1600" cy="830" r="2" fill={COLORS.flicker} />
      <circle cx="760" cy="870" r="7" fill={COLORS.pip} />
      <circle cx="760" cy="870" r="2.5" fill={COLORS.white} />

      {/* Rocks */}
      <ellipse cx="540" cy="850" rx="16" ry="10" fill="#A0A0A0" opacity="0.4" />
      <ellipse cx="1100" cy="870" rx="12" ry="8" fill="#B0B0B0" opacity="0.3" />

      {/* Warm golden overlay */}
      <rect x="0" y="0" width={VIDEO.WIDTH} height={VIDEO.HEIGHT} fill="#FFD700" opacity="0.04" />

      {children}
    </svg>
  );
};
