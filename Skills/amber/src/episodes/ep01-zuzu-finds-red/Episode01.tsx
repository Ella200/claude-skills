import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { Meadow } from '../../environments/Meadow';
import { Zuzu, Expression } from '../../characters/Zuzu';
import { Pip } from '../../characters/Pip';
import { QuestionMark } from '../../effects/QuestionMark';
import { SparkleText } from '../../effects/SparkleText';
import { Confetti } from '../../effects/Confetti';
import { RedApple } from '../../effects/RedApple';
import { Stars } from '../../effects/Stars';
import { COLORS } from '../../constants/colors';

/*
 * EPISODE 1: ZUZU FINDS RED
 * Runtime: ~2 min 30 sec (4500 frames at 30fps)
 *
 * SCENE MAP:
 * Scene 1: Meadow Wake-Up        0 - 360    (12s)
 * Scene 2: Apple Falls          360 - 600    (8s)
 * Scene 3: Put It Back          600 - 1500   (30s)
 * Scene 4: The Taste           1500 - 2700   (40s)
 * Scene 5: Antenna Glow "RED!" 2700 - 3600   (30s)
 * Scene 6: Celebration + Loop  3600 - 4500   (30s)
 */

export const Episode01: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- STATE VARIABLES ---
  let zuzuX = 960;
  let zuzuY = 660;
  let zuzuExpression: Expression = 'neutral';
  let zuzuScale = 2.5;
  let zuzuGlow = false;
  let zuzuDance = false;
  let zuzuWalk = false;
  let zuzuSquash = 0;

  let showAppleTree = true;
  let appleVisible = false;
  let appleX = 0;
  let appleY = 0;
  let appleScale = 1;
  let appleRotation = 0;

  let questionMarkFrame = -1;
  let starsFrame = -1;
  let showRedText = false;
  let redTextFrame = 0;
  let showConfetti = false;
  let confettiFrame = 0;
  let showPip = false;

  // Discovery objects
  let showLadybug = false;
  let showRedFlower = false;
  let showRedBerry = false;

  // ═══════════════════════════════════════
  // SCENE 1: MEADOW WAKE-UP (0 - 360)
  // ═══════════════════════════════════════
  if (frame < 360) {
    zuzuX = 480;

    if (frame < 120) {
      // Sleeping under the tree
      zuzuExpression = 'sleepy';
      zuzuY = 690;
    } else if (frame < 210) {
      // Waking up — eyes opening
      zuzuExpression = 'sleepy';
      zuzuY = 680;
    } else if (frame < 270) {
      // Standing, yawning
      zuzuExpression = 'neutral';
      zuzuY = 660;
    } else {
      // Happy, starts walking right
      zuzuExpression = 'happy';
      zuzuWalk = true;
      zuzuX = 480 + (frame - 270) * 2.5;
      zuzuY = 660;
    }
  }

  // ═══════════════════════════════════════
  // SCENE 2: APPLE FALLS (360 - 600)
  // ═══════════════════════════════════════
  else if (frame < 600) {
    const s = frame - 360;
    zuzuX = 700;
    zuzuY = 660;

    if (s < 30) {
      // Walking happily under the tree
      zuzuExpression = 'happy';
      zuzuWalk = true;
    } else if (s < 40) {
      // BONK! Apple hits Zuzu's head
      showAppleTree = false;
      zuzuExpression = 'surprised';
      zuzuWalk = false;
      starsFrame = 390;
      zuzuSquash = interpolate(s, [30, 35, 40], [0, 0.6, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      // Apple falling
      const fallProgress = interpolate(s, [30, 38], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      appleVisible = true;
      appleX = 720;
      appleY = 420 + fallProgress * 300;
      appleRotation = fallProgress * 45;
    } else if (s < 90) {
      // Dizzy, apple on ground
      showAppleTree = false;
      zuzuExpression = 'confused';
      appleVisible = true;
      appleX = 780;
      appleY = 720;
    } else if (s < 160) {
      // Staring at apple, curious
      showAppleTree = false;
      zuzuExpression = 'curious';
      appleVisible = true;
      appleX = 780;
      appleY = 720;
    } else {
      // Question mark appears
      showAppleTree = false;
      zuzuExpression = 'curious';
      appleVisible = true;
      appleX = 780;
      appleY = 720;
      questionMarkFrame = 360 + 160;
    }
  }

  // ═══════════════════════════════════════
  // SCENE 3: PUT IT BACK — COMEDY (600 - 1500)
  // ═══════════════════════════════════════
  else if (frame < 1500) {
    const s = frame - 600;
    showAppleTree = false;
    zuzuX = 480;
    zuzuY = 660;

    if (s < 180) {
      // ATTEMPT 1: Trying to throw the apple up
      appleVisible = true;
      if (s < 60) {
        // Picking up the apple
        zuzuExpression = 'neutral';
        appleX = 500;
        appleY = 660;
      } else if (s < 120) {
        // Throwing it up!
        zuzuExpression = 'neutral';
        const throwT = (s - 60) / 60;
        appleX = 490;
        appleY = 660 - Math.sin(throwT * Math.PI) * 200;
        appleRotation = throwT * 360;
      } else {
        // Bonk! Falls back on head
        zuzuExpression = 'surprised';
        zuzuSquash = interpolate(s, [120, 130, 140], [0, 0.5, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        appleX = 520;
        appleY = 720;
      }
    } else if (s < 400) {
      // ATTEMPT 2: Climbing the tree
      appleVisible = true;
      appleX = 500;
      appleY = 720;

      if (s < 280) {
        // Going up
        zuzuExpression = 'neutral';
        const climbT = (s - 180) / 100;
        zuzuX = 420;
        zuzuY = 660 - Math.min(climbT, 1) * 120;
      } else if (s < 350) {
        // Sliding back down!
        zuzuExpression = 'surprised';
        const slideT = (s - 280) / 70;
        zuzuX = 420;
        zuzuY = 540 + slideT * 120;
      } else {
        // Back on ground, frustrated
        zuzuExpression = 'confused';
        zuzuX = 420;
        zuzuY = 660;
      }
    } else if (s < 700) {
      // ATTEMPT 3: Rock stacking
      appleVisible = true;
      appleX = 500;
      appleY = 720;

      if (s < 550) {
        zuzuExpression = 'curious';
        zuzuX = 460;
      } else if (s < 620) {
        // Wobble and fall!
        zuzuExpression = 'surprised';
        zuzuX = 460;
        const fallT = (s - 550) / 70;
        zuzuY = 660 + fallT * 60;
      } else {
        // Lying defeated
        zuzuExpression = 'confused';
        zuzuX = 500;
        zuzuY = 730;
      }
    } else {
      // Long comedic pause — lying on ground
      zuzuExpression = 'confused';
      zuzuX = 500;
      zuzuY = 730;
      appleVisible = true;
      appleX = 530;
      appleY = 700;
    }
  }

  // ═══════════════════════════════════════
  // SCENE 4: THE TASTE (1500 - 2700)
  // ═══════════════════════════════════════
  else if (frame < 2700) {
    const s = frame - 1500;
    showAppleTree = false;
    zuzuX = 720;
    zuzuY = 660;

    if (s < 120) {
      // Sitting up, examining apple
      zuzuExpression = 'curious';
      appleVisible = true;
      appleX = 770;
      appleY = 700;
    } else if (s < 200) {
      // Sniffing
      zuzuExpression = 'curious';
      appleVisible = true;
      appleX = 760;
      appleY = 680;
    } else if (s < 250) {
      // BITE!
      zuzuExpression = 'surprised';
      appleVisible = true;
      appleX = 740;
      appleY = 670;
    } else if (s < 400) {
      // Chewing... then LOVING IT
      zuzuExpression = s < 300 ? 'surprised' : 'happy';
      appleVisible = true;
      appleX = 740;
      appleY = 670;
    } else if (s < 550) {
      // Eating more, pure bliss
      zuzuExpression = 'happy';
      appleVisible = s < 500;
      appleX = 740;
      appleY = 670;
      appleScale = interpolate(s, [400, 500], [1, 0.3], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else if (s < 650) {
      // Apple gone — pouty
      zuzuExpression = 'confused';
      appleVisible = false;
    } else if (s < 850) {
      // Notices red hands! Looking around
      zuzuExpression = 'curious';
      zuzuWalk = true;
      zuzuX = 720 + (s - 650) * 2;
    } else if (s < 1000) {
      // Discovering red things!
      zuzuExpression = 'surprised';
      zuzuWalk = true;
      zuzuX = 1120;
      showLadybug = s > 870;
      showRedFlower = s > 920;
      showRedBerry = s > 960;
    } else {
      // Pip arrives
      zuzuExpression = 'curious';
      zuzuWalk = false;
      zuzuX = 960;
      showLadybug = true;
      showRedFlower = true;
      showRedBerry = true;
      showPip = true;
    }
  }

  // ═══════════════════════════════════════
  // SCENE 5: ANTENNA GLOW — "RED!" (2700 - 3600)
  // ═══════════════════════════════════════
  else if (frame < 3600) {
    const s = frame - 2700;
    showAppleTree = false;
    showPip = true;
    showLadybug = true;
    showRedFlower = true;
    showRedBerry = true;
    zuzuX = 960;
    zuzuY = 650;
    zuzuWalk = false;

    if (s < 180) {
      // Thinking...
      zuzuExpression = 'curious';
    } else if (s < 240) {
      // The breath — silence
      zuzuExpression = 'neutral';
    } else if (s < 450) {
      // Antenna glowing!
      zuzuExpression = 'surprised';
      zuzuGlow = true;
    } else if (s < 700) {
      // "RED!" appears
      zuzuExpression = 'proud';
      zuzuGlow = true;
      showRedText = true;
      redTextFrame = 2700 + 450;
    } else {
      // Beaming
      zuzuExpression = 'proud';
      zuzuGlow = true;
      showRedText = true;
      redTextFrame = 2700 + 450;
    }
  }

  // ═══════════════════════════════════════
  // SCENE 6: CELEBRATION + LOOP (3600 - 4500)
  // ═══════════════════════════════════════
  else {
    const s = frame - 3600;
    showAppleTree = false;
    showPip = true;
    zuzuX = 960;
    zuzuY = 650;

    if (s < 300) {
      // DANCE PARTY!
      zuzuExpression = 'happy';
      zuzuDance = true;
      zuzuGlow = true;
      showConfetti = true;
      confettiFrame = 3600;
    } else if (s < 500) {
      // Winding down
      zuzuExpression = 'happy';
      zuzuDance = false;
      zuzuGlow = false;
    } else if (s < 750) {
      // Notices the pond — blue!
      zuzuExpression = 'curious';
      zuzuWalk = true;
      zuzuX = 960 + (s - 500) * 1.5;
    } else {
      // Question mark — loop tease for Episode 2
      zuzuExpression = 'curious';
      zuzuWalk = false;
      zuzuX = 1335;
      questionMarkFrame = 3600 + 750;
    }
  }

  // ═══════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.sky }}>
      <Meadow showAppleOnTree={showAppleTree}>

        {/* Discovery objects — appear during Scene 4 */}
        {showLadybug && (
          <g transform="translate(850, 780)">
            <ellipse cx="0" cy="0" rx="10" ry="8" fill={COLORS.red} />
            <circle cx="-3" cy="-2" r="2" fill={COLORS.black} />
            <circle cx="3" cy="-2" r="2" fill={COLORS.black} />
            <line x1="0" y1="-8" x2="0" y2="8" stroke={COLORS.black} strokeWidth="1" />
          </g>
        )}
        {showRedFlower && (
          <g transform="translate(1050, 800)">
            <circle cx="0" cy="0" r="10" fill={COLORS.red} />
            <circle cx="0" cy="0" r="4" fill={COLORS.flicker} />
            <line x1="0" y1="10" x2="0" y2="30" stroke="#4CAF50" strokeWidth="3" />
          </g>
        )}
        {showRedBerry && (
          <g transform="translate(1200, 790)">
            <circle cx="0" cy="0" r="8" fill={COLORS.red} />
            <circle cx="-2" cy="-2" r="2" fill={COLORS.redLight} opacity="0.5" />
          </g>
        )}

        {/* The Red Apple (on ground) */}
        {appleVisible && (
          <RedApple x={appleX} y={appleY} scale={appleScale} rotation={appleRotation} />
        )}

        {/* Pip */}
        {showPip && <Pip x={1100} y={700} scale={1.8} />}

        {/* ★ ZUZU ★ */}
        <Zuzu
          x={zuzuX}
          y={zuzuY}
          scale={zuzuScale}
          expression={zuzuExpression}
          antennaGlow={zuzuGlow}
          dancing={zuzuDance}
          walking={zuzuWalk}
          squash={zuzuSquash}
        />

        {/* Question Mark */}
        {questionMarkFrame > 0 && (
          <QuestionMark x={zuzuX} y={zuzuY - 130} startFrame={questionMarkFrame} />
        )}

        {/* Bonk Stars */}
        {starsFrame > 0 && (
          <Stars x={zuzuX} y={zuzuY - 80} startFrame={starsFrame} />
        )}

        {/* "RED!" Text */}
        {showRedText && (
          <SparkleText
            text="RED!"
            color={COLORS.red}
            x={960}
            y={300}
            startFrame={redTextFrame}
            fontSize={200}
          />
        )}

        {/* Confetti */}
        {showConfetti && (
          <Confetti startFrame={confettiFrame} durationFrames={280} />
        )}

      </Meadow>

      {/* Fade to black at the very end */}
      {frame > 4400 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: COLORS.black,
            opacity: interpolate(frame, [4400, 4500], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        />
      )}
    </AbsoluteFill>
  );
};
