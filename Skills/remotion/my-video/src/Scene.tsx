import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import type { Scene } from "./scenes";

export const SceneComponent: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Fade in at start
  const fadeIn = interpolate(frame, [0, 0.5 * fps], [0, 1], {
    extrapolateRight: "clamp",
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 0.8 * fps, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = Math.min(fadeIn, fadeOut);

  // Title slides up with spring
  const titleY = spring({
    fps,
    frame,
    config: { damping: 14, stiffness: 80, mass: 1 },
    durationInFrames: 30,
  });
  const titleSlide = interpolate(titleY, [0, 1], [40, 0]);

  // Subtitle appears slightly after
  const subtitleDelay = 12;
  const subtitleOpacity = interpolate(
    frame,
    [subtitleDelay, subtitleDelay + 0.6 * fps],
    [0, 1],
    { extrapolateRight: "clamp" },
  );
  const subtitleY = spring({
    fps,
    frame: Math.max(0, frame - subtitleDelay),
    config: { damping: 14, stiffness: 80, mass: 1 },
    durationInFrames: 30,
  });
  const subtitleSlide = interpolate(subtitleY, [0, 1], [30, 0]);

  // Accent line grows in width
  const lineWidth = spring({
    fps,
    frame: Math.max(0, frame - 20),
    config: { damping: 16, stiffness: 60 },
    durationInFrames: 40,
  });
  const lineWidthPct = interpolate(lineWidth, [0, 1], [0, 100]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${scene.bgFrom}, ${scene.bgTo})`,
        opacity,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${scene.accent}22 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Text content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          zIndex: 1,
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateY(${titleSlide}px)`,
            fontSize: 80,
            fontWeight: 800,
            color: "#ffffff",
            fontFamily: "Georgia, serif",
            letterSpacing: "-2px",
            lineHeight: 1,
            textAlign: "center",
          }}
        >
          {scene.title}
        </div>

        {/* Accent line */}
        <div
          style={{
            width: `${lineWidthPct}%`,
            maxWidth: 320,
            height: 4,
            borderRadius: 2,
            background: scene.accent,
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            transform: `translateY(${subtitleSlide}px)`,
            opacity: subtitleOpacity,
            fontSize: 48,
            fontWeight: 300,
            color: scene.accent,
            fontFamily: "Georgia, serif",
            letterSpacing: "1px",
            textAlign: "center",
          }}
        >
          {scene.subtitle}
        </div>
      </div>

      {/* Corner watermark / scene id */}
      <div
        style={{
          position: "absolute",
          bottom: 32,
          right: 40,
          fontSize: 14,
          color: "#ffffff44",
          fontFamily: "monospace",
          letterSpacing: "2px",
          textTransform: "uppercase",
        }}
      >
        {scene.id}
      </div>
    </div>
  );
};
