'use client';

import { ChromaticTextIntro } from "./ChromaticTextIntro";

export interface SceneProps {
  text?: string;
  className?: string;
}

export function Scene({ text = "Hannan Khan", className = "" }: SceneProps) {
  return (
    <div className={`shader-frame ${className}`} style={{ width: 'auto', height: 'auto', background: 'transparent' }}>
      <ChromaticTextIntro text={text} />
    </div>
  );
}

// Support TextAnimationCollection alias with exact variant compatibility
export function TextAnimationCollection({
  text = "Hannan Khan",
  variant = "threeui-intro",
}: {
  text?: string;
  variant?: string;
  mode?: string;
  hue?: number;
  saturation?: number;
  brightness?: number;
}) {
  return <ChromaticTextIntro text={text} />;
}

export default Scene;
