# ZUZU'S WORLD — Remotion Animation Project

A colorful, no-dialogue animated kids' series built entirely with React and Remotion.
Target audience: Ages 3-9. Every episode teaches one concept through comedy and discovery.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Open Remotion Studio (preview in browser)
npm start

# 3. Render to MP4
npm run build
```

## Project Structure

```
src/
├── constants/colors.ts          ← Brand palette (LOCKED — never change)
├── characters/
│   ├── Zuzu.tsx                 ← Main character (7 expressions, walk, dance, squash)
│   ├── Pip.tsx                  ← Blue bouncing sidekick (no arms)
│   ├── Momo.tsx                 ← Purple sleepy blob
│   └── Flicker.tsx              ← Golden glowing guide
├── environments/
│   └── Meadow.tsx               ← Main world background
├── effects/
│   ├── QuestionMark.tsx         ← "?" pop animation
│   ├── SparkleText.tsx          ← Learning text reveal ("RED!")
│   ├── Confetti.tsx             ← Celebration particles
│   ├── Stars.tsx                ← Comedy bonk stars
│   └── RedApple.tsx             ← Episode 1 prop
├── audio/
│   └── audioMap.ts              ← All audio file paths
├── episodes/
│   └── ep01-zuzu-finds-red/
│       ├── Episode01.tsx        ← Full episode state machine
│       └── timing.ts           ← Scene timing constants
├── Root.tsx                     ← Composition registry
└── index.ts                     ← Entry point
```

## How Episodes Work

Each episode is a **state machine** driven by `useCurrentFrame()`.
The current frame number determines:
- Zuzu's position (x, y)
- Zuzu's expression (curious, happy, surprised, etc.)
- Which props/effects are visible
- Animation states (walking, dancing, antenna glow)

To edit pacing, adjust the frame boundaries in the episode file.

## How Characters Work

Characters are **React components** that accept props:

```tsx
<Zuzu
  x={960}           // Horizontal position
  y={660}           // Vertical position
  scale={2.5}       // Size multiplier
  expression="happy" // Face state
  antennaGlow={true} // Learning moment
  dancing={true}     // Celebration mode
  walking={true}     // Walk cycle
  squash={0.5}       // Impact deformation (0-1)
/>
```

## Adding Audio

1. Generate music using AI tools (Suno, Udio) with the prompts from the sound bible
2. Place files in `public/audio/` matching the paths in `src/audio/audioMap.ts`
3. Import and use in episodes:

```tsx
import { Audio, Sequence } from 'remotion';

<Sequence from={0}>
  <Audio src={staticFile('audio/music/bg-gentle-meadow.mp3')} volume={0.7} />
</Sequence>
```

## Creating New Episodes

1. Create folder: `src/episodes/ep02-zuzu-finds-blue/`
2. Copy `Episode01.tsx` as template
3. Change the state machine logic for new scenes
4. Add new Composition in `Root.tsx`:

```tsx
<Composition
  id="Episode02-ZuzuFindsBlue"
  component={Episode02}
  durationInFrames={4500}
  fps={30}
  width={1920}
  height={1080}
/>
```

## Video Specs (LOCKED)

- Resolution: 1920 x 1080 (Full HD)
- Frame rate: 30fps
- Format: MP4
- All graphics: Pure SVG/CSS (zero image assets)

## Brand Colors (LOCKED)

| Character | Color   | Hex     |
|-----------|---------|---------|
| Zuzu      | Orange  | #FF8C42 |
| Pip       | Blue    | #5BC0EB |
| Momo      | Purple  | #9B89B3 |
| Flicker   | Gold    | #FFD700 |
| Grass     | Green   | #7EC850 |
| Sky       | Blue    | #87CEEB |
| Pond      | Teal    | #6EC6E6 |
