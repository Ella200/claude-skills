import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { COLORS } from '../constants/colors';

export type Expression =
  | 'neutral'
  | 'curious'
  | 'surprised'
  | 'happy'
  | 'confused'
  | 'proud'
  | 'sleepy';

interface ZuzuProps {
  x: number;
  y: number;
  scale?: number;
  expression?: Expression;
  antennaGlow?: boolean;
  dancing?: boolean;
  walking?: boolean;
  squash?: number;
}

const EYE_CONFIG: Record<
  Expression,
  { pupilScale: number; pupilOffsetX: number; pupilOffsetY: number }
> = {
  neutral: { pupilScale: 1, pupilOffsetX: 0, pupilOffsetY: 0 },
  curious: { pupilScale: 1.1, pupilOffsetX: 3, pupilOffsetY: -2 },
  surprised: { pupilScale: 0.6, pupilOffsetX: 0, pupilOffsetY: -2 },
  happy: { pupilScale: 1, pupilOffsetX: 0, pupilOffsetY: 1 },
  confused: { pupilScale: 0.9, pupilOffsetX: -3, pupilOffsetY: 0 },
  proud: { pupilScale: 1.15, pupilOffsetX: 0, pupilOffsetY: 0 },
  sleepy: { pupilScale: 1, pupilOffsetX: 0, pupilOffsetY: 2 },
};

export const Zuzu: React.FC<ZuzuProps> = ({
  x,
  y,
  scale = 1,
  expression = 'neutral',
  antennaGlow = false,
  dancing = false,
  walking = false,
  squash = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Idle breathing
  const idleBounce = Math.sin(frame * 0.08) * 2;

  // Dance
  const danceBounce = dancing ? Math.sin(frame * 0.3) * 8 : 0;
  const danceTilt = dancing ? Math.sin(frame * 0.25) * 10 : 0;

  // Walk
  const walkBounce = walking ? Math.sin(frame * 0.2) * 3 : 0;

  // Squash & stretch
  const scaleX = 1 + squash * 0.3;
  const scaleY = 1 - squash * 0.2;

  // Antenna follow-through (3 frame delay)
  const antennaBob = Math.sin((frame - 3) * 0.12) * 5;

  // Tail wag
  const tailWag =
    Math.sin(frame * 0.2) *
    (dancing ? 20 : expression === 'happy' ? 12 : 6);

  // Blink cycle
  const blinkCycle = frame % Math.round(fps * 3.5);
  const isBlinking = blinkCycle < 4;

  const ec = EYE_CONFIG[expression];
  const isSleepy = expression === 'sleepy';
  const isHappy =
    expression === 'happy' || expression === 'proud' || dancing;
  const isSurprised = expression === 'surprised';

  // Arms
  const leftArmAngle = dancing
    ? Math.sin(frame * 0.3 + 1) * 40 - 10
    : walking
    ? Math.sin(frame * 0.2) * 15 - 5
    : -10;
  const rightArmAngle = dancing
    ? Math.sin(frame * 0.3 + 2) * 40 + 10
    : walking
    ? Math.sin(frame * 0.2 + Math.PI) * 15 + 5
    : 10;

  // Legs
  const leftLegAngle = dancing
    ? Math.sin(frame * 0.3) * 15
    : walking
    ? Math.sin(frame * 0.2) * 20
    : 0;
  const rightLegAngle = dancing
    ? Math.sin(frame * 0.3 + Math.PI) * 15
    : walking
    ? Math.sin(frame * 0.2 + Math.PI) * 20
    : 0;

  const totalBounce = idleBounce + danceBounce + walkBounce;

  return (
    <g
      transform={`translate(${x}, ${y + totalBounce}) scale(${scale}) rotate(${danceTilt})`}
    >
      {/* Shadow */}
      <ellipse cx="0" cy="65" rx={32} ry="6" fill="rgba(0,0,0,0.1)" />

      {/* Tail */}
      <g transform={`translate(-28, 15) rotate(${tailWag})`}>
        <path
          d="M 0 0 Q -8 -12 -4 -20 Q 0 -28 4 -22 Q 6 -16 2 -8 Z"
          fill={COLORS.zuzuDark}
        />
      </g>

      {/* Left Leg */}
      <g transform={`translate(-14, 48) rotate(${leftLegAngle})`}>
        <rect x="-5" y="0" width="10" height="18" rx="5" fill={COLORS.zuzuDark} />
        <ellipse cx="0" cy="18" rx="7" ry="4" fill={COLORS.zuzuDark} />
      </g>

      {/* Right Leg */}
      <g transform={`translate(14, 48) rotate(${rightLegAngle})`}>
        <rect x="-5" y="0" width="10" height="18" rx="5" fill={COLORS.zuzuDark} />
        <ellipse cx="0" cy="18" rx="7" ry="4" fill={COLORS.zuzuDark} />
      </g>

      {/* Left Arm */}
      <g transform={`translate(-32, 5) rotate(${leftArmAngle})`}>
        <rect x="-4" y="0" width="8" height="20" rx="4" fill={COLORS.zuzuDark} />
        <circle cx="0" cy="20" r="5" fill={COLORS.zuzuDark} />
      </g>

      {/* Right Arm */}
      <g transform={`translate(32, 5) rotate(${rightArmAngle})`}>
        <rect x="-4" y="0" width="8" height="20" rx="4" fill={COLORS.zuzuDark} />
        <circle cx="0" cy="20" r="5" fill={COLORS.zuzuDark} />
      </g>

      {/* Body */}
      <g transform={`scale(${scaleX}, ${scaleY})`}>
        <circle cx="0" cy="0" r="35" fill={COLORS.zuzu} />
        <defs>
          <radialGradient id="zuzuSheen" cx="35%" cy="30%" r="60%">
            <stop offset="0%" stopColor={COLORS.zuzuLight} stopOpacity="0.7" />
            <stop offset="100%" stopColor={COLORS.zuzu} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="0" cy="0" r="35" fill="url(#zuzuSheen)" />
      </g>

      {/* Antenna */}
      <g
        transform={`translate(0, -35) rotate(${antennaBob})`}
        style={{ transformOrigin: '0px 0px' }}
      >
        <line
          x1="0" y1="0" x2="0" y2="-22"
          stroke={COLORS.zuzuDark} strokeWidth="3" strokeLinecap="round"
        />
        {antennaGlow && (
          <>
            <circle
              cx="0" cy="-22"
              r={14 + Math.sin(frame * 0.15) * 6}
              fill={COLORS.flicker}
              opacity={0.15 + Math.sin(frame * 0.1) * 0.1}
            />
            <circle
              cx="0" cy="-22"
              r={9 + Math.sin(frame * 0.2) * 4}
              fill={COLORS.flicker}
              opacity={0.25 + Math.sin(frame * 0.15) * 0.1}
            />
          </>
        )}
        <circle
          cx="0" cy="-22" r="6"
          fill={antennaGlow ? COLORS.flicker : COLORS.zuzuLight}
        />
        {antennaGlow && (
          <circle cx="-2" cy="-24" r="2" fill={COLORS.white} opacity="0.8" />
        )}
      </g>

      {/* Left Eye */}
      <g transform="translate(-12, -6)">
        <ellipse
          cx="0" cy="0" rx="10"
          ry={isBlinking ? 1.5 : isSleepy ? 5 : 12}
          fill={COLORS.white}
        />
        {!isBlinking && (
          <>
            <ellipse
              cx={ec.pupilOffsetX} cy={ec.pupilOffsetY}
              rx={6 * ec.pupilScale}
              ry={isSleepy ? 4 : 7 * ec.pupilScale}
              fill={COLORS.black}
            />
            <circle
              cx={ec.pupilOffsetX - 2} cy={ec.pupilOffsetY - 3}
              r="2.5" fill={COLORS.white}
            />
            <circle
              cx={ec.pupilOffsetX + 1.5} cy={ec.pupilOffsetY - 1}
              r="1.2" fill={COLORS.white}
            />
          </>
        )}
      </g>

      {/* Right Eye */}
      <g transform="translate(12, -6)">
        <ellipse
          cx="0" cy="0" rx="10"
          ry={isBlinking ? 1.5 : isSleepy ? 5 : 12}
          fill={COLORS.white}
        />
        {!isBlinking && (
          <>
            <ellipse
              cx={ec.pupilOffsetX} cy={ec.pupilOffsetY}
              rx={6 * ec.pupilScale}
              ry={isSleepy ? 4 : 7 * ec.pupilScale}
              fill={COLORS.black}
            />
            <circle
              cx={ec.pupilOffsetX - 2} cy={ec.pupilOffsetY - 3}
              r="2.5" fill={COLORS.white}
            />
            <circle
              cx={ec.pupilOffsetX + 1.5} cy={ec.pupilOffsetY - 1}
              r="1.2" fill={COLORS.white}
            />
          </>
        )}
      </g>

      {/* Blush cheeks */}
      {isHappy && (
        <>
          <ellipse cx="-22" cy="8" rx="6" ry="4" fill="#FF6B6B" opacity="0.3" />
          <ellipse cx="22" cy="8" rx="6" ry="4" fill="#FF6B6B" opacity="0.3" />
        </>
      )}

      {/* Mouth — expression only */}
      {isHappy && (
        <path
          d="M -8 14 Q 0 24 8 14"
          stroke={COLORS.zuzuDark} strokeWidth="2.5" fill="none" strokeLinecap="round"
        />
      )}
      {isSurprised && (
        <ellipse cx="0" cy="16" rx="5" ry="7" fill={COLORS.zuzuDark} />
      )}
      {expression === 'confused' && (
        <path
          d="M -6 15 Q -2 13 2 15 Q 5 17 8 14"
          stroke={COLORS.zuzuDark} strokeWidth="2" fill="none" strokeLinecap="round"
        />
      )}
    </g>
  );
};
