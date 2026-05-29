# Session 2026-05-28: Edge TTS Cantonese + Dual Voice + Captions

## Edge TTS Cantonese Voices (Verified Working)

```
zh-HK-HiuGaaiNeural   Female   ~6.17s for "大家好，我係歪貓。今日試試混合語音。"
zh-HK-WanLungNeural   Male     ~4.68s for "跟住我係阿軒，一齊試試混合語音效果。"
```

Check voices: `edge-tts --list-voices | grep -i zh-HK`

## Dual Voice Composition

- Female: `HiuGaaiNeural` → 185 frames (6.168s × 30fps)
- Male: `WanLungNeural` → starts at frame 185, ~140 frames
- No concatenation needed — two `<Sequence>` with different `from` offsets

## CaptionLayer (NOT @remotion/captions)

`@remotion/captions` causes React error #130 in headless Puppeteer.
Custom `CaptionLayer` component works fine — frame-driven opacity fade.

## Files

- `/tmp/female_cn.mp3` — 6.168s, HiuGaaiNeural
- `/tmp/male_cn.mp3` — 4.68s, WanLungNeural
- `/tmp/remotion-demo/src/Composition.tsx` — dual audio + dual caption composition