# Content-Matched Composition Pattern
# Verified working: 2026-05-28 — AI images visible in rendered video

## Core Pattern: `<Img>` Background Layer + SEGMENT_IMAGES Map

```tsx
import { Img } from "remotion";  // NOT @remotion/img

const SEGMENT_IMAGES: Record<number, string> = {
  0: "seg00_news.png",
  6: "seg06_anger.png",
  9: "seg09_speed.png",
  13: "seg13_past.png",
  16: "seg16_legal.png",
  22: "seg22_memorial.png",
};

// SceneForTheme takes segIdx to lookup image
const SceneForTheme: React.FC<{
  theme: string;
  text: string;
  speaker: "Y" | "M";
  segIdx: number;
}> = ({theme, text, speaker, segIdx}) => {
  const imgFile = SEGMENT_IMAGES[segIdx];
  return (
    <AbsoluteFill>
      {imgFile && (
        <Img
          src={staticFile(`images/${imgFile}`)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,  // 55% — CSS effects still visible on top
          }}
        />
      )}
      <div style={{position: "absolute", inset: 0}}>
        {/* switch/case for theme scenes */}
        {theme === "news" && <NewsScene text={text} />}
        {theme === "anger" && <AngerScene text={text} />}
        {/* etc */}
      </div>
    </AbsoluteFill>
  );
};
```

## Key Implementation Details

1. **`Img` comes from `remotion` package** — no separate npm install needed
2. **`staticFile()`** — required path format for Remotion static assets
3. **`opacity: 0.55`** — AI image at 55% opacity so CSS/SVG effects remain visible
4. **`segIdx` passed to SceneForTheme** — maps segment index to image file
5. **`SEGMENT_IMAGES` only for segments that have AI images** — other segments get CSS-only scenes

## Segment-to-Image Mapping Logic

| Seg | Theme | Image | Context |
|-----|-------|-------|---------|
| 0 | speaker | seg00_news.png | News intro — Macau street accident |
| 6 | anger | seg06_anger.png | Driver accelerating at zebra |
| 9 | speed | seg09_speed.png | Speeding car, wet road |
| 13 | past | seg13_past.png | Old Macau nostalgic street |
| 16 | legal | seg16_legal.png | Courtroom |
| 22 | memorial | seg22_memorial.png | Child memorial candles |

## Common Mistakes

- ❌ `import { Img } from "@remotion/img"` — package doesn't exist
- ❌ Using regular `<img>` tag — won't render in Remotion canvas
- ❌ Setting `opacity: 1` — CSS effects become hard to see
- ❌ Forgetting `staticFile()` — image path won't resolve at render time
- ❌ No `segIdx` prop — can't map segment to image without index

## Testing

```bash
# Single frame check
cd /tmp/remotion-demo
node_modules/.bin/remotion still src/index.ts MyComp --frame=934 --out-file=out/check_seg2.png

# Verify image file type (JPEG disguised as .png)
file public/images/seg*.png
# All should say: JPEG image data

# Full render
node_modules/.bin/remotion render src/index.ts MyComp out/MyComp_v2.mp4 --log=warn
```