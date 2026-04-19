import React from 'react';
import { Composition } from 'remotion';
import { Episode01 } from './episodes/ep01-zuzu-finds-red/Episode01';
import { ZuzuStateTest } from './ZuzuStateTest';
import { VIDEO } from './constants/colors';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Episode01-ZuzuFindsRed"
        component={Episode01}
        durationInFrames={4500}
        fps={VIDEO.FPS}
        width={VIDEO.WIDTH}
        height={VIDEO.HEIGHT}
      />
      <Composition
        id="ZuzuStateTest"
        component={ZuzuStateTest}
        durationInFrames={300}
        fps={VIDEO.FPS}
        width={VIDEO.WIDTH}
        height={VIDEO.HEIGHT}
      />
    </>
  );
};
