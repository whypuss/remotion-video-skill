# Full Audio Pipeline (2026-05-28)

## Context

Full podcast → video workflow for "全澳哀悼被撞小朋友" (23 segments, 12.6 min, 22,700 frames).
This was the first time we correctly handled: script text change + audio regeneration + SEGMENTS time axis update in one pass.

## Key Learnings

### Audio Generation (Python)

```python
#!/usr/bin/env python3
import subprocess, json, os

OUTDIR = "/tmp/remotion-demo/public/audio"
os.makedirs(OUTDIR, exist_ok=True)

segments = [
    (0,  'y', "zh-HK-WanLungNeural",  "Y貓 第一段文字..."),
    (1,  'm', "zh-HK-HiuMaanNeural",  "momo 第一段文字..."),
    # ... more segments
]

FPS = 30
durations = []

for idx, speaker, voice, text in segments:
    label = 'y' if speaker == 'y' else 'm'
    path = f"{OUTDIR}/seg_{idx:02d}_{label}.m4a"

    # Generate audio
    result = subprocess.run(
        ["edge-tts", "--voice", voice, "--text", text, "--write-media", path],
        capture_output=True, timeout=60
    )

    # Get real duration
    probe = subprocess.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", path],
        capture_output=True, text=True
    )
    try:
        dur = float(json.loads(probe.stdout)["format"]["duration"])
    except:
        dur = 20.0

    durations.append((idx, speaker, dur))
    print(f"SEG {idx:02d} [{label}] dur={dur:.3f}s  {text[:25]}...")

total = sum(d for _, _, d in durations)
total_f = int(round(total * FPS))
print(f"\nTotal: {total:.1f}s = {total/60:.2f}min = {total_f} frames")

# Write summary for SEGMENTS building
with open("/tmp/seg_summary.txt", "w") as f:
    f.write(f"TOTAL={total_f}\n")
    for idx, speaker, dur in durations:
        f.write(f"{idx},{speaker},{dur:.3f}\n")
```

### Build SEGMENTS from Summary

```python
with open("/tmp/seg_summary.txt") as f:
    lines = f.read().strip().split("\n")

total_f = int(lines[0].split("=")[1])
durations = []
for line in lines[1:]:
    idx, speaker, dur = line.split(",")
    durations.append((int(idx), speaker, float(dur)))

FPS = 30
startF = 0
lines_out = ["const SEGMENTS = ["]
for i, (seg_idx, speaker, text) in enumerate(segments_data):
    dur = durations[seg_idx][2]
    durF = int(round(dur * FPS))
    escaped_text = text.replace('"', '\\"')
    lines_out.append(f'  {{idx:{seg_idx},  speaker:\'{speaker}\', startF:{startF}, durF:{durF},  dur:{dur}, text:"{escaped_text}"}},')
    startF += durF

lines_out.append("];")
```

### Update Root.tsx and Composition.tsx

```bash
# Update total frames
sed -i '' 's/durationInFrames={OLD}/durationInFrames={total_f}/' /tmp/remotion-demo/src/Root.tsx
sed -i '' 's/const TOTAL_FRAMES = OLD/const TOTAL_FRAMES = total_f/' /tmp/remotion-demo/src/Composition.tsx
```

### Pre-render Verification

```bash
# Verify audio file count (should be 2x segments for dual-speaker)
ls /tmp/remotion-demo/public/audio/ | grep -c "seg_.*\.m4a"
```

## What Went Wrong (Desync Bug)

The momo topic video (first attempt) had:
- New script text updated in SEGMENTS
- Root.tsx updated
- BUT audio files NOT regenerated

Result: 8 min 17 sec video (old audio) with new text/captions. Duration mismatch.

Fix: Delete all audio → regenerate all → rebuild SEGMENTS → update Root.tsx → render.

## Final Video Stats

| Item | Value |
|------|-------|
| Duration | 12.6 min (22,700 frames) |
| Segments | 23 (Y貓 + momo) |
| Audio files | 46 (23 × 2 speakers) |
| Total audio | 756.6s |
| Edge TTS voices | WanLungNeural (Y), HiuMaanNeural (momo) |
| Output | /tmp/remotion-demo/out/zebra_podcast.mp4 |

## Reference Paths

- Audio generation: `/tmp/gen_full_audio.py`
- SEGMENTS builder: built in `execute_code` (inline Python)
- Composition: `/tmp/remotion-demo/src/Composition.tsx`
- Root: `/tmp/remotion-demo/src/Root.tsx`
- Audio dir: `/tmp/remotion-demo/public/audio/`
- Zebra template: `/tmp/zebra-demo/src/Composition.tsx`