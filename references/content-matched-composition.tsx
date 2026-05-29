# Content-Matched Composition.tsx (2026-05-28 Working Version)
# Video: 全澳哀悼被撞小朋友 podcast (23 segments, 22689 frames, 12.6 min)
# AI images: 6 key segments (seg00/06/09/13/16/22) via Pollination AI
# Verified: images display in rendered video v2 (47MB)

## Key Pattern: `<Img>` Background Layer + Scene Content Overlay

```tsx
import React from "react";
import {
  useCurrentFrame, interpolate, Easing,
  AbsoluteFill, Sequence, spring, Img,  // ← Img imported from remotion
} from "remotion";
import { Audio } from "@remotion/media";
import { staticFile } from "remotion";
import { TransitionSeries } from "@remotion/transitions";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg: "#0c0c14", y_cat: "#c084fc", moggy: "#f472b6",
  muted: "#6b7280", white: "#ffffff", accent: "#ef4444",
  warning: "#f59e0b", amber: "#f59e0b", sepia: "#8b7355",
  emerald: "#10b981", red: "#dc2626", darkRed: "#7f1d1d",
};

// ─── Theme Map (per segment index) ───────────────────────────────────────────
const THEMES = [
  "speaker","past","news","news","anger","anger",
  "speed","speed","speed","past","past","license",
  "broken-window","past","past","phone","infrastructure",
  "legal","news","memorial","appeal","default","memorial",
];

// ─── Segment Audio Data ───────────────────────────────────────────────────────
const SEGMENTS = [
  {idx:0,  speaker:'y', startF:0,      durF:369,  dur:12.312, text:"..."},
  {idx:1,  speaker:'m', startF:369,    durF:565,  dur:18.84,  text:"..."},
  // ... 22 more segments
];

// ─── AI Image Mapping (segIdx → image filename) ──────────────────────────────
const SEGMENT_IMAGES: Record<number, string> = {
  0: "seg00_news.png",   // news: zebra crossing accident
  6: "seg06_anger.png",  // anger: driver hitting accelerator
  9: "seg09_speed.png",  // speed: speeding car
  13: "seg13_past.png",  // past: old Macau street
  16: "seg16_legal.png", // legal: courtroom
  22: "seg22_memorial.png", // memorial: child memorial
};

const TOTAL_FRAMES = 22689;

// ─── Caption ─────────────────────────────────────────────────────────────────
const Caption: React.FC<{text:string;startFrame:number;duration:number;speaker:"Y"|"M"}> = ({text,startFrame,duration,speaker}) => {
  const frame = useCurrentFrame();
  const elapsed = frame - startFrame;
  if (elapsed < 0 || elapsed >= duration) return null;
  const opacity = interpolate(elapsed, [0,8,duration-8,duration], [0,1,1,0], {extrapolateRight:"clamp"});
  const color = speaker === "Y" ? C.y_cat : C.moggy;
  return (
    <div style={{
      position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",
      opacity,maxWidth:900,textAlign:"center",padding:"18px 36px",
      background:"rgba(0,0,0,0.75)",backdropFilter:"blur(10px)",
      borderRadius:12,border:`1px solid ${color}30`,
      fontSize:20,color:C.white,fontFamily:"JetBrains Mono,monospace",
      fontWeight:600,textShadow:"0 2px 8px rgba(0,0,0,0.8)",
    }}>
      {text}
    </div>
  );
};

// ─── 12 Scene Types ──────────────────────────────────────────────────────────
// Each scene: Pure CSS/SVG effect on top of <Img> background

const SpeakerScene: React.FC<{speaker:"Y"|"M";theme:string}> = ({speaker,theme}) => {
  const frame = useCurrentFrame();
  const avatarColor = speaker === "Y" ? C.y_cat : C.moggy;
  const name = speaker === "Y" ? "Y貓" : "momo";
  const scale = interpolate(frame, [0,20], [0.7,1], {extrapolateRight:"clamp",easing:Easing.bezier(0.34,1.56,0.64,1)});
  const y = interpolate(frame, [0,30,60], [30,0,0], {extrapolateRight:"clamp",easing:Easing.bezier(0.34,1.56,0.64,1)});
  return (
    <AbsoluteFill style={{background:C.bg,alignItems:"center",justifyContent:"center"}}>
      <div style={{transform:`scale(${scale}) translateY(${y}px)`,display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
        <div style={{
          width:160,height:160,borderRadius:"50%",background:`${avatarColor}20`,
          border:`3px solid ${avatarColor}`,display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:`0 0 40px ${avatarColor}60`,
        }}>
          <div style={{fontSize:60,color:avatarColor,fontWeight:700}}>{name[0]}</div>
        </div>
        <div style={{fontSize:28,color:avatarColor,fontWeight:700,letterSpacing:4}}>{name}</div>
      </div>
      <div style={{
        position:"absolute",width:200,height:200,borderRadius:"50%",
        border:`2px solid ${avatarColor}30`,opacity:interpolate(frame,[0,40,80],[0.8,0.3,0.8],{extrapolateRight:"clamp"}),
      }} />
    </AbsoluteFill>
  );
};

const NewsScene: React.FC<{text:string}> = ({text}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0,15], [0,1], {extrapolateRight:"clamp"});
  const redPulse = interpolate(frame, [0,30,60], [0,1,0], {extrapolateRight:"clamp"});
  return (
    <AbsoluteFill style={{background:"#0a0000"}}>
      <div style={{position:"absolute",inset:0,background:`rgba(220,38,38,${0.15 + redPulse*0.1})`,pointerEvents:"none"}} />
      <div style={{
        position:"absolute",top:0,left:0,right:0,padding:"16px 24px",
        background:"#dc2626",display:"flex",alignItems:"center",gap:12,
      }}>
        <div style={{width:12,height:12,borderRadius:"50%",background:C.white,animation:"none"}} />
        <div style={{fontSize:18,color:C.white,fontWeight:900,letterSpacing:3}}>BREAKING NEWS</div>
      </div>
      <div style={{position:"absolute",top:80,left:0,right:0,bottom:120,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:40}}>
        <div style={{
          opacity,fontSize:48,color:C.accent,fontWeight:900,textAlign:"center",
          textShadow:`0 0 30px ${C.accent}`,lineHeight:1.2,
          borderLeft:`6px solid ${C.accent}`,paddingLeft:20,
        }}>
          {text.slice(0,40)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// (AngerScene, SpeedScene, PastMacauScene, etc. — similar CSS/SVG pattern)

// ─── Scene Picker ─────────────────────────────────────────────────────────────
// CRITICAL: This is where <Img> is wired to show AI images as background layer

const SceneForTheme: React.FC<{theme:string;text:string;speaker:"Y"|"M";segIdx:number}> = ({theme,text,speaker,segIdx}) => {
  const imgFile = SEGMENT_IMAGES[segIdx];
  return (
    <AbsoluteFill>
      {/* AI-generated background image — full frame, 55% opacity */}
      {imgFile && (
        <Img
          src={staticFile(`images/${imgFile}`)}
          style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.55}}
        />
      )}
      {/* Scene content overlay on top */}
      <div style={{position:"absolute",inset:0}}>
        {(() => {
          switch(theme) {
            case "speaker": return <SpeakerScene speaker={speaker} theme={theme} />;
            case "news":    return <NewsScene text={text} />;
            case "anger":   return <AngerScene text={text} />;
            case "speed":   return <SpeedScene text={text} />;
            case "past":    return <PastMacauScene text={text} />;
            case "broken-window": return <BrokenWindowScene text={text} />;
            case "phone":   return <PhoneScene text={text} />;
            case "infrastructure": return <InfraScene text={text} />;
            case "legal":   return <LegalScene text={text} />;
            case "memorial":return <MemorialScene text={text} />;
            case "appeal":  return <AppealScene text={text} />;
            case "license": return <LicenseScene text={text} />;
            default:        return <DefaultScene text={text} />;
          }
        })()}
      </div>
    </AbsoluteFill>
  );
};

// ─── Main Composition ────────────────────────────────────────────────────────
export const MyComposition: React.FC = () => {
  return (
    <AbsoluteFill style={{background:C.bg}}>
      {/* Audio tracks */}
      {SEGMENTS.map((seg) => (
        <Sequence key={`audio-${seg.idx}-${seg.speaker}`} from={seg.startF} durationInFrames={seg.durF}>
          <Audio src={staticFile(`audio/seg_${String(seg.idx).padStart(2,"0")}_${seg.speaker}.m4a`)} />
        </Sequence>
      ))}

      {/* Visual scenes with transitions */}
      <TransitionSeries>
        {SEGMENTS.map((seg, i) => (
          <TransitionSeries.Sequence key={`seq-${seg.idx}`} durationInFrames={seg.durF}>
            {/* segIdx passed so SceneForTheme can look up the AI image */}
            <SceneForTheme
              theme={THEMES[i] ?? "default"}
              text={seg.text}
              speaker={seg.speaker === "y" ? "Y" : "M"}
              segIdx={seg.idx}
            />
          </TransitionSeries.Sequence>
        ))}
      </TransitionSeries>

      {/* Captions */}
      {SEGMENTS.map((seg) => (
        <Sequence key={`cap-${seg.idx}`} from={seg.startF} durationInFrames={seg.durF}>
          <Caption text={seg.text} startFrame={0} duration={seg.durF} speaker={seg.speaker === "y" ? "Y" : "M"} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
```

## AI Image-to-Segment Mapping

| Segment | startF | Theme | Image File | Overlay Style |
|---------|--------|-------|------------|---------------|
| seg00 | 0 | speaker | seg00_news.png | Avatar, no image |
| seg02 | 934 | news | seg00_news.png | Dark 40% |
| seg06 | 4925 | anger | seg06_anger.png | Red tint 20% |
| seg09 | 8315 | speed | seg09_speed.png | Motion blur |
| seg13 | 13445 | past | seg13_past.png | Sepia 60% |
| seg16 | 16810 | legal | seg16_legal.png | Dark 30% |
| seg22 | 22172 | memorial | seg22_memorial.png | Soft glow |

## Verification Checklist (MUST run before telling user "done")

```bash
cd /tmp/remotion-demo

# 1. Check images exist + non-zero size
ls -la public/images/*.png
# Expected: 6 files, each >50KB

# 2. Check images are referenced in code
grep -c "staticFile.*images" src/Composition.tsx
# Expected: ≥6

# 3. Render still at each key segment
for frame in 934 4925 8315 13445 16810 22172; do
  node_modules/.bin/remotion still src/index.ts MyComp --frame=$frame --log=warn 2>&1 | tail -1
done
# Expected: all say "Rendered 1/1"

# 4. Check file size of output (confirms images were loaded)
ls -lh out/MyComp.png
# Expected: >300KB (means real image data, not solid color)
```