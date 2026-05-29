# Inline SVG Icons — Remotion JSX-Only Visual Richness (2026-05-30)

## Problem

User rejected AI image generation, but JSX-only geometric animations looked empty ("行人、馬路、什麼都沒有"). Lucide React icons installed but appeared invisible on dark backgrounds (`stroke="currentColor"` resolves to near-black on dark bg).

## Solution: Inline SVG Factory

No external dependencies. Each icon is a tiny React functional component using an SVG factory. Stroke color is EXPLICITLY set (not `currentColor`).

```tsx
// src/Composition.tsx — paste near top after imports

// ─── THEME ───────────────────────────────────────────────────────────────────
const EMERALD = '#10b981';
const AMBER   = '#f59e0b';
const DARK    = '#0f172a';
const MID     = '#1e293b';
const LIGHT   = '#f8fafc';
const GLOW    = '#34d399';
const ROAD    = '#334155';
const STRIPE  = '#f1f5f9';

// ─── SVG ICON FACTORY ─────────────────────────────────────────────────────────
const S = ({d,w=24,h=24,fill="none",stroke=LIGHT,sw=2}:{d:string;w?:number;h?:number;fill?:string;stroke?:string;sw?:number}) =>
  <svg width={w} height={h} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>;

// Essential icons (stroke=LIGHT for visibility on dark bg)
const IconCar      = () => <S d="M7 17a2 2 0 1 0 4 0a2 2 0 0 0-4 0m10 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0M5 9l1-5h12l1 5M5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4m14 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4M5 9v4m14-4v4M8 9v4m4-4v4" stroke={LIGHT}/>;
const IconAlert    = () => <S d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4m0 4h.01" stroke={LIGHT}/>;
const IconCircle   = () => <S d="M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0-20 0" fill="currentColor" stroke="none"/>; // filled = no stroke needed
const IconChevronR = () => <S d="M9 18l6-6-6-6" stroke={AMBER}/>;
const IconDollar   = () => <S d="M12 1v22m5-18H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke={AMBER}/>;
const IconBuilding = () => <S d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 13v.01M9 17v.01M9 21v.01" stroke={LIGHT}/>;
const IconPhone    = () => <S d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" stroke={AMBER}/>;
const IconCard     = () => <S d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM1 10h22" stroke={AMBER}/>;
const IconLandmark = () => <S d="M3 21l9-18 9 18M12 12h.01" stroke={LIGHT}/>;
const IconBarChart = () => <S d="M12 20V10m6 10V4M6 20v-4" stroke={EMERALD}/>;
const IconGlobe    = () => <S d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0M3 12h18M12 3a9 9 0 0 1 0 18" stroke={LIGHT}/>;
const IconLock     = () => <S d="M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4" stroke={EMERALD}/>;
const IconEye      = () => <S d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zm11 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" stroke="#ef4444"/>; // red for danger/eye icon
const IconShield   = () => <S d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={GLOW}/>;
const IconUsers    = () => <S d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 0a4 4 0 0 0 0-8m4 10v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0 0 8" stroke={LIGHT}/>;
const IconActivity = () => <S d="M22 12h-4l-3 9L9 3l-3 9H2" stroke={AMBER}/>;
const IconZap      = () => <S d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={AMBER}/>;
const IconTimer    = () => <S d="M12 6v6l4 2M22 12A10 10 0 1 1 12 2a10 10 0 0 1 10 10z" stroke={AMBER}/>;
const IconMail     = () => <S d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zm16 2l-8 5-8-5" stroke={AMBER}/>;
const IconStar     = () => <S d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill={AMBER} stroke="none"/>; // filled star
const IconMsg      = () => <S d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={AMBER}/>;
const IconSettings = () => <S d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm9.4-3.4l-2.1-1.2a5.5 5.5 0 0 0 0-6.8l2.1-1.2a1 1 0 0 0-.4-1.6l-2.3-.9a1 1 0 0 0-1.2.3l-1.5 2.4a5.5 5.5 0 0 0-6.3 0L5.6 4.2a1 1 0 0 0-1.2-.3l-2.3.9a1 1 0 0 0-.4 1.6l2.1 1.2a5.5 5.5 0 0 0 0 6.8L2.1 15.8a1 1 0 0 0 .4 1.6l2.3.9c.4.1.8 0 1.2-.3l1.5-2.4a5.5 5.5 0 0 0 6.3 0l1.5 2.4c.3.4.8.5 1.2.3l2.3-.9a1 1 0 0 0 .4-1.6z" stroke={AMBER}/>;
```

## Custom SVG Components (Scene-Specific)

Beyond icons, custom SVG components for scene realism:

```tsx
// Road with dashed center line
function Road({y=540}: {y?:number}) {
  return (
    <div style={{position:'absolute',left:0,right:0,bottom:y,height:120,background:ROAD}}>
      <div style={{position:'absolute',top:58,left:0,right:0,height:4}}>
        {Array.from({length:40}).map((_,i)=>(
          <div key={i} style={{
            position:'absolute',left:`${i*2.5}%`,width:'1.5%',height:'100%',
            background:STRIPE,borderRadius:2
          }}/>
        ))}
      </div>
    </div>
  );
}

// Zebra crossing stripes
function ZebraCrossing({y=540}: {y?:number}) {
  return (
    <div style={{position:'absolute',left:0,right:0,bottom:y,height:120,background:ROAD}}>
      {Array.from({length:8}).map((_,i)=>(
        <div key={i} style={{
          position:'absolute',left:`${5+i*11.5}%`,top:20,
          width:45,height:80,background:STRIPE,borderRadius:3
        }}/>
      ))}
    </div>
  );
}

// Walking pedestrian
function PedestrianSVG({x,y,scale=1,color=LIGHT}: {x:number;y:number;scale?:number;color?:string}) {
  return (
    <svg style={{position:'absolute',left:x,top:y,transform:`scale(${scale})`,transformOrigin:'top left'}} width="60" height="90" viewBox="0 0 60 90">
      <circle cx="30" cy="12" r="10" fill={color}/>
      <line x1="30" y1="22" x2="30" y2="55" stroke={color} strokeWidth="4" strokeLinecap="round"/>
      <line x1="30" y1="32" x2="15" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="32" x2="45" y2="45" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="55" x2="20" y2="85" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <line x1="30" y1="55" x2="40" y2="85" stroke={color} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}

// Car (SVG, directional)
function CarSVG({x,y,scale=1,color=LIGHT,direction='right'}: {x:number;y:number;scale?:number;color?:string;direction?:string}) {
  const flip = direction==='left' ? 'scale(-1,1)' : '';
  return (
    <svg style={{position:'absolute',left:x,top:y,transform:`scale(${scale}) ${flip}`,transformOrigin:'top left'}} width="120" height="70" viewBox="0 0 120 70">
      <rect x="5" y="25" width="110" height="35" rx="8" fill={color}/>
      <rect x="20" y="10" width="65" height="22" rx="6" fill={color}/>
      <rect x="28" y="14" width="20" height="14" rx="3" fill="#1e293b" opacity={0.7}/>
      <rect x="55" y="14" width="20" height="14" rx="3" fill="#1e293b" opacity={0.7}/>
      <circle cx="25" cy="60" r="10" fill="#1e293b"/>
      <circle cx="25" cy="60" r="5" fill="#64748b"/>
      <circle cx="95" cy="60" r="10" fill="#1e293b"/>
      <circle cx="95" cy="60" r="5" fill="#64748b"/>
    </svg>
  );
}

// Group of pedestrians
function PedestrianGroup({count=3}: {count?:number}) {
  return (
    <div style={{position:'absolute',left:100,bottom:660,display:'flex',gap:40}}>
      {Array.from({length:count}).map((_,i)=>(
        <PedestrianSVG key={i} x={i*90} y={0} scale={0.8+i*0.05} color={i%2===0 ? LIGHT : AMBER}/>
      ))}
    </div>
  );
}

// Floating particles
function FloatingParticles({count=20,color=EMERALD}: {count?:number;color?:string}) {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
      {Array.from({length:count}).map((_,i)=>{
        const size = 4 + (i%5)*2;
        const x = (i*137.5)%100;
        const y = (i*73.3)%100;
        return (
          <div key={i} style={{
            position:'absolute',left:`${x}%`,top:`${y}%`,
            width:size,height:size,borderRadius:'50%',background:color,
            opacity:0.3,boxShadow:`0 0 ${size*2}px ${color}`,
          }}/>
        );
      })}
    </div>
  );
}

// Bar chart
function ChartBars({x,y,width=200,height=120,values=[60,80,55,90,70]}: {x:number;y:number;width?:number;height?:number;values?:number[]}) {
  const max = Math.max(...values);
  return (
    <svg style={{position:'absolute',left:x,top:y}} width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {values.map((v,i)=>{
        const barH = (v/max)*height*0.9;
        const barW = (width/values.length)*0.7;
        const bx = (width/values.length)*i + (width/values.length - barW)/2;
        const by = height - barH;
        return <rect key={i} x={bx} y={by} width={barW} height={barH} fill={i%2===0?EMERALD:AMBER} rx="4"/>;
      })}
    </svg>
  );
}
```

## Key Pitfalls Fixed (2026-05-30)

1. **Icons invisible** — `stroke="currentColor"` on dark bg → use `stroke={LIGHT}` explicitly
2. **Python string replacement failure** — `sed -i ''` on macOS didn't handle the `'#ef4444'` quotes in `<Eye size={20} color="#ef4444"/>`. Solution: use Python byte-level replacement with explicit hex bytes: `old_bytes = b'<Eye size={20} color="#ef4444"/><span style={{color:\'#ef4444\',fontSize:14}}>\xe4\xb8\x8d\xe5\x8f\xaf\xe8\xa6\x8b</span>'`
3. **Duplicate React import** — When patching multiple times, `import React from 'react'` gets duplicated. Always verify with `npx tsc --noEmit` after patching.
4. **Scene data arrays with flat()** — Use flat array directly to avoid TypeScript complexity with `.flat()` on typed arrays.

## File Size Sanity Check

After render:
```bash
ffprobe -v quiet -show_entries stream=nb_frames,r_frame_rate -of csv=p=0 out/demo.mp4
# 180/181 = 180 frames at 30fps = correct
ls -lh out/demo.mp4
# 282KB for 180 frames at 1280x720 = suspiciously small
# Extract and check a frame:
ffmpeg -i out/demo.mp4 -vf "select=eq(n\,30)" -frames:v 1 /tmp/scene30.jpg 2>/dev/null
file /tmp/scene30.jpg
# If ~21KB: frame IS rendering but content may be very dark
```