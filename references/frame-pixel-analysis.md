# Frame Pixel Analysis (Empirical Effect Verification)

## Problem
After rendering, Aurora/Particle background layers appear completely invisible despite being present in JSX. Need to empirically verify what's actually rendered.

## Technique: Pillow Frame Extraction + Pixel Analysis

```bash
# 1. Extract sample frames from rendered video
mkdir -p /tmp/remotion-demo/frames_new
ffmpeg -y -i out/MyComp_fresh.mp4 -vf "fps=0.3" -q:v 2 frames_new/frame_%03d.jpg

# 2. Check file sizes and MD5 hashes (different files = different frames)
wc -c frames_new/*.jpg
md5sum frames_new/*.jpg | head -5

# 3. Pixel analysis with Python/Pillow
python3 - << 'PYEOF'
from PIL import Image

frames = ["/tmp/remotion-demo/frames_new/frame_001.jpg", ...]
for fname in frames:
    img = Image.open(fname)
    w, h = img.size
    center = img.getpixel((w//2, h//2))
    corner = img.getpixel((10, 10))
    bottom = img.getpixel((w//2, h-10))
    avg = (center[0]+center[1]+center[2])/3
    print(f"{fname}: center={center}, corner={corner}, bottom={bottom}, avg={avg:.1f}")
PYEOF
```

## Interpretation Guide

| Metric | Meaning | Rule of Thumb |
|--------|---------|---------------|
| `center` pixel | Center of frame, usually brightest part | Red vignette → `(131, 27, 26)`, neutral → `(100-180, 100-180, 100-180)` |
| `corner` pixel | Corner = most vignette-affected | Near-black `(0-5, 0-5, 0-5)` = vignette is strong |
| `avg` brightness | Overall scene brightness | `< 30` = scene too dark, check overlay layers; `50-180` = visible; `> 180` = overexposed |
| MD5 mismatch % | Frame uniqueness vs previous render | `> 80%` pixels differ = genuinely new frame |

## Validated Effect Signatures

**Red vignette (working):** `center=(131,27,26)`, `corner=(2,1,0)`
**Heavy cinematic vignette:** `avg=53`, `center=(105,27,27)`, `corner=(2,1,0)`
**Sepia/past theme:** `center=(109,134,105)` — green channel higher (warm tint)
**Speed theme (blue):** `center=(134,144,153)` — blue channel highest

## Comparison: Old vs New Render

```python
# Compare old vs new frames
old = Image.open("frames/frame_001.jpg")
new = Image.open("frames_new/frame_001.jpg")
old_data = list(old.getdata())
new_data = list(new.getdata())
diff_count = sum(1 for a, b in zip(old_data, new_data) if a != b)
print(f"Pixel diff: {diff_count}/{len(old_data)} ({100*diff_count/len(old_data):.1f}%)")
```

**`83%` pixel difference** = genuinely different render (not cache replay)

## When to Use This Technique

- User says "沒有改善" or "效果睇唔到" but JSX appears correct
- Aurora/Particle/Grain layers added but user can't see them
- Need to prove to user that a new render is actually different from previous
- Frame MD5 comparison is the definitive proof of fresh generation