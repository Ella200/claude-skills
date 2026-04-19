export type Scene = {
  id: string;
  durationInFrames: number;
  title: string;
  subtitle: string;
  bgFrom: string;
  bgTo: string;
  accent: string;
  audioFile?: string; // e.g. "voiceover/scene-01.mp3" — add when ready
};

export const SCENES: Scene[] = [
  {
    id: "intro",
    durationInFrames: 150, // 5s at 30fps
    title: "Every story",
    subtitle: "has a beginning.",
    bgFrom: "#0f0c29",
    bgTo: "#302b63",
    accent: "#a78bfa",
    audioFile: "voiceover/scene-01-intro.mp3",
  },
  {
    id: "question",
    durationInFrames: 150,
    title: "Mine started",
    subtitle: "with a simple question.",
    bgFrom: "#1a1a2e",
    bgTo: "#16213e",
    accent: "#60a5fa",
    audioFile: "voiceover/scene-02-question.mp3",
  },
  {
    id: "leap",
    durationInFrames: 150,
    title: "I decided",
    subtitle: "to take the leap.",
    bgFrom: "#134e4a",
    bgTo: "#0f172a",
    accent: "#34d399",
    audioFile: "voiceover/scene-03-leap.mp3",
  },
  {
    id: "beginning",
    durationInFrames: 150,
    title: "And this",
    subtitle: "is just the beginning.",
    bgFrom: "#1e1b4b",
    bgTo: "#312e81",
    accent: "#f472b6",
    audioFile: "voiceover/scene-04-beginning.mp3",
  },
];

export const TOTAL_FRAMES = SCENES.reduce(
  (sum, s) => sum + s.durationInFrames,
  0,
);
