import React from 'react';
import { useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { COLORS } from '../constants/colors';

export type ZuzuState =
  | 'idle'
  | 'walking'
  | 'celebrating'
  | 'thinking'
  | 'sleeping'
  | 'running'
  | 'scared';

export type Direction = 'left' | 'right';

export type Expression =
  | 'neutral'
  | 'curious'
  | 'surprised'
  | 'happy'
  | 'confused'
  | 'proud'
  | 'sleepy';

interface ZuzuImprovedProps {
  x: number;
  y: number;
  scale?: number;
  state?: ZuzuState;
  direction?: Direction;
  antennaGlow?: boolean;
  expression?: Expression;
}

const EYE_CONFIG: Record<
  Expression,
  { pupilScale: number; pupilOffsetX: number; pupilOffsetY: number }
> = {
  neutral:   { pupilScale: 1,    pupilOffsetX: 0,  pupilOffsetY: 0  },
  curious:   { pupilScale: 1.1,  pupilOffsetX: 3,  pupilOffsetY: -2 },
  surprised: { pupilScale: 0.6,  pupilOffsetX: 0,  pupilOffsetY: -2 },
  happy:     { pupilScale: 1,    pupilOffsetX: 0,  pupilOffsetY: 1  },
  confused:  { pupilScale: 0.9,  pupilOffsetX: -3, pupilOffsetY: 0  },
  proud:     { pupilScale: 1.15, pupilOffsetX: 0,  pupilOffsetY: 0  },
  sleepy:    { pupilScale: 1,    pupilOffsetX: 0,  pupilOffsetY: 2  },
};

const STATE_EXPRESSION: Record<ZuzuState, Expression> = {
  idle:        'neutral',
  walking:     'curious',
  celebrating: 'happy',
  thinking:    'confused',
  sleeping:    'sleepy',
  running:     'curious',
  scared:      'surprised',
};

export const ZuzuImproved: React.FC<ZuzuImprovedProps> = ({
  x,
  y,
  scale = 1,
  state = 'idle',
  direction = 'right',
  antennaGlow,
  expression,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isWalking     = state === 'walking';
  const isCelebrating = state === 'celebrating';
  const isThinking    = state === 'thinking';
  const isSleeping    = state === 'sleeping';
  const isRunning     = state === 'running';
  const isScared      = state === 'scared';

  const glowAntenna = antennaGlow ?? isCelebrating;

  // Resolve expression
  const expr = expression ?? STATE_EXPRESSION[state];

  // ── Bounce / motion ─────────────────────────────────────────────────────────
  const idleBounce      = Math.sin(frame * 0.08) * 2;
  const walkBounce      = isWalking     ? Math.sin(frame * 0.2)  * 3  : 0;
  const runBounce       = isRunning     ? Math.sin(frame * 0.45) * 5  : 0;
  const celebrateBounce = isCelebrating ? Math.sin(frame * 0.3)  * 8  : 0;
  const sleepBounce     = isSleeping    ? Math.sin(frame * 0.04) * 1.5 : 0; // very slow
  // Scared: rapid trembling
  const scaredShake     = isScared      ? Math.sin(frame * 1.2)  * 4  : 0;

  const totalBounce =
    idleBounce + walkBounce + runBounce + celebrateBounce + sleepBounce + scaredShake;

  // Tilt
  const celebrateTilt = isCelebrating ? Math.sin(frame * 0.25) * 10 : 0;
  const thinkTilt     = isThinking    ? -8 : 0; // constant head tilt
  const runLean       = isRunning     ? -15 : 0; // lean forward when running
  const scaredTilt    = isScared      ? Math.sin(frame * 1.1) * 3 : 0;
  const totalTilt     = celebrateTilt + thinkTilt + runLean + scaredTilt;

  // Scared crouching — compress body
  const scaredSquash = isScared ? 0.85 : 1;
  const scaredSquashY = isScared ? 1.15 : 1;

  // ── Antenna ─────────────────────────────────────────────────────────────────
  const antennaBob = isSleeping
    ? Math.sin(frame * 0.04) * 2   // barely moves while sleeping
    : Math.sin((frame - 3) * 0.12) * 5;

  // ── Tail ────────────────────────────────────────────────────────────────────
  const tailWag = Math.sin(frame * (isRunning ? 0.5 : 0.2)) * (
    isCelebrating ? 20 : isRunning ? 15 : expr === 'happy' ? 12 : 6
  );

  // ── Blink ───────────────────────────────────────────────────────────────────
  const blinkCycle = frame % Math.round(fps * 3.5);
  const isBlinking = !isSleeping && blinkCycle < 4;
  // Sleeping: eyes always closed
  const eyesClosed = isSleeping;

  // ── Arms ────────────────────────────────────────────────────────────────────
  const leftArmAngle = isCelebrating
    ? Math.sin(frame * 0.3 + 1) * 40 - 10
    : isRunning
    ? Math.sin(frame * 0.45 + 1) * 55 - 10   // big fast swing
    : isWalking
    ? Math.sin(frame * 0.2) * 15 - 5
    : isThinking
    ? 35   // one arm up, touching chin
    : isScared
    ? Math.sin(frame * 1.1) * 20 - 30         // arms up and shaking
    : isSleeping
    ? 25   // arms relaxed down
    : -10;

  const rightArmAngle = isCelebrating
    ? Math.sin(frame * 0.3 + 2) * 40 + 10
    : isRunning
    ? Math.sin(frame * 0.45 + 2) * 55 + 10
    : isWalking
    ? Math.sin(frame * 0.2 + Math.PI) * 15 + 5
    : isThinking
    ? -10
    : isScared
    ? Math.sin(frame * 1.1 + 1) * 20 + 30
    : isSleeping
    ? -25
    : 10;

  // ── Legs ────────────────────────────────────────────────────────────────────
  const leftLegAngle = isCelebrating
    ? Math.sin(frame * 0.3) * 15
    : isRunning
    ? Math.sin(frame * 0.45) * 35             // wide fast stride
    : isWalking
    ? Math.sin(frame * 0.2) * 20
    : isScared
    ? Math.sin(frame * 1.1) * 8              // legs trembling
    : 0;

  const rightLegAngle = isCelebrating
    ? Math.sin(frame * 0.3 + Math.PI) * 15
    : isRunning
    ? Math.sin(frame * 0.45 + Math.PI) * 35
    : isWalking
    ? Math.sin(frame * 0.2 + Math.PI) * 20
    : isScared
    ? Math.sin(frame * 1.1 + 1) * 8
    : 0;

  // ── Eye / face config ────────────────────────────────────────────────────────
  const ec          = EYE_CONFIG[expr];
  const isSleepy    = expr === 'sleepy' || isSleeping;
  const isHappy     = expr === 'happy' || expr === 'proud' || isCelebrating;
  const isSurprised = expr === 'surprised';

  // ── Zzz offset (sleeping) ────────────────────────────────────────────────────
  const zzzPhase  = (frame * 0.6) % (fps * 3);
  const zzzOpacity = interpolate(zzzPhase, [0, fps * 0.5, fps * 2, fps * 3], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const zzzY      = interpolate(zzzPhase, [0, fps * 3], [0, -40], { extrapolateRight: 'clamp' });

  // Thinking: floating dots cycle
  const dotFrame   = frame % (fps * 2);
  const dot1Opacity = interpolate(dotFrame, [0, 8, fps * 0.8, fps * 0.9], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const dot2Opacity = interpolate(dotFrame, [8, 16, fps * 0.9, fps * 1.0], [0, 1, 1, 0], { extrapolateRight: 'clamp' });
  const dot3Opacity = interpolate(dotFrame, [16, 24, fps * 1.0, fps * 1.1], [0, 1, 1, 0], { extrapolateRight: 'clamp' });

  // Running: motion lines
  const runLineOpacity = isRunning ? 0.4 + Math.sin(frame * 0.4) * 0.2 : 0;

  // ── Direction flip ─────────────────────────────────────────────────────────
  const flipScale = direction === 'left' ? -1 : 1;

  return (
    <g transform={`translate(${x}, ${y + totalBounce}) rotate(${totalTilt})`}>
      <g transform={`scale(${flipScale * scale * scaredSquash}, ${scale * scaredSquashY})`}>

        {/* Motion lines (running) */}
        {isRunning && (
          <g opacity={runLineOpacity}>
            <line x1="-60" y1="-10" x2="-90" y2="-10" stroke={COLORS.white} strokeWidth="3" strokeLinecap="round" />
            <line x1="-55" y1="5"   x2="-80" y2="5"   stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
            <line x1="-58" y1="20"  x2="-78" y2="20"  stroke={COLORS.white} strokeWidth="2" strokeLinecap="round" />
          </g>
        )}

        {/* Zzz (sleeping) */}
        {isSleeping && (
          <g transform={`translate(30, ${-50 + zzzY})`} opacity={zzzOpacity}>
            <text fontSize="22" fill={COLORS.zuzuDark} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle">z</text>
            <text fontSize="16" fill={COLORS.zuzuDark} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" transform="translate(14,-14)">z</text>
            <text fontSize="11" fill={COLORS.zuzuDark} fontFamily="sans-serif" fontWeight="bold" textAnchor="middle" transform="translate(24,-24)">z</text>
          </g>
        )}

        {/* Thinking dots */}
        {isThinking && (
          <g transform="translate(40, -50)">
            <circle cx="0"  cy="0" r="5" fill={COLORS.zuzuDark} opacity={dot1Opacity} />
            <circle cx="12" cy="0" r="5" fill={COLORS.zuzuDark} opacity={dot2Opacity} />
            <circle cx="24" cy="0" r="5" fill={COLORS.zuzuDark} opacity={dot3Opacity} />
          </g>
        )}

        {/* Shadow */}
        <ellipse cx="0" cy="65" rx={isRunning ? 26 : 32} ry="6" fill="rgba(0,0,0,0.1)" />

        {/* Tail */}
        <g transform={`translate(-28, 15) rotate(${tailWag})`}>
          <path
            d="M 0 0 Q -8 -12 -4 -20 Q 0 -28 4 -22 Q 6 -16 2 -8 Z"
            fill={COLORS.zuzuDark}
          />
        </g>

        {/* ── Left Leg ───────────────────────────────────────────────────────── */}
        <g transform={`translate(-14, 46) rotate(${leftLegAngle})`}>
          {/* Hip socket highlight */}
          <circle cx="0" cy="0" r="7" fill="#FF7F2E" />
          {/* Upper leg */}
          <rect x="-6" y="0" width="12" height="18" rx="6" fill="#FF7F2E" />
          {/* Hip joint darker ring */}
          <circle cx="0" cy="0" r="5" fill="#E86A1F" />
          {/* Knee bump */}
          <circle cx="0" cy="18" r="7" fill="#E86A1F" />
          {/* Lower leg — slightly narrower */}
          <rect x="-5" y="18" width="10" height="16" rx="5" fill="#FF7F2E" />
          {/* Sheen on upper leg */}
          <rect x="-3" y="3" width="4" height="10" rx="2" fill="#FFB374" opacity="0.35" />
          {/* Platform foot — extends forward (right) */}
          <rect x="-7" y="32" width="20" height="10" rx="5" fill="#E86A1F" />
          {/* Foot top highlight */}
          <rect x="-5" y="32" width="16" height="5" rx="3" fill="#FF7F2E" />
          {/* Sole shadow */}
          <rect x="-5" y="39" width="18" height="3" rx="2" fill="rgba(0,0,0,0.12)" />
        </g>

        {/* ── Right Leg ──────────────────────────────────────────────────────── */}
        <g transform={`translate(14, 46) rotate(${rightLegAngle})`}>
          <circle cx="0" cy="0" r="7" fill="#FF7F2E" />
          <rect x="-6" y="0" width="12" height="18" rx="6" fill="#FF7F2E" />
          <circle cx="0" cy="0" r="5" fill="#E86A1F" />
          <circle cx="0" cy="18" r="7" fill="#E86A1F" />
          <rect x="-5" y="18" width="10" height="16" rx="5" fill="#FF7F2E" />
          <rect x="-3" y="3" width="4" height="10" rx="2" fill="#FFB374" opacity="0.35" />
          <rect x="-7" y="32" width="20" height="10" rx="5" fill="#E86A1F" />
          <rect x="-5" y="32" width="16" height="5" rx="3" fill="#FF7F2E" />
          <rect x="-5" y="39" width="18" height="3" rx="2" fill="rgba(0,0,0,0.12)" />
        </g>

        {/* ── Left Arm ───────────────────────────────────────────────────────── */}
        <g transform={`translate(-33, 4) rotate(${leftArmAngle})`}>
          {/* Shoulder socket */}
          <circle cx="0" cy="0" r="6" fill="#E86A1F" />
          {/* Forearm */}
          <rect x="-5" y="0" width="10" height="18" rx="5" fill="#FF7F2E" />
          {/* Forearm sheen */}
          <rect x="-2" y="3" width="3" height="10" rx="1.5" fill="#FFB374" opacity="0.35" />
          {/* Wrist */}
          <circle cx="0" cy="18" r="5.5" fill="#E86A1F" />
          {/* Palm */}
          <rect x="-7" y="17" width="14" height="12" rx="4" fill="#FF9A3D" />
          {/* 4 finger nubs */}
          <circle cx="-5"   cy="17" r="3.2" fill="#FF9A3D" />
          <circle cx="-1.5" cy="16" r="3.4" fill="#FF9A3D" />
          <circle cx="2"    cy="16" r="3.4" fill="#FF9A3D" />
          <circle cx="5.5"  cy="17" r="3"   fill="#FF9A3D" />
          {/* Finger highlight stripe */}
          <rect x="-6" y="15" width="12" height="3" rx="1.5" fill="#FFB347" opacity="0.45" />
          {/* Thumb — protrudes left */}
          <ellipse cx="-9" cy="21" rx="3.5" ry="5" fill="#FF9A3D" />
          <ellipse cx="-9" cy="19" rx="2"   ry="2" fill="#FFB347" opacity="0.4" />
          {/* Palm shadow */}
          <ellipse cx="0" cy="29" rx="6" ry="1.5" fill="rgba(0,0,0,0.1)" />
        </g>

        {/* ── Right Arm ──────────────────────────────────────────────────────── */}
        <g transform={`translate(33, 4) rotate(${rightArmAngle})`}>
          <circle cx="0" cy="0" r="6" fill="#E86A1F" />
          <rect x="-5" y="0" width="10" height="18" rx="5" fill="#FF7F2E" />
          <rect x="-1" y="3" width="3" height="10" rx="1.5" fill="#FFB374" opacity="0.35" />
          <circle cx="0" cy="18" r="5.5" fill="#E86A1F" />
          <rect x="-7" y="17" width="14" height="12" rx="4" fill="#FF9A3D" />
          <circle cx="-5"   cy="17" r="3.2" fill="#FF9A3D" />
          <circle cx="-1.5" cy="16" r="3.4" fill="#FF9A3D" />
          <circle cx="2"    cy="16" r="3.4" fill="#FF9A3D" />
          <circle cx="5.5"  cy="17" r="3"   fill="#FF9A3D" />
          <rect x="-6" y="15" width="12" height="3" rx="1.5" fill="#FFB347" opacity="0.45" />
          {/* Thumb — protrudes right (mirror) */}
          <ellipse cx="9" cy="21" rx="3.5" ry="5" fill="#FF9A3D" />
          <ellipse cx="9" cy="19" rx="2"   ry="2" fill="#FFB347" opacity="0.4" />
          <ellipse cx="0" cy="29" rx="6" ry="1.5" fill="rgba(0,0,0,0.1)" />
        </g>

        {/* Body */}
        <g>
          <defs>
            <radialGradient id="zuzuImprovedSheen" cx="35%" cy="30%" r="60%">
              <stop offset="0%"   stopColor={COLORS.zuzuLight} stopOpacity="0.7" />
              <stop offset="100%" stopColor={COLORS.zuzu}      stopOpacity="0"   />
            </radialGradient>
          </defs>
          <circle cx="0" cy="0" r="35" fill={isScared ? '#FFB5C0' : COLORS.zuzu} />
          <circle cx="0" cy="0" r="35" fill="url(#zuzuImprovedSheen)" />
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
          {glowAntenna && (
            <>
              <circle cx="0" cy="-22" r={14 + Math.sin(frame * 0.15) * 6} fill={COLORS.flicker} opacity={0.15 + Math.sin(frame * 0.1) * 0.1} />
              <circle cx="0" cy="-22" r={9  + Math.sin(frame * 0.2)  * 4} fill={COLORS.flicker} opacity={0.25 + Math.sin(frame * 0.15) * 0.1} />
            </>
          )}
          <circle
            cx="0" cy="-22" r="6"
            fill={glowAntenna ? COLORS.flicker : COLORS.zuzuLight}
          />
          {glowAntenna && (
            <circle cx="-2" cy="-24" r="2" fill={COLORS.white} opacity="0.8" />
          )}
        </g>

        {/* Left Eye */}
        <g transform="translate(-12, -6)">
          <ellipse
            cx="0" cy="0" rx="10"
            ry={isBlinking || eyesClosed ? 1.5 : isSleepy ? 5 : isScared ? 14 : 12}
            fill={COLORS.white}
          />
          {!isBlinking && !eyesClosed && (
            <>
              <ellipse
                cx={ec.pupilOffsetX} cy={ec.pupilOffsetY}
                rx={6 * ec.pupilScale}
                ry={isSleepy ? 4 : 7 * ec.pupilScale}
                fill={COLORS.black}
              />
              <circle cx={ec.pupilOffsetX - 2} cy={ec.pupilOffsetY - 3} r="2.5" fill={COLORS.white} />
              <circle cx={ec.pupilOffsetX + 1.5} cy={ec.pupilOffsetY - 1} r="1.2" fill={COLORS.white} />
            </>
          )}
        </g>

        {/* Right Eye */}
        <g transform="translate(12, -6)">
          <ellipse
            cx="0" cy="0" rx="10"
            ry={isBlinking || eyesClosed ? 1.5 : isSleepy ? 5 : isScared ? 14 : 12}
            fill={COLORS.white}
          />
          {!isBlinking && !eyesClosed && (
            <>
              <ellipse
                cx={ec.pupilOffsetX} cy={ec.pupilOffsetY}
                rx={6 * ec.pupilScale}
                ry={isSleepy ? 4 : 7 * ec.pupilScale}
                fill={COLORS.black}
              />
              <circle cx={ec.pupilOffsetX - 2} cy={ec.pupilOffsetY - 3} r="2.5" fill={COLORS.white} />
              <circle cx={ec.pupilOffsetX + 1.5} cy={ec.pupilOffsetY - 1} r="1.2" fill={COLORS.white} />
            </>
          )}
        </g>

        {/* Blush cheeks */}
        {isHappy && (
          <>
            <ellipse cx="-22" cy="8" rx="6" ry="4" fill="#FF6B6B" opacity="0.3" />
            <ellipse cx="22"  cy="8" rx="6" ry="4" fill="#FF6B6B" opacity="0.3" />
          </>
        )}
        {isScared && (
          <>
            <ellipse cx="-22" cy="8" rx="5" ry="3" fill="#aaaaff" opacity="0.25" />
            <ellipse cx="22"  cy="8" rx="5" ry="3" fill="#aaaaff" opacity="0.25" />
          </>
        )}

        {/* Mouth */}
        {isHappy && (
          <path d="M -8 14 Q 0 24 8 14" stroke={COLORS.zuzuDark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        {isSurprised && (
          <ellipse cx="0" cy="16" rx="5" ry="7" fill={COLORS.zuzuDark} />
        )}
        {expr === 'confused' && !isThinking && (
          <path d="M -6 15 Q -2 13 2 15 Q 5 17 8 14" stroke={COLORS.zuzuDark} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {isThinking && (
          <path d="M -5 15 Q 0 12 5 15" stroke={COLORS.zuzuDark} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {isSleeping && (
          <path d="M -6 14 Q 0 11 6 14" stroke={COLORS.zuzuDark} strokeWidth="2" fill="none" strokeLinecap="round" />
        )}
        {isScared && (
          <path d="M -8 14 Q 0 8 8 14" stroke={COLORS.zuzuDark} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

      </g>
    </g>
  );
};
