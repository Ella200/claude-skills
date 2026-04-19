import "./index.css";
import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import { TOTAL_FRAMES } from "./scenes";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="PersonalStory"
        component={MyComposition}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
