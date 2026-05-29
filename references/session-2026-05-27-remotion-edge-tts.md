# Remotion + Edge TTS 粵語 Demo Session (2026-05-27)

## What was built

4-second cyberpunk video with:
- Cyberpunk neon background (deep purple-black + animated grid overlay)
- 4 floating glowing orbs (cyan/pink/purple/yellow) with spring bounce
- "HERMES" title with scale+glow animation
- "Edge TTS + Remotion 粵語示範" subtitle with slide-up
- Waveform visualizer (60 bars, color-cycling)
- Edge TTS Cantonese voiceover (粤语香港, 20KB .ogg)
- "演示完成" closing title

## Files

- `/tmp/remotion-demo/src/Composition.tsx` — main composition with all components
- `/tmp/remotion-demo/src/Root.tsx` — 1280x720 @ 30fps, 120 frames
- `/tmp/remotion-demo/public/audio/voiceover.ogg` — Edge TTS output (3.3s)
- `/tmp/remotion-demo/out/MyComp.mp4` — final output (506 KB)

## Key Remotion components used

| Component | Purpose |
|-----------|---------|
| `AbsoluteFill` | Full-frame container |
| `Sequence` | Timed layer with `from=` offset |
| `Audio` from `@remotion/media` | Voiceover sync |
| `interpolate` + `Easing` | All animations |
| `staticFile` | Referencing public/ assets |
| `GridOverlay` + `FloatingOrb` | Background effects |

## Edge TTS call

```bash
text_to_speech(
  text="你好，我係歪貓。今日試下 Hermes Agent 結合 Edge TTS 語音合成，同埋 Remotion 視頻生成，整一條粵語示範片。",
  output_path="/tmp/remotion-demo/audio/voiceover.ogg",
  lang="zh-HK"
)
```

Duration: 3.336 seconds → 100 frames at 30fps. Set `durationInFrames={120}` to cover.

## Mac-specific fix

`npx remotion` fails on Mac → use `node_modules/.bin/remotion` directly.

## Render command

```bash
cd /tmp/remotion-demo && node_modules/.bin/remotion render MyComp --codec=h264 --crf=20
```

Output: `out/MyComp.mp4` (506 KB)