# Pollination AI Image Generation (2026-05-28)

Pollination AI (`https://image.pollinations.ai`) is the recommended free image generation service for Remotion video workflows on Mac M-series. No local setup, no API keys.

## Quick Start

```bash
# Single image
curl -sL "https://image.pollinations.ai/prompt/Macau%20zebra%20crossing%20night%20solemn?width=768&height=512&nologo=true" \
  -o /tmp/remotion-demo/public/images/seg00_news.png

# Wait for rate limit cooldown then retry
sleep 65
```

## 6 Key Segment Prompts (tested 2026-05-28)

| Segment | Prompt | Output Size |
|---------|--------|-------------|
| `seg00_news` | `Macau zebra crossing night solemn candles flowers memorial scene` | 76KB JPEG |
| `seg06_anger` | `angry crowd protest shouting demanding justice scene` | 76KB JPEG |
| `seg09_speed` | `speeding car accident reconstruction blurry motion scene` | 60KB JPEG |
| `seg13_past` | `old Macau street historical black white photo style` | 83KB JPEG |
| `seg16_legal` | `courtroom judge gavel law justice scene` | 49KB JPEG |
| `seg22_memorial` | `child memorial angel statue candles tribute scene` | 56KB JPEG |

## Verified Prompts (all returned valid JPEG)

```bash
# Batch download with 65s stagger to avoid queue limit
cd /tmp/remotion-demo/public/images

curl -sL "https://image.pollinations.ai/prompt/Macau%20zebra%20crossing%20night%20solemn%20candles%20flowers%20memorial%20scene?width=768&height=512&nologo=true" -o seg00_news.png
sleep 65
curl -sL "https://image.pollinations.ai/prompt/angry%20crowd%20protest%20shouting%20demanding%20justice%20scene?width=768&height=512&nologo=true" -o seg06_anger.png
sleep 65
curl -sL "https://image.pollinations.ai/prompt/speeding%20car%20accident%20reconstruction%20blurry%20motion%20scene?width=768&height=512&nologo=true" -o seg09_speed.png
sleep 65
curl -sL "https://image.pollinations.ai/prompt/old%20Macau%20street%20historical%20black%20white%20photo%20style?width=768&height=512&nologo=true" -o seg13_past.png
sleep 65
curl -sL "https://image.pollinations.ai/prompt/courtroom%20judge%20gavel%20law%20justice%20scene?width=768&height=512&nologo=true" -o seg16_legal.png
sleep 70
curl -sL "https://image.pollinations.ai/prompt/child%20memorial%20angel%20statue%20candles%20tribute%20scene?width=768&height=512&nologo=true" -o seg22_memorial.png
```

## Rate Limit Handling

**Error response** (queue full):
```json
{"error": "Queue full for IP: 205.198.60.98: 1 requests already queued (max: 1). Get unlimited access at https://enter.pollinations.ai", ...}
```

**Solution**: Wait 60-70s then retry. File is saved as `.png` but is actually JSON — verify with `file`:

```bash
# Check if actual JPEG
file seg06_anger.png
# JPEG image data ✅
# JSON data ❌ (rate limited, retry)

# Always verify before using in Remotion
ls -la seg*.png  # all should be >50KB if real JPEG
```

## Prompt Engineering Tips

- **Simple English**: 5-10 words max, not complex sentences
- **Scene keywords**: Include type descriptor — "night", "solemn", "protest", "accident", "memorial"
- **No unicode**: Use plain ASCII English
- **Width/height**: `width=768&height=512` gives 3:2 landscape good for 1280×720 video
- **`nologo=true`**: Removes Pollination watermark

**⚠️ CRITICAL**: Use `<Img>` from `@remotion/img`, NOT `<img>` from HTML. Standard HTML `<img>` tags do NOT render in the Remotion headless canvas.

```tsx
import { Img } from "@remotion/img";
import { staticFile } from "remotion";

const NewsScene: React.FC<{text:string}> = ({text}) => {
  return (
    <AbsoluteFill style={{background: "#0c0c14"}}>
      <Img
        src={staticFile("images/seg00_news.png")}
        style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover",opacity:0.7}}
      />
      <div style={{position:"absolute",top:"15%",left:0,right:0,textAlign:"center",fontSize:40,color:"#ef4444"}}>
        📰 斑馬線前的悲劇
      </div>
    </AbsoluteFill>
  );
};
```

**Why `<img>` fails**: Standard HTML `<img>` elements are not rendered by Remotion's headless canvas engine (Puppeteer). Only Remotion's own `<Img>` component is supported.

## Why Not Bing Images

Bing image search for semantic topics like "Macau zebra crossing accident candles flowers" returns unrelated travel/hotel/pool images. **Do not use Bing for content-matched image sourcing.** Pollination AI generates exactly what you describe.