# Remotion + Mac TTS Cantonese Session (2026-05-28)

## What was built

11-second cyberpunk video with Mac TTS Cantonese voice:
- Mac native `say -v Sinji` (zh_HK) — no external API needed
- Cyberpunk neon background + animated grid
- 4 floating glowing orbs (cyan/pink/purple/yellow)
- "HERMES" + "演示完成" title with scale+glow animation
- Waveform visualizer (60 bars)
- "大家好，我係歪貓..." 粵語語音 (9.7s)

## Files

| File | Purpose |
|------|---------|
| `src/Composition.tsx` | Main composition, 330 frames @ 30fps |
| `src/Root.tsx` | Composition ID: `MyComp`, 1280x720 |
| `public/audio/voiceover.m4a` | Sinji AAC voice (86KB, 9.7s) |
| `out/MyComp.mp4` | Final output, 1.3MB |

## Mac TTS Cantonese Workflow

```bash
# 1. List available Cantonese voices
say -v "?" | grep zh_HK

# 2. Generate Cantonese AIFF
say -v Sinji "大家好，我係歪貓。" -o /tmp/voice.aiff

# 3. Convert AIFF → M4A/AAC (required for Remotion)
ffmpeg -y -i /tmp/voice.aiff -c:a aac /tmp/remotion-demo/public/audio/voiceover.m4a

# 4. Get duration (frames = seconds × 30fps)
ffprobe -v quiet -show_entries format=duration -of csv=p=0 /tmp/remotion-demo/public/audio/voiceover.m4a
```

## Cantonese Voice

`Sinji (zh_HK)` — only native Cantonese voice on macOS.

## Render

```bash
cd /tmp/remotion-demo && node_modules/.bin/remotion render MyComp --codec=h264 --crf=20
```

## Key Fixes

- Use `.m4a` (AAC) not `.ogg` — Mac ffmpeg has no libvorbis
- Duration frames = `duration_seconds × 30`
- `npx remotion` fails on Mac → use `node_modules/.bin/remotion` directly