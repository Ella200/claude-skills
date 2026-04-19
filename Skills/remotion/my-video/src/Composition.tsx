import { Audio, Sequence, staticFile } from "remotion";
import { SceneComponent } from "./Scene";
import { SCENES } from "./scenes";

export const MyComposition = () => {
  let offset = 0;

  return (
    <>
      {SCENES.map((scene) => {
        const from = offset;
        offset += scene.durationInFrames;

        return (
          <Sequence
            key={scene.id}
            from={from}
            durationInFrames={scene.durationInFrames}
          >
            <SceneComponent scene={scene} />
            {scene.audioFile && (
              <Audio src={staticFile(scene.audioFile)} />
            )}
          </Sequence>
        );
      })}
    </>
  );
};
