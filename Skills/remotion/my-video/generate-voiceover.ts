/**
 * AI Voiceover Generator using ElevenLabs TTS
 *
 * Prerequisites:
 *   1. Get a free API key at https://elevenlabs.io
 *   2. Set ELEVENLABS_API_KEY in your environment:
 *        export ELEVENLABS_API_KEY=your_key_here
 *   3. Run: node --strip-types generate-voiceover.ts
 *
 * Audio files will be saved to public/voiceover/ and
 * automatically picked up by the Remotion composition.
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

// ── Config ────────────────────────────────────────────────────────────────────

const VOICE_ID = "pNInz6obpgDQGcFmaJgB"; // "Adam" — change to any ElevenLabs voice ID
const MODEL_ID = "eleven_multilingual_v2";

/** Edit these lines to match your personal story */
const SCENES = [
  { id: "scene-01-intro", text: "Every story has a beginning." },
  { id: "scene-02-question", text: "Mine started with a simple question." },
  { id: "scene-03-leap", text: "I decided to take the leap." },
  { id: "scene-04-beginning", text: "And this... is just the beginning." },
];

// ── Generator ─────────────────────────────────────────────────────────────────

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("❌  Missing ELEVENLABS_API_KEY environment variable.");
  console.error("    Set it with: export ELEVENLABS_API_KEY=your_key_here");
  process.exit(1);
}

const outputDir = join("public", "voiceover");
mkdirSync(outputDir, { recursive: true });

async function generateScene(scene: { id: string; text: string }) {
  console.log(`🎙  Generating: "${scene.text}"`);

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey!,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: scene.text,
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${await response.text()}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  const outputPath = join(outputDir, `${scene.id}.mp3`);
  writeFileSync(outputPath, audioBuffer);
  console.log(`   ✅  Saved to ${outputPath}`);
}

(async () => {
  console.log("🚀  Starting voiceover generation...\n");
  for (const scene of SCENES) {
    await generateScene(scene);
  }
  console.log("\n🎬  All done! Now update src/scenes.ts to add audioFile paths:");
  console.log('    audioFile: "voiceover/scene-01-intro.mp3"');
})();
