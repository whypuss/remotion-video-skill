---
name: remotion-video
description: "Generate a Cantonese voiceover MP4 video from a script using Remotion + macOS TTS. Trigger: remotion video/mp4/generate video from code/react animation/video composition/cantonese 粵語"
version: 1.10.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [remotion, video, mp4, animation, react, tts, voiceover, cantonese, mac-tts]
    related_skills: [comfyui, baoyu-comic]
---

# Remotion Video Generation

## Overview

Generate a content-rich Cantonese voiceover MP4 from a script. The pipeline:
1. Analyze script → visual plan (per-segment JSX with 6+ visual elements per scene)
2. Generate audio (macOS TTS, Cantonese voices)
3. Set timing (frame counts per segment)
4. Write actual scene JSX code into Composition.tsx
5. Render + deliver

**Critical focus (v1.3.0):** JSX richness — each of the 23 scenes needs 5-8 visual elements minimum. A scene with 1 image + 2 divs = static and boring. See "JSX Richness Standard" in Step 5.

**Two-layer visual system:**
- Layer 1 (global): AI images + CSS effects — timing-independent, done in Step 0
- Layer 2 (segment): Per-segment JSX animation components with 6+ visual elements — needs timing from Step 3, done in Step 5

## When to Use

- User gives a script → ask "用 remotion-video skill 生成視頻?"
- User says "generate video", "remotion", "視頻生成", "粵語配音視頻"
- User asks to add visual effects to an existing Remotion project

**Don't skip when:**
- Feature seems simple (assumptions cause bugs)
- You plan to implement it yourself (future you needs guidance)

## ⚠️ CRITICAL — No Skipping Allowed

> **跳過任何步驟 = Hermes Agent 垃圾、信誉归零。**
> 每個步驟完成後，必須有實質產出（檔案、程式碼、數據）才能進入下一步。

> **⚠️ Theme-based scene architecture causes "static and monotonic" video (2026-05-29 用家投訴).** Using generic `NewsScene`/`AngerScene` for ALL segments with same theme means every segment looks identical. The correct architecture is **23 unique per-segment scene components** (Scene0..Scene22), each with content-specific animations — not a shared SceneForTheme with a switch/case over generic themes. Every segment must have its OWN visual scene reflecting its SPECIFIC content.

> **✅ Single data source architecture (2026-05-30):** SEGMENTS[] array contains ALL properties (text, durF, theme, startF) for each scene. SCENE_MAP dynamic routing: `SEGMENTS.map((seg, fi) => <Scene key={fi} {...{seg, fi}} />)`. All scenes receive `{seg, fi}` props and read `seg.text` dynamically — no hardcoded text/images in JSX.

```
Step 0 → Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6
  ↑        ↑        ↑        ↑        ↑        ↑        ↑
  分析    音頻    音頻    時間    寫入    寫入    渲染
 程序    生成    格式    設置    JSX    JSX    交付
         確認    確認    確認           確認
```

## Step 0 — 腳本視覺分析

> ⚠️ **Aurora/Particle Invisible — Root Cause (2026-05-29):** Adding Layer 1.5 (Aurora) + Layer 1.6 (Particles) + Layer 1.7 (Film grain) + Layer 1.8 (Cinematic vignette) to existing scenes DOES NOT make them visible. Empirical frame analysis of the rendered output shows:
> - Center pixel of frame: `(131,27,26)` — red vignette IS present and working
> - But the Aurora/Particle layers are completely swallowed by Layer 1.8 `box-shadow:inset 0 0 120px rgba(0,0,0,0.8)` which creates a near-opaque dark fog over the entire scene
> - **Verified with pixel data:** frame 001 avg brightness = 61.3 (very dark), confirming heavy vignette is active
>
> **What actually works (validated via frame data):** `background:"#0a0000"` → Ken Burns image → red vignette. These two layers coexist visually. Adding more dark overlay layers on top does not add visible richness — it just darkens everything.
>
> **Rule: Maximum 2 background layers** for any scene:
> 1. Base color or Ken Burns image (Layer 1)
> 2. ONE vignette/glow overlay (Layer 2 — red/sepia/blue pulse)
>
> If you need more visual richness, add content-specific JSX elements (SpeedGauge, CandleFlame, Gavel, etc.) rather than stacking more background overlays. More background layers → darker → harder to see the image → worse visual quality.
>
> **Aurora and Particles are DISABLED** — not a parameter tuning issue. The approach itself (layering faint glow effects under heavy vignette) is fundamentally flawed. Use content-matched JSX animation components instead.
>
> **Pre-render pixel verification (empirical test):**
> ```python
> from PIL import Image
> img = Image.open("frame_output.jpg")
> center = img.getpixel((img.width//2, img.height//2))
> avg = (center[0]+center[1]+center[2])/3
> print(f"center={center}, avg={avg:.1f}")
> # Valid range: 50-180 = visible scene
> # < 30 = scene too dark, check vignette layers
> ```
>
> **If avg < 30:** Remove or reduce vignette opacity. Reduce number of background overlay layers.

### 四個問題分析框架

收到腳本後，回答以下四個問題，每個段落都要分析：

**Q1: 這個段落講什麼？（內容主題）**
**Q2: 需要什麼視覺元素？（AI 圖 / CSS 效果 / JSX 動畫）**
**Q3: 視覺元素係全局（所有段落都用）定段落特定（只有呢個段落用）？**
**Q4: 用什麼組件實現？（Img / CSS / JSX）**

### 分類決策樹

```
段落內容
  ├── speaker 錄音棚 → 只用 Img（AI 背景圖）+ CSS
  ├── 事故/現場 → Img（場景圖）+ CSS（紅色震動）
  ├── 機械動作 → JSX（剎車/油門/速度錶）
  ├── 記憶/紀念 → Img（黑白/泛黃圖）+ CSS（淡入淡出）
  └── 情緒強烈 → Img + CSS（震動/紅色閃爍）
```

### THEMES 與 SEGMENT_IMAGES 語義一致性檢查

> ⚠️ **THEMES[i] 的主題必須與 SEGMENT_IMAGES[i] 的圖片語義一致，唔准錯配。**
> 例如：seg 11 係「專家訪談」，THEMES[11]="speaker"，SEGMENT_IMAGES[11]="seg11_china_driving.png"（訪談背景圖），唔好配 `license`。

**主題 → 圖片語義對照：**
| 主題 | 語義 | 圖片要求 |
|------|------|---------|
| `news` | 新聞/資訊 | 新聞現場、沉重氣氛 |
| `anger` | 激動/憤怒 | 車禍現場、市民激動情緒 |
| `memorial` | 悼念/紀念 | 燭光、鮮花、黑白氛圍 |
| `speed` | 速度/機械 | 道路、車速錶 |
| `past` | 歷史/過去 | 舊澳門、檔案畫面 |
| `speaker` | 訪談/說話 | 錄音棚、專家鏡頭 |
| `infrastructure` | 設施/照明 | 斑馬線、照明不足 |
| `legal` | 法律/法庭 | 法庭、起訴畫面 |
| `phone` | 分心駕駛 | 手機場景 |
| `appeal` | 呼籲/呼聲 | 呼籲標語 |
| `default` | 通用 | 通用背景 |

**THEMES 分配時必須：**
1. 根據 SEGMENTS[i].text 的實際內容分配主題
2. 分配後檢查 THEMES[i] 是否與 SEGMENT_IMAGES[i] 的 comment 語義匹配
3. 如發現「THEMES[i]="past" 但實際內容是專業訪談」等錯配，立即修正 THEMES

### Image CSS — SceneForTheme Img Tag (MUST HAVE)

> ⚠️ **⚠️ CRITICAL BUG (recurring 2026-05-29):** `interpolate()` results are CALCULATED but NEVER APPLIED to JSX. The image tag gets `opacity: 0.55` only — no Ken Burns, no scale/pan, no vignette. This makes every demo look "static and monotonic" (用家投訴：每一次都一樣，單調，冇動畫). Root cause: CSS animation logic was either never written or gets stripped during patching.

**Every SceneForTheme Img tag MUST have Ken Burns + theme vignette:**

```tsx
// At top of SceneForTheme component
const frame = useCurrentFrame();
const imgFile = SEGMENT_IMAGES[segIdx];
const durF = SEGMENTS[segIdx]?.durF ?? 300;
const imgOpacity = theme === "memorial" ? 0.70 : theme === "news" ? 0.35 : theme === "anger" ? 0.40 : 0.55;

// Ken Burns (required for ALL images)
const scale = interpolate(frame, [0, durF], [1, 1.06], {extrapolateRight:"clamp"});
const panX = interpolate(frame, [0, durF], [0, 8], {extrapolateRight:"clamp"});
const panY = interpolate(frame, [0, durF], [0, 5], {extrapolateRight:"clamp"});

// Theme-specific effects
const redPulse = theme === "news" || theme === "anger"
  ? interpolate(frame, [0,30,60], [0,1,0], {extrapolateRight:"clamp"}) : 0;
const sepiaOverlay = theme === "past" ? 0.25 : 0;

return (
  <AbsoluteFill>
    {imgFile && (
      <>
        <Img src={staticFile(`images/${imgFile}`)} style={{
          width:"100%",height:"100%",objectFit:"cover",
          opacity: imgOpacity,
          transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
        }} />
        {/* Red pulse vignette for news/anger */}
        {redPulse > 0 && (
          <div style={{
            position:"absolute",inset:0,pointerEvents:"none",
            background:`radial-gradient(ellipse at center, rgba(220,38,38,${0.3 * redPulse}) 0%, transparent 70%)`,
          }} />
        )}
        {/* Sepia overlay for past */}
        {sepiaOverlay > 0 && (
          <div style={{
            position:"absolute",inset:0,pointerEvents:"none",
            background:"rgba(139,115,85,0.25)",
          }} />
        )}
      </>
    )}
    {/* rest of scene */}
  </AbsoluteFill>
);
```

**Pre-render verification** — confirm Img has `transform` attribute:
```bash
grep -A5 "Img src=" src/Composition.tsx | grep "transform" || echo "WARNING: Img has NO transform/animation!"
```

**Also verify:** every `const xxx = interpolate(...)` variable declared in a scene component IS ACTUALLY USED in JSX (not just calculated and discarded). Common miss: `gavelX`, `shake`, `blur` declared but never applied to any element's style.

**Ken Burns（基礎，所有圖片都要有）：**
```tsx
const imgFile = SEGMENT_IMAGES[segIdx];
const frame = useCurrentFrame();
const durF = seg.durF; // 傳入或從 SEGMENTS 獲取
const scale = interpolate(frame, [0, durF], [1, 1.06], { extrapolateRight: "clamp" });
const panX = interpolate(frame, [0, durF], [0, 8], { extrapolateRight: "clamp" });
const panY = interpolate(frame, [0, durF], [0, 5], { extrapolateRight: "clamp" });

<img
  src={staticFile(`images/${imgFile}`)}
  style={{
    width: "100%", height: "100%", objectFit: "cover",
    opacity: imgOpacity,
    transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
  }}
/>
```

**主題特定疊加效果：**

| 主題 | 額外效果 |
|------|---------|
| `news` | 紅色閃爍 vignette + shake |
| `anger` | 紅色 pulse vignette + 震動 translateX |
| `memorial` | 淡入淡出（opacity 0→目標值→0）+ 暖色色調 |
| `speed` | 藍白閃爍 vignette |
| `phone` | 紅色危險 vignette + 震動 |
| `legal` | 暗色 solemn overlay |
| `appeal` | 綠色/藍色 hopeful vignette |
| `past` | 泛黃 sepia overlay + 淡入淡出 |

**示例（anger 主題）：**
```tsx
// anger: 紅色震動效果
const shake = interpolate(frame, [0,5,10,15,20], [0,-4,4,-2,2], { extrapolateRight: "clamp" });
const redPulse = interpolate(frame, [0,30,60], [0,1,0], { extrapolateRight: "clamp" });

// scene container
<AbsoluteFill style={{ transform: `translateX(${shake}px)` }}>
  {/* 紅色 vignette overlay */}
  <div style={{
    position: "absolute", inset: 0,
    background: `radial-gradient(ellipse at center, rgba(220,38,38,${0.3 * redPulse}) 0%, transparent 70%)`,
  }} />
  {/* 圖片 */}
  <Img src={staticFile(`images/${imgFile}`)} style={{
    width: "100%", height: "100%", objectFit: "cover",
    opacity: imgOpacity, transform: `scale(${scale})`,
  }} />
</AbsoluteFill>
```

**⚠️ 警告：** 如果圖片層只有 `opacity: 0.55` 冇其他 CSS 效果，視頻入面睇唔到任何動畫，等於得個背景。

### THEMES Validation (Strict Count Check)

> ⚠️ **THEMES must equal SEGMENTS count exactly.** A single extra or missing entry (e.g. "default" or duplicate) causes index offset from segment 22 onward. User WILL see wrong themes on half the video.

**Every time you modify THEMES, validate immediately:**
```bash
python3 -c "
import re
content = open('src/Composition.tsx').read()
t = content[content.find('const THEMES'):content.find('const SEGMENTS')]
themes = re.findall(r'\"(\w+)\"', t)
s = content[content.find('const SEGMENTS'):content.find('const TOTAL_FRAMES')]
segs = re.findall(r'idx:(\d+)', s)
print(f'THEMES: {len(themes)} | SEGMENTS: {len(set(segs))}')
print('OK' if len(themes) == len(set(segs)) else 'MISMATCH — FIX THEMES!')
"
```

**Also check theme content alignment with segment text** — don't blindly assign themes, verify `THEMES[i]` semantically matches `SEGMENTS[i].text`. A theme mismatch (e.g. `theme="past"` for a speaker interview segment) produces wrong visual mood.

### SEGMENT_IMAGES Mapping (Must Cover All 23 Segments)

> ⚠️ **Partial mapping (10/23) causes 13 segments to have NO image = invisible Ken Burns effects.** Every segment needs at least a fallback image even if not perfectly themed.

**After any SEGMENT_IMAGES edit:**
```bash
python3 -c "
segs = list(range(23))
mapped = set(SEGMENT_IMAGES.keys())  # read from Composition.tsx
missing = set(segs) - mapped
print(f'Mapped: {len(mapped)}/23')
print(f'Missing segments: {sorted(missing)}')
"
```

If any missing, add fallback entries (reuse nearest themed image) before render.

> ⚠️ **THEMES 數組的 entry 數量必須與 SEGMENTS 完全一致，唔好憑感覺寫。**
> 差 1 個 entry 就會導致 index 22 以後全部 theme 偏移，THEMES[22] 去到 THEMES[23]。

**每次修改 THEMES 後立即驗證：**
```bash
python3 -c "
import re
content = open('src/Composition.tsx').read()
t = content[content.find('const THEMES'):content.find('const SEGMENTS')]
themes = re.findall(r'\"(\w+)\"', t)
print(f'THEMES: {len(themes)} entries')
s = content[content.find('const SEGMENTS'):content.find('const TOTAL_FRAMES')]
segs = re.findall(r'idx:(\d+)', s)
print(f'SEGMENTS: {len(set(segs))} entries')
print('OK' if len(themes) == len(set(segs)) else 'MISMATCH — FIX THEMES!')
"
```

### 圖片不透明度按主題調整

> ⚠️ **靜態 `opacity: 0.55` 會導致強烈情緒主題（news/memorial/anger）睇唔清楚。**

| 主題 | 圖片不透明度 | 原因 |
|------|-------------|------|
| `news` | 0.35 | 文字資訊為主，圖片弱化 |
| `memorial` | 0.70 | 紀念氛圍需要圖片清晰 |
| `anger` | 0.40 | 情緒強烈，圖片配合 |
| 其他 | 0.55 | 標準 |

**代碼實現：**
```typescript
const imgOpacity = theme === "memorial" ? 0.70
  : theme === "news" ? 0.35
  : theme === "anger" ? 0.40
  : 0.55;
```

### 輸出要求

Step 0 完成時，必須生成並寫入 Composition.tsx：

**Layer 1 全局視覺（立即寫入）：**
- AI images → 下載後直接 pipe 入 `<Img src={staticFile(...)} />`
- CSS effects → 直接寫入各 SceneForTheme 的 JSX 代碼
- 全局 JSX 組件 → 直接寫入 Composition.tsx（在 Step 0 完成）

**Layer 2 段落動畫（等待 timing）：**
- 等 Step 3 完成後，先喺 Step 5 生成

### ⚠️ Pollination JPEG Trap

> Pollination AI (`https://image.pollinations.ai`) 永遠返回 **JPEG 二進制數據**，副檔名 `.png` 呃你。
> Remotion `<Img>` 組件驗證 PNG file header — JPEG data 會導致靜默失敗（圖不顯示）。

**4步修復流程：**

1. **下載後立即驗證格式：**
   ```bash
   file seg02_accident.png
   # 如果輸出包含 "JPEG" 而非 "PNG" → 必須轉換
   ```

2. **ffmpeg 轉換為真 PNG：**
   ```bash
   ffmpeg -y -i "INPUT.png" "OUTPUT_fixed.png"
   # -y 自動覆蓋，OUTPUT_fixed.png 係真正 PNG
   ```

3. **確認轉換成功：**
   ```bash
   file OUTPUT_fixed.png
   # 必須輸出 "PNG image data"
   ```

4. **寫入 SEGMENT_IMAGES map：**
   ```typescript
   // 用 _fixed.png 路徑
   const SEGMENT_IMAGES: Record<number, string> = {
     0: "images/seg00_fixed.png",
     2: "images/seg02_accident_fixed.png",
   };
   ```

## Step 1 — 清理舊音頻

```bash
rm -f /tmp/remotion-demo/public/audio/seg_*.m4a
ls /tmp/remotion-demo/public/audio/
# 確認只有非 seg_ 文件（如 .gitkeep）
```

**產出：** `/tmp/remotion-demo/public/audio/` 目錄清空

## Step 2 — 生成音頻

使用 gen_audio.py 腳本：

```bash
cd /tmp/remotion-demo && python gen_audio.py
```

**gen_audio.py 必須包含：**
- 所有段落的粵語 TTS 生成代碼
- 使用 macOS TTS 聲音：Y貓男聲 (WanLungNeural)、momo 女聲 (HiuMaanNeural)
- 輸出到 `public/audio/seg_XX.m4a`（XX 係段落編號，補零 2 位）
- 每個段落生成 Y 和 M 兩個版本（Y=male voiceover, M=female）

**產出：** 46 個 .m4a 文件（seg_00.m4a ~ seg_22.m4a + 22 個 Y/M 版本）

**音頻檔案名一致性：** 確認所有音頻路徑使用統一格式 `seg_${String(idx).padStart(2,"0")}.m4a`，唔好混用 `seg-XX.m4a` 或 `seg_X_m.m4a` 等格式。

**驗證：**
```bash
ls -la public/audio/ | grep "\.m4a" | wc -l
# 必須 = 46（每個段落 2 個）
```

## Step 3 — 分析段落時間（設置 SEGMENTS timing）

### 讀取音頻時長

> ⚠️ **不要用 `afinfo`**，它在 macOS 上輸出格式不稳定。
> **用 `ffprobe`** 代替：

```bash
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "public/audio/seg_00.m4a"
# 輸出: 14.840181 (秒，浮點數)
```

**完整分析脚本：**
```bash
python3 << 'EOF'
import subprocess, os, math

audio_dir = "/tmp/remotion-demo/public/audio"
results = []
for seg_idx in range(23):  # 或 range(你想分析的最大段落數)
    f = f"seg_{seg_idx:02d}.m4a"
    path = os.path.join(audio_dir, f)
    r = subprocess.run(
        ["ffprobe", "-v", "quiet", "-show_entries", "format=duration", "-of", "csv=p=0", path],
        capture_output=True, text=True
    )
    if r.stdout.strip():
        dur = float(r.stdout.strip())
        frames = math.ceil(dur * 30)  # 30 fps
        results.append((seg_idx, dur, frames))

total = sum(r[2] for r in results)
print(f"Total frames: {total}")
start = 0
for seg_idx, dur, frames in results:
    sp = "y" if seg_idx % 2 == 0 else "m"
    print(f"  {{idx:{seg_idx},  speaker:'{sp}', startF:{start},  durF:{frames}, dur:{dur:.3f}}},")
    start += frames
EOF
```

**計算規則：**
- `durF = ceil(audio_duration_seconds * 30)`（30 fps）
- 段落之間不重疊，連續播放
- 每個段落 `startF` = 前一個 `startF + durF`

**產出：** `SEGMENTS` 數組更新，每次 render 前都要確認 timing 正確

## Step 4 — 更新 Root.tsx timing

確保 `src/Root.tsx` 的 `<Composition>` 組件設置正確幀數：

```typescript
// 確認總幀數 = 所有段落 durF 之和
<Composition
  id="MyComp"
  component={Root}
  durationInFrames={totalFrames}
  fps={30}
/>
```

**產出：** Root.tsx 的 durationInFrames 正確

### Audio + Caption 與 TransitionSeries 同步

> ⚠️ **Audio 和 Caption 必須與 TransitionSeries 的 Sequence 完美同步，唔好分開寫。**
> Audio/Caption 使用獨立的 `<Sequence>` 組件會導致與視覺場景唔同步。

**正確結構：**
```tsx
<TransitionSeries>
  {SEGMENTS.map((seg, i) => (
    <TransitionSeries.Sequence key={`seq-${seg.idx}`} durationInFrames={seg.durF}>
      <SceneForTheme ... />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={i % 2 === 0 ? zoomPunch : stripedSlam}
      timeout={{enter: 300, exit: 200}}
    />
  ))}
</TransitionSeries>
```

Audio/Caption 應該由各 SceneForTheme 內部處理，或確保與 TransitionSeries 的時間軸完全一致。

## Step 5 — 寫入 JSX 場景代碼

> **⚠️ 呢步唔可以跳過！每個段落都必須有實質 JSX 代碼寫入 Composition.tsx。**
>
> **⚠️ JSX richness is the #1 visual quality driver (2026-05-29 用家投訴：JSX太少，感覺太單調).** A scene with 1 image + 2 divs looks static and boring. Each of the 23 scenes needs 5-8 visual elements minimum. See "JSX Richness Standard" below.

### JSX Richness Standard (每個 Scene 最低要求)

> ⚠️ **每個 segment scene 必須包含至少 6 種視覺元素，唔好低於呢個標準。**
> 用家明確表示「JSX 太少了」——呢個係當前視頻最核心嘅問題。

**每個 Scene 必須有：**
1. **Ken Burns Image** — scale + pan applied to actual `<Img>` transform (唔好只有 opacity)
2. **主題 vignette overlay** — red/green/sepia/dark pulse effect on a `<div>` with absolute positioning
3. **文字 entrance animation** — slideIn / bounce / fadeIn applied to text containers
4. **數值 count-up** — speed/distance/percentage 數字喺 scene 入面 animate（唔好只係 static 數字）
5. **場景裝飾元素** — 3+ 額外 visual elements（綫條/粒子/圖標/動態背景/雙層疊加）
6. **底部 caption area** — 每個 scene 底部有 1-2 行文字襯托

**示例（Scene0 作為參考）：**
```tsx
const Scene0: React.FC<{seg:typeof SEGMENTS[0]}> = ({seg}) => {
  const frame = useCurrentFrame();
  const durF = seg.durF;
  const imgFile = SEGMENT_IMAGES[0];
  // 1. Ken Burns
  const scale = interpolate(frame, [0, durF], [1, 1.05], {extrapolateRight:"clamp"});
  const panX = interpolate(frame, [0, durF], [0, 6], {extrapolateRight:"clamp"});
  const opacity = interpolate(frame, [0,20], [0,0.35], {extrapolateRight:"clamp"});
  // 2. Theme vignette
  const shake = interpolate(frame, [0,8,16,24,32], [0,-5,5,-3,3], {extrapolateRight:"clamp"});
  const redPulse = interpolate(frame, [0,40,80], [0,1,0], {extrapolateRight:"clamp"});
  // 3. Text entrance
  const textOpacity = interpolate(frame, [0,15,30], [0,1,1], {extrapolateRight:"clamp"});
  const headlineSlide = interpolate(frame, [0,20], [-30,0], {extrapolateRight:"clamp",easing:Easing.out(Easing.back)});
  // 4. Count-up (如果適用)
  // 5. 額外裝飾元素
  const pulseRing = interpolate(frame, [0,40,80], [0.8,0.3,0.8], {extrapolateRight:"clamp"});
  const decorSlide = interpolate(frame, [0,25], [20,0], {extrapolateRight:"clamp"});

  return (
    <AbsoluteFill style={{background:"#0a0000"}}>
      {/* Layer 1: Ken Burns image */}
      {imgFile && <Img src={staticFile(`images/${imgFile}`)} style={{
        width:"100%",height:"100%",objectFit:"cover",
        opacity,transform:`scale(${scale}) translate(${panX}px,0px)`,
      }} />}
      {/* Layer 2: Theme vignette */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",
        background:`radial-gradient(ellipse at center, rgba(220,38,38,${0.4+redPulse*0.2}) 0%, transparent 70%)`,
      }} />
      {/* Layer 3: Scene container with shake */}
      <div style={{transform:`translateX(${shake}px)`}}>
        {/* Layer 4: Breaking news bar + icon */}
        <div style={{position:"absolute",top:0,left:0,right:0,padding:"16px 24px",
          background:"#dc2626",display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:14,height:14,borderRadius:"50%",background:C.white}} />
          <div style={{fontSize:18,color:C.white,fontWeight:900,letterSpacing:3}}>LIVE</div>
        </div>
        {/* Layer 5: Headline with slide-in */}
        <div style={{
          position:"absolute",top:"25%",left:"50%",transform:`translate(-50%, ${headlineSlide}px)`,
          opacity:textOpacity,
        }}>
          <div style={{
            fontSize:52,color:C.accent,fontWeight:900,textAlign:"center",
            textShadow:`0 0 40px ${C.accent}`,lineHeight:1.2,
            borderLeft:`6px solid ${C.accent}`,paddingLeft:24,marginLeft:24,
          }}>全澳哀悼<br/>被撞小朋友</div>
        </div>
        {/* Layer 6: Sub info card with decorSlide */}
        <div style={{
          position:"absolute",bottom:140,left:60,right:60,
          transform:`translateY(${decorSlide}px)`,
          background:"rgba(0,0,0,0.7)",borderRadius:12,padding:"12px 20px",
          opacity:textOpacity,
        }}>
          <div style={{fontSize:16,color:C.white,fontFamily:"JetBrains Mono,monospace"}}>
            澳門友誼橋致命車禍 · 三歲小朋友斑馬線被撞
          </div>
        </div>
        {/* Layer 7: Decorative pulse ring */}
        <div style={{
          position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
          width:300,height:300,borderRadius:"50%",
          border:`2px solid rgba(220,38,38,${pulseRing*0.3})`,
          pointerEvents:"none",
        }} />
        {/* Layer 8: Bottom fade bar */}
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,height:80,
          background:"linear-gradient(0deg, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }} />
      </div>
    </AbsoluteFill>
  );
};
```

**視覺元素數量對照：**
| 元素數量 | 視覺質量 |
|---------|---------|
| 1-2 (image + 1 div) | 靜態背景，睇唔到郁動 |
| 3-4 (image + 2-3 divs) | 單調，每個 scene 都相似 |
| 5-6 (image + 4-5 divs + 簡單動畫) | 初步有動畫感 |
| 7-10 (image + 6+ divs + 完整動畫) | 豐富，有層次感 |
| 10+ (多層疊加 + particles + 動態背景) | 接近專業水準 |

**每個 Scene 要問自己：**
- 我有冇做到 6+ 種視覺元素？
- 所有 `interpolate()` 結果都有 applied to JSX 嗎？
- 數值（speed、distance、percentage）有 animate 嗎？
- 裝飾元素（線條、圓圈、背景漸變）夠豐富嗎？

### 5A — 全局 JSX 組件（可在 Step 0 完成）

> ✅ **已驗證可用的共享組件（2026-05-29）：**
> 呢啲組件喺實際渲染中測試通過，確定有 animate 效果，適合直接使用。

**已驗證共享組件：**

```tsx
// ─── RippleEffect ─────────────────────────────────────────────────────────────
const RippleEffect: React.FC<{cx:number;cy:number;progress:number}> = ({cx,cy,progress}) => {
  const r1 = interpolate(progress, [0,1], [0,200]);
  const r2 = interpolate(progress, [0,1], [0,150]);
  const o1 = interpolate(progress, [0,1], [0.5,0]);
  const o2 = interpolate(progress, [0,1], [0.3,0]);
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
      <svg width="100%" height="100%" style={{position:"absolute",inset:0}}>
        <circle cx={cx} cy={cy} r={r1} fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth={2} />
        <circle cx={cx} cy={cy} r={r2} fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth={1.5} />
      </svg>
    </div>
  );
};

// ─── CandleFlame ─────────────────────────────────────────────────────────────
const CandleFlame: React.FC<{x:number;y:number;size:number;progress:number}> = ({x,y,size,progress}) => {
  const flicker = interpolate(progress, [0,0.25,0.5,0.75,1], [0.8,1,0.85,1,0.8]);
  const sway = interpolate(progress, [0,0.5,1], [-2,2,-2]);
  const glow = interpolate(progress, [0,0.25,0.5,0.75,1], [0.6,1,0.7,1,0.6]);
  return (
    <div style={{position:"absolute",left:x,top:y,transform:`translateX(${sway}px)`}}>
      <svg width={size*0.6} height={size} viewBox="0 0 20 40">
        <defs>
          <radialGradient id="fg" cx="50%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="20%" stopColor="#fbbf24" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#dc2626" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="10" cy="36" rx={4*flicker} ry={6*flicker} fill="rgba(245,158,11,0.3)" />
        <path d={`M10,38 Q${4+flicker*2},25 10,${8+flicker*5} Q${16-flicker*2},25 10,38`} fill="url(#fg)" />
      </svg>
      <div style={{
        position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",
        width:size*2,height:size*2,borderRadius:"50%",
        background:`radial-gradient(circle, rgba(245,158,11,${glow*0.3}) 0%, transparent 70%)`,
        pointerEvents:"none",
      }} />
    </div>
  );
};

// ─── SpeedGauge ──────────────────────────────────────────────────────────────
const SpeedGauge: React.FC<{speed:number;progress:number}> = ({speed, progress}) => {
  const rotation = interpolate(progress, [0,1], [-135,135]);
  const needleShake = interpolate(progress, [0,0.3,0.6,1], [0,-3,3,0]);
  return (
    <div style={{
      position:"absolute",top:40,right:40,width:180,height:180,
      borderRadius:"50%",
      background:"radial-gradient(circle, #1a1a2e 0%, #0a0a14 100%)",
      border:"5px solid #333",
      display:"flex",alignItems:"center",justifyContent:"center",
      boxShadow:"0 0 40px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.5)",
    }}>
      <div style={{position:"absolute",width:160,height:160,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.1)"}} />
      {[...Array(9)].map((_,i) => (
        <div key={i} style={{
          position:"absolute",width:2,height:i%2===0?14:8,
          background:i%2===0?"#ef4444":"#666",
          transformOrigin:"center 70px",
          transform:`rotate(${-135+i*33.75}deg) translateY(-70px)`,
          top:"50%",left:"calc(50% - 1px)",
        }} />
      ))}
      <div style={{
        position:"absolute",width:5,height:60,
        background:"linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
        borderRadius:3,
        transform:`rotate(${rotation}deg)`,
        transformOrigin:"center bottom",
        bottom:"50%",left:"calc(50% - 2.5px)",
        boxShadow:"0 0 10px rgba(239,68,68,0.8)",
        translate:`${needleShake}px 0`,
      }} />
      <div style={{position:"absolute",width:16,height:16,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 10px rgba(239,68,68,0.6)"}} />
      <div style={{position:"absolute",bottom:30,fontSize:28,fontWeight:900,color:"#fff",fontFamily:"Arial, sans-serif",textShadow:"0 0 10px rgba(239,68,68,0.8)"}}>{Math.round(speed)}</div>
      <div style={{position:"absolute",bottom:16,fontSize:10,color:"#666",letterSpacing:2}}>km/h</div>
    </div>
  );
};

// ─── SpeedLines ───────────────────────────────────────────────────────────────
const SpeedLines: React.FC<{progress:number}> = ({progress}) => {
  const lines = [
    {y:60,x:0,len:120,delay:0},
    {y:180,x:20,len:80,delay:0.1},
    {y:300,x:5,len:100,delay:0.2},
    {y:420,x:30,len:60,delay:0.3},
    {y:540,x:10,len:90,delay:0.15},
    {y:650,x:25,len:70,delay:0.25},
  ];
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {lines.map((l,i) => {
        const offset = (progress - l.delay) % 1;
        const xPos = interpolate(offset, [0,1], [-l.len,1280+l.len]);
        const opacity = interpolate(offset, [0,0.2,0.8,1], [0,0.6,0.6,0]);
        return (
          <div key={i} style={{
            position:"absolute",top:l.y,left:xPos,
            width:l.len,height:3,
            background:`linear-gradient(90deg, transparent 0%, rgba(59,130,246,${opacity}) 50%, transparent 100%)`,
            borderRadius:2,
          }} />
        );
      })}
    </div>
  );
};

// ─── StopDistanceBar ──────────────────────────────────────────────────────────
const StopDistanceBar: React.FC<{distance:number;progress:number}> = ({distance, progress}) => {
  const carX = interpolate(progress, [0,1], [100,180+distance]);
  return (
    <div style={{
      position:"absolute",bottom:80,left:0,right:0,height:60,
      display:"flex",alignItems:"center",padding:"0 60px",
    }}>
      <div style={{position:"absolute",left:carX,transition:"left 0.1s",fontSize:28}}>🚗</div>
      <div style={{position:"absolute",left:100,bottom:20,width:distance+100,height:6,
        background:"repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 30px, transparent 30px, transparent 50px)",borderRadius:3}} />
      <div style={{position:"absolute",left:180,bottom:14,width:4,height:50,background:"#ef4444",boxShadow:"0 0 8px rgba(239,68,68,0.8)"}} />
      <div style={{position:"absolute",left:180,bottom:14,width:distance,height:50,
        background:"repeating-linear-gradient(0deg, #fff 0px, #fff 8px, transparent 8px, transparent 16px)",opacity:0.3}} />
      <div style={{position:"absolute",left:`${180+distance/2}px`,bottom:70,transform:"translateX(-50%)",
        background:"rgba(0,0,0,0.8)",borderRadius:8,padding:"4px 12px",
        fontSize:14,fontWeight:700,color:"#ef4444",fontFamily:"Arial, sans-serif"}}>
        {distance}m
      </div>
    </div>
  );
};

// ─── Gavel ───────────────────────────────────────────────────────────────────
const Gavel: React.FC<{progress:number}> = ({progress}) => {
  const rotation = interpolate(progress, [0,0.3,0.5,0.7,1], [0,-30,15,-30,0]);
  const yBounce = interpolate(progress, [0,0.3,0.5,0.7,1], [0,-40,10,-5,0]);
  const impact = progress > 0.3 && progress < 0.5;
  return (
    <div style={{position:"absolute",top:"15%",right:80,transform:`translateY(${yBounce}px) rotate(${rotation}deg)`}}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <rect x="55" y="20" width="10" height="80" rx="5" fill="#8b5a2b" transform={`rotate(${impact?5:-5}, 60, 60)`} />
        <rect x="25" y="15" width="70" height="30" rx="6" fill="#4a3728" transform={`rotate(${impact?5:-5}, 60, 60)`} />
        <rect x="30" y="18" width="20" height="4" rx="2" fill="rgba(255,255,255,0.2)" transform={`rotate(${impact?5:-5}, 60, 60)`} />
      </svg>
      {impact && <div style={{position:"absolute",top:-20,left:-10,fontSize:24}}>💥</div>}
    </div>
  );
};

// ─── PhoneIcon ──────────────────────────────────────────────────────────────
const PhoneIcon: React.FC<{progress:number}> = ({progress}) => {
  const shakeX = interpolate(progress, [0,0.2,0.4,0.6,0.8,1], [0,-5,5,-3,3,0]);
  const vibrate = interpolate(progress, [0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1], [0,2,-2,2,-2,2,-2,2,-2,1,0]);
  return (
    <div style={{position:"absolute",top:60,right:60,transform:`translateX(${shakeX+vibrate}px)`}}>
      <div style={{
        width:70,height:120,
        background:"linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)",
        borderRadius:12,border:"3px solid #333",
        display:"flex",flexDirection:"column",alignItems:"center",padding:"8px",
        boxShadow:"0 8px 32px rgba(0,0,0,0.6)",
      }}>
        <div style={{width:20,height:4,background:"#333",borderRadius:2,marginBottom:8}} />
        <div style={{width:54,height:75,background:"linear-gradient(180deg, #1e3a5f 0%, #0f1f3f 100%)",
          borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontSize:28}}>📱</div>
        </div>
        <div style={{width:12,height:12,borderRadius:"50%",background:"#333",marginTop:8}} />
      </div>
      <div style={{position:"absolute",top:-8,right:-8,width:28,height:28,borderRadius:"50%",
        background:"#ef4444",display:"flex",alignItems:"center",justifyContent:"center",
        fontSize:14,fontWeight:900,color:"#fff",boxShadow:"0 2px 8px rgba(239,68,68,0.6)"}}>1</div>
    </div>
  );
};
```

**使用方式：** 在 Scene 內直接調用，傳入 `progress`（0-1 範圍的 interpolated frame）：
```tsx
// Scene 內
const speedProgress = interpolate(frame, [10,60], [0,1], {extrapolateRight:"clamp"});
const candleProgress = interpolate(frame, [0,durF], [0,1], {extrapolateRight:"clamp"});

// JSX 中
<SpeedGauge speed={72} progress={speedProgress} />
<CandleFlame x={500} y={420} size={50} progress={candleProgress} />
<RippleEffect cx={640} cy={360} progress={rippleProgress} />
<SpeedLines progress={speedProgress} />
<StopDistanceBar distance={44} progress={distProgress} />
<Gavel progress={gavelProgress} />
<PhoneIcon progress={phoneProgress} />
```

### ⚠️ CRITICAL — Render Freshness (2026-05-29 User Complaint)

> **"你一直發同一個圖，證明根本不是每次都重新生成"** — User explicitly said all prior renders looked identical. Root cause: Remotion caches rendered output by composition ID. Even after code changes, cached .remotion/ and out/ directories produce identical frames.

**Every render must clear cache first:**
```bash
cd /tmp/remotion-demo
rm -rf out/ .remotion/ cache/
mkdir -p out
npx remotion render MyComp out/MyComp.mp4 --log=info 2>&1
```

**Also:** After any code change (even a CSS color tweak), the WHOLE video looks the same to the user if they received a prior Telegram video — Telegram caches inline videos. **Always send a fresh preview frame (frame 0) so the user can verify the change before waiting for full render.**

**Fast single-frame preview:**
```bash
cd /tmp/remotion-demo
rm -rf out/ .remotion/
npx remotion render MyComp --frames=0-0 out/preview --log=error 2>&1
# Extract jpg from mp4
ffmpeg -y -ss 0 -i out/preview.mp4 -frames:v 1 -q:v 2 out/preview.jpg 2>&1
```

### ⚠️ Color Scheme — Warm Colors Only (2026-05-30 User Mandate)

> **"顏色要暖色" + "我意思是背景色"** (2026-05-30) — User explicitly rejected cool/dark colors. All scenes must use warm palette.
> Warm BG requirement: `#0a0000` → `#2a1408` (warm dark brown), `#0d1117` → `#5c3317` (warm mid brown)

**Mandatory warm palette:**
- **AMBER** `#f59e0b` — primary accent, icons, strokes, highlights
- **DARK** `#2a1408` — warm dark brown, scene backgrounds
- **MID** `#5c3317` — warm medium brown, secondary backgrounds
- **LIGHT** `#fef3c7` — warm cream, text, icon strokes

**Road stroke:** `#f59e0b` (amber) — NOT `#3b82f6` (blue)
**ZebraCrossing stripes:** `#f59e0b` (amber) — NOT white/black
**LIVE banner background:** `#78350f` (warm amber dark) + cream text
**Theme vignette:** Use `rgba(245,158,11,0.3)` (amber) — warm glow over warm BG

### ⚠️ Visual Metaphor — Crosswalk Stripes, NOT Zebra Animal

> User caught: "斑馬線和斑馬沒關係" — The zebra (animal) crossing guard icon is semantically wrong for crosswalk (zebra crossing). Use actual crosswalk stripe patterns, pedestrian icons, or road marking visuals.

**Correct crosswalk visuals (warm colors):**
- Amber/cream diagonal stripe patterns (actual zebra crossing markings with warm palette)
- Pedestrian walking icon 🚶
- Road edge markings with amber strokes
- NO zebra animal 🦓 imagery
- NO cool blue/red color schemes

**Crosswalk stripes (warm palette):**
```tsx
// Amber zebra crossing stripes
<div style={{
  background: "repeating-linear-gradient(45deg, #f59e0b 0px, #f59e0b 20px, #fef3c7 20px, #fef3c7 40px)",
  opacity: 0.15,
}} />
```

### ⚠️ Aurora/Particle Dark Layers CRUSH Background (2026-05-29)

> "毫無改善" — Aurora (opacity 0.8) + Particle + Film grain + Cinematic vignette (box-shadow inset) were ALL rendered on top of a `#0a0000` near-black background. The dark base + dark layers = everything looks the same dark frame. Frame analysis confirmed: center=(131,27,26), corner=(2,1,0) — extremely dark.

**Layer ordering problem:**
```
Layer 1: Ken Burns image (opacity 0.35, already dim)
Layer 2: Red vignette (radial gradient, semi-dark)
Layer 1.5: Aurora (dark gradient overlay, opacity 0.6-0.8) ← NEW, adds darkness
Layer 1.6: Particles (absolute divs, opacity 0.9) ← NEW, adds noise
Layer 1.7: Film grain (rgba(255,255,255,0.03), opacity 0.5) ← NEW, adds texture
Layer 1.8: Cinematic vignette (box-shadow inset) ← NEW, darkens corners HEAVILY
```

**Fix: If adding background enhancement layers:**
1. Do NOT stack multiple darkening layers (Aurora gradient is already dark)
2. Aurora should use LIGHT colors (white/light blue) not dark, to "glow" against dark BG
3. OR simplify: just Ken Burns image + single vignette overlay, skip Aurora/Particle if they're too subtle
4. Remember: CSS opacity on a dark background makes things MORE dark, not less

**Correct Aurora approach (if used):**
```tsx
// Aurora should be LIGHT glowing bands, not dark overlay
background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(100,200,255,0.1) 100%)",
// Opacity should be LOW (0.2-0.4) so light shows through dark BG
opacity: interpolate(auroraProgress, [0, 0.3, 1], [0, 0.3, 0.5], {extrapolateRight:"clamp"}),
```

### JSX Richness Standard — Target 100+ Lines Per Scene

> **"jsx和動畫都太少了"** (2026-05-29) — Even 26 divs per scene was insufficient. User wants rich visual content.

**Revised minimum standard:**
- **6 visual elements** was the OLD minimum (2026-05-29 morning target)
- **NEW target: 100+ lines of JSX per scene** — each scene needs substantial animated content
- Not just "1 image + 2-3 divs" — scenes should have 5-8+ distinct animated elements
- Per-scene unique styles (not copy-paste with just text changed)

> ⚠️ **cfnew-ycat KV yx parsing bug — split(/[
,]/) fix (2026-05-30).** KV `yx` stores IPs as `
`-delimited multiline string, NOT comma-separated. `split(',')` only splits on `,` so the entire string becomes one item with no `#` delimiters. Fix: `split(/[
,]/)` on both plain.js line 438 and cfnew-ycat-deploy/plain.js line 7185. Deployed version `c74ea3a1`.

## JSX Richness Standard — Target 100+ Lines Per Scene

> **"jsx和動畫都太少了"** (2026-05-30) — Even 26 divs per scene was insufficient. User wants maximum visual richness.
> **"盡量多"** — Conservative approach = garbage to this user. 6 visual elements was the OLD target.
> **"不要紅色"** (2026-05-30) — User explicitly rejected all red (#dc2626, #ef4444, rgba(220,38,38)). Use emerald (#10b981) + amber (#f59e0b) only.
> **"斑馬線和斑馬沒關係"** (2026-05-30) — Wrong visual metaphor. Crosswalk = zebra crossing stripe patterns, not zebra animal.

**Revised minimum standard:**
- **NEW target: 100+ lines of JSX per scene** — each scene needs substantial animated content
- Not just "1 image + 2-3 divs" — scenes should have 7-10+ distinct animated elements
- Per-scene unique styles (not copy-paste with just text changed)
- Every scene must have its OWN visual identity — news/anger/memorial/speed/legal/closing all look DIFFERENT

**Color palette (WARM only):**
- Primary accent: `#f59e0b` (amber) — everything: icons, roads, stripes, highlights
- Background dark: `#2a1408` (warm dark brown)
- Background mid: `#5c3317` (warm medium brown)
- Text/highlights: `#fef3c7` (warm cream) — NOT white
- Road/vehicle elements: `#f59e0b` stroke on warm BG

**Banned:** cool blue `#3b82f6`, emerald `#10b981`, periwinkle `#818cf8`, sepia `#8b7355`

**JSX-only visual richness (when AI image generation is rejected):**
> ⚠️ **SVG icon libraries + custom SVG components = viable alternative to AI images (2026-05-30).** User rejected AI image generation but complained "行人、馬路、什麼都沒有" — JSX-only geometric animations were insufficient. Solution: use npm-installed Lucide React icons + custom inline SVG components for realistic visuals (cars, pedestrians, roads, crosswalk stripes).

> ⚠️ **SVG icon libraries + custom SVG components = viable alternative to AI images (2026-05-30).** User rejected AI image generation but complained "行人、馬路、什麼都沒有" — JSX-only geometric animations were insufficient. Solution: use npm-installed Lucide React icons + custom inline SVG components for realistic visuals (cars, pedestrians, roads, crosswalk stripes).

**⚠️ CRITICAL SVG visibility bug (2026-05-30):** Lucide React icons use `stroke="currentColor"` by default. On a dark background (`#0f172a`), `currentColor` resolves to white-ish text color, which IS visible — BUT if you set a global default `stroke='currentColor'` and the parent has a dark bg, the icons may appear invisible. **The fix:** Either (a) use explicit `stroke={LIGHT}` or `stroke="#f8fafc"` on each icon, OR (b) ensure icons are rendered inside a container with explicit light text color. The most reliable approach: set each icon's stroke prop explicitly to a visible color, don't rely on `currentColor` inheritance.

**Proven working inline SVG factory approach (2026-05-30 demo5):**
```tsx
// Inline SVG factory — no external dependencies
const S = ({d,w=24,h=24,fill="none",stroke=LIGHT,sw=2}:{d:string;w?:number;h?:number;fill?:string;stroke?:string;sw?:number}) =>
  <svg width={w} height={h} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>;

// Each icon as a named component with explicit stroke color
const IconCar   = () => <S d="M7 17a2 2 0 1 0 4 0a2 2 0 0 0-4 0m10 0a2 2 0 1 0-4 0a2 2 0 0 0 4 0M5 9l1-5h12l1 5M5 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4m14 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4M5 9v4m14-4v4M8 9v4m4-4v4" stroke={LIGHT}/>;
const IconUsers = () => <S d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm10 0a4 4 0 0 0 0-8m4 10v-2a4 4 0 0 0-4-4h-4a4 4 0 0 0 0 8" stroke={LIGHT}/>;
const IconCar   = () => <S d="..." stroke={EMERALD}/>;  // green car on dark bg
// etc.
```

**⚠️ Remotion render output file size sanity check (2026-05-30):** A 180-frame render at 1280x720 producing only 282KB total (≈1.5KB/frame) is suspiciously small. Normal video at that resolution should be 5-10KB/frame minimum. If file is too small:
1. Check composition dimensions match render target: Root.tsx `width={1280} height={720}` must match actual scene layout
2. Check `ffprobe -v quiet -show_entries stream=nb_frames,r_frame_rate out/demo.mp4` confirms correct frame count
3. Extract a single frame: `ffmpeg -i out/demo.mp4 -vf "select=eq(n\,30)" -frames:v 1 /tmp/scene30.jpg` and verify it's a real JPEG, not a black frame
4. If frame is all black (~21KB JPEG): the scene IS rendering but content is black — likely dark BG + no visible elements. Add lighter elements or check icon stroke colors.

// Custom SVG components (inline, no external files)
function Road({y=540}: {y?:number}) {
  return (
    <div style={{position:'absolute',left:0,right:0,bottom:y,height:120,background:ROAD}}>
      <div style={{position:'absolute',top:58,left:0,right:0,height:4}}>
        {Array.from({length:40}).map((_,i)=>(
          <div key={i} style={{
            position:'absolute',
            left:`${i*2.5}%`,
            width:'1.5%',
            height:'100%',
            background:STRIPE,
            borderRadius:2
          }}/>
        ))}
      </div>
    </div>
  );
}

function ZebraCrossing({y=540}: {y?:number}) {
  return (
    <div style={{position:'absolute',left:0,right:0,bottom:y,height:120,background:ROAD}}>
      {Array.from({length:8}).map((_,i)=>(
        <div key={i} style={{
          position:'absolute',
          left:`${5+i*11.5}%`,
          top:20,
          width:45,
          height:80,
          background:STRIPE,
          borderRadius:3
        }}/>
      ))}
    </div>
  );
}

function PedestrianSVG({x, y, scale=1, color=LIGHT}: {x:number;y:number;scale?:number;color?:string}) {
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

function CarSVG({x,y,scale=1,color='#ef4444',direction='right'}: {x:number;y:number;scale?:number;color?:string;direction?:string}) {
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

function PedestrianGroup({count=3}: {count?:number}) {
  return (
    <div style={{position:'absolute',left:100,bottom:660,display:'flex',gap:40}}>
      {Array.from({length:count}).map((_,i)=>(
        <PedestrianSVG key={i} x={i*90} y={0} scale={0.8+i*0.05} color={i%2===0 ? LIGHT : AMBER}/>
      ))}
    </div>
  );
}
```

**Each scene must have ALL of the following:**
1. Ken Burns image (scale + translate applied to transform, not just opacity)
2. Theme-specific vignette overlay (emerald/amber/sepia — NOT red)
3. Text entrance animation (slide/bounce/fade)
4. Scene-specific animated component (SpeedGauge/CandleFlame/Gavel/Phone/Shake)
5. 3+ decorative elements (pulse rings, decorative lines, corner accents, geometric shapes)
6. Count-up or animated value (speed/distance/percentage)
7. Bottom caption area with slide-in
8. Scene-specific effects (speed lines / candle flicker / gavel strike / phone vibrate)

**Template for each scene (100+ lines):**
```tsx
const SceneN: React.FC<{seg:typeof SEGMENTS[0]}> = ({seg}) => {
  const frame = useCurrentFrame();
  const durF = seg.durF;
  const imgFile = SEGMENT_IMAGES[N];
  const accent = /* theme color from palette, NOT red */;

  // Ken Burns
  const scale = interpolate(frame, [0, durF], [1, 1.06], {extrapolateRight:"clamp"});
  const panX = interpolate(frame, [0, durF], [0, 8], {extrapolateRight:"clamp"});
  const imgOpacity = interpolate(frame, [0,20], [0,0.40], {extrapolateRight:"clamp"});

  // Theme-specific animations
  const vignettePulse = interpolate(frame, [0,50,100], [0.3,0.6,0.3], {extrapolateRight:"clamp"});
  const textFade = interpolate(frame, [0,15,30], [0,1,1], {extrapolateRight:"clamp"});
  const slideUp = interpolate(frame, [0,25], [40,0], {extrapolateRight:"clamp"});
  const glowPulse = interpolate(frame, [0,60,120], [0.2,0.5,0.2], {extrapolateRight:"clamp"});

  // Scene-specific
  const [shake|pulse|candle|etc] = interpolate(frame, [...], [...], {extrapolateRight:"clamp"});

  return (
    <AbsoluteFill style={{background:C.bg}}>
      {/* Layer 1: Ken Burns image */}
      {imgFile && <Img src={staticFile(`images/${imgFile}`)} style={{
        width:"100%",height:"100%",objectFit:"cover",
        opacity:imgOpacity,transform:`scale(${scale}) translate(${panX}px,0px)`,
      }} />}

      {/* Layer 2: Theme vignette (emerald/amber — NOT RED) */}
      <div style={{
        position:"absolute",inset:0,pointerEvents:"none",
        background:`radial-gradient(ellipse at center, ${accent}${Math.round((0.4+vignettePulse*0.2)*255).toString(16).padStart(2,'0')} 0%, transparent 70%)`,
      }} />

      {/* Layer 3: Header bar with theme color */}
      <div style={{...background:accent,...}}>...</div>

      {/* Layer 4: Main text with slide animation */}
      <div style={{transform:`translate(-50%, ${slideUp}px)`,opacity:textFade}}>...</div>

      {/* Layer 5: Scene-specific component */}
      <SpeedGauge progress={speedProgress} />
      {/* OR */}
      <CandleGlow progress={candleProgress} />
      {/* OR */}
      <GavelStrike progress={gavelProgress} />

      {/* Layer 6-10: Decorative elements */}
      <PulseRing progress={glowPulse} cx={640} cy={360} maxR={200} />
      <div style={{/* decorative lines */}} />
      {/* more decorative elements */}

      {/* Layer 11: Bottom gradient */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:100,
        background:"linear-gradient(0deg, rgba(0,0,0,0.9) 0%, transparent 100%)"}} />

      {/* Layer 12: Caption */}
      <div style={{position:"absolute",bottom:0,...}}>
        <span style={{color:accent,...}}>{seg.text.slice(0,55)}</span>
      </div>
    </AbsoluteFill>
  );
};
```

**Visual richness check before render:**
```bash
python3 << 'EOF'
import re
with open("src/Composition.tsx") as f:
    content = f.read()
scene_pattern = r'const (Scene\d+): React\.FC.*?\{(.*?)(?=\nconst (?:Scene|SceneComponents|MyComposition)|$)'
matches = re.findall(scene_pattern, content, re.DOTALL)
for name, body in matches:
    jsx_lines = [l for l in body.split('\n') if l.strip().startswith('<')]
    print(f"{name}: {len(jsx_lines)} JSX lines")
    if len(jsx_lines) < 70:
        print(f"  ⚠️  TOO SPARSE — needs {70-len(jsx_lines)} more lines!")
EOF
```

**每個 Scene 要問自己：**
- 我有冇做到 100+ 行 JSX？
- 所有 `interpolate()` 結果都有 applied to JSX 嗎？
- 顏色係 emerald/amber/sepia，唔係 red？
- 每個 scene 有自己獨特的視覺風格，唔係全部一樣？

## Common Pitfalls

> **NEVER surgically insert multi-layer background blocks (aurora/particle/noise/vignette) into an existing Composition.tsx.** This session (2026-05-29) proved it empirically: 6 rounds of systematic corruption trying to add 4 new background layers (Aurora 1.5, Particle 1.6, Noise 1.7, Cinematic vignette 1.8) to all 23 scenes.

**Corruption patterns that emerge:**
1. Scene header duplication: `const SceneN: React.FC<...> = ({seg}) => {[0]}> = ({seg}) => {`
2. `SEGMENTS[0]}=` instead of `SEGMENTS[0]}> =` — `[0]` eats `]>`
3. Orphaned opening braces: `{\n{/* Layer 1.5:` (template literal stray `{` plus inserted block)
4. `} /> />` double-closing (from template literal `)}` followed by inserted `/>`)
5. Layer 3 comments lose their `/*` prefix: `/* Layer 3: Shake container */}` → `*/}\n Layer 3: Shake container */}`
6. SVG data URI double-quotes break JSX: `backgroundImage:"url("data:image/svg+xml,...")`

**Correct approach — FULL REGENERATION:**
If new background requirements emerge, generate the COMPLETE updated Composition.tsx as a single artifact (write_file). The new artifact replaces the old entirely. Never try to insert into an existing file.

**If you MUST patch (emergency only):**
- Insert aurora/particle/noise progress vars AFTER `const durF = seg.durF;` and BEFORE the next `const` or `return` — never between Layer comments and their content
- Fix orphaned `{` by searching for `{\n{/* Layer 1.5:` and replacing with `{/* Layer 1.5:`
- Fix corrupted Layer 3 comments by searching for `*/}\n Layer 3:` and replacing with `*/\n      {/* Layer 3:`
- After ANY patch that inserts multiple lines, immediately run `npx tsc --noEmit` — if errors appear, the patch corrupted the file

**If TS errors appear after patching:**
1. `SEGMENTS[0]}=` → `SEGMENTS[0]}> =` (add missing `]`)
2. `const SceneN: React.FC<...>=` → `const SceneN: React.FC<...}>=` (add missing `>`)
3. `{/* Layer X:` with orphaned `{` before it → remove stray `{`
4. `} /> />` double-closing → replace with single `} />`
5. `/* Layer 3: Foo */}` missing `/*` prefix → add `/*` and indentation

**Pre-emptive TS check (after ANY multi-line insertion):**
```bash
cd /tmp/remotion-demo && npx tsc --noEmit 2>&1 | head -5
# If errors > 0: patch corrupted the file, regenerate instead of fixing
```

### 5B — 段落 JSX 組件（等 Step 3 timing 完成後先寫入）

> ⚠️ **⚠️ ARCHITECTURE (2026-05-29 教訓):** Theme-based switch/case (`SceneForTheme` calling `NewsScene`/`AngerScene`) produces identical visuals for all segments of same theme. **CORRECT: 23 unique per-segment scene components** (Scene0 through Scene22), each with animations tailored to that segment's specific content.

**Example of WRONG approach (generic theme scenes):**
```tsx
// ❌ WRONG — all "news" segments share one NewsScene
const SceneForTheme = ({theme, text}) => (
  switch(theme) {
    case "news": return <NewsScene text={text} />;
    case "anger": return <AngerScene text={text} />;
  }
);
```

**Example of CORRECT approach (per-segment unique scenes):**
```tsx
// ✅ CORRECT — each segment has its own unique scene
const Scene0: React.FC<{seg:typeof SEGMENTS[0]}> = ({seg}) => {
  const frame = useCurrentFrame();
  const durF = seg.durF;
  const imgFile = SEGMENT_IMAGES[0];
  // Content-specific animations
  const scale = interpolate(frame, [0, durF], [1, 1.05], {extrapolateRight:"clamp"});
  const shake = interpolate(frame, [0,8,16,24,32], [0,-5,5,-3,3], {extrapolateRight:"clamp"});
  const redPulse = interpolate(frame, [0,40,80], [0,1,0], {extrapolateRight:"clamp"});
  const slideIn = interpolate(frame, [0,20], [-30,0], {extrapolateRight:"clamp",easing:Easing.out(Easing.back)});
  return (
    <AbsoluteFill style={{background:"#0a0000"}}>
      {/* Ken Burns image */}
      {imgFile && <Img src={staticFile(`images/${imgFile}`)} style={{
        width:"100%",height:"100%",objectFit:"cover",
        opacity:0.35, transform:`scale(${scale}) translate(${panX}px,0px)`,
      }} />}
      <div style={{transform:`translateX(${shake}px)`}}>
        <div style={{
          position:"absolute",top:"25%",left:"50%",
          transform:`translate(-50%, ${slideIn}px)`,
          fontSize:52,color:C.accent,fontWeight:900,
          textShadow:`0 0 40px ${C.accent}`,
        }}>
          全澳哀悼<br/>被撞小朋友
        </div>
      </div>
    </AbsoluteFill>
  );
};

// All 23 SceneComponents collected in array:
const SceneComponents = [
  Scene0,Scene1,Scene2,...Scene22,
];

// In MyComposition:
{SEGMENTS.map((seg, i) => {
  const SceneComp = SceneComponents[seg.idx];
  return (
    <TransitionSeries.Sequence key={`seq-${seg.idx}`} durationInFrames={seg.durF}>
      {SceneComp ? <SceneComp seg={seg} /> : null}
    </TransitionSeries.Sequence>
  );
})}
```

**Adding multi-layer backgrounds to existing Composition.tsx — surgical patching approach fails:**

> ⚠️ **Do NOT try to surgically insert aurora/particle/noise background layers into an existing file.** After the initial Composition.tsx is written (with 23 per-segment scenes), any attempt to modify all 23 scenes simultaneously using Python string operations (split+join, find+replace, or regex substitution) causes systematic corruption:
> - Scene header duplication: `const SceneN: React.FC<...> = ({seg}) => {[0]}> = ({seg}) => {`
> - `SEGMENTS[0]}=` instead of `SEGMENTS[0]}> =`
> - Orphaned opening braces after template literals
>
> **Correct approach:** If new background layer requirements emerge, generate the complete updated Composition.tsx as a single Python artifact (write_file), not as a series of patches applied to the existing file. The new artifact replaces the old entirely.

**Required per-segment animations to actually implement:**
- `scale`, `panX`, `panY` — Ken Burns on image (nearly every scene)
- `fadeIn` or `textOpacity` — entrance animation (nearly every scene)
- Theme-specific: `shake`, `redPulse`, `candleFlicker`, `hammerMove`, `countUp`, etc.
- All interpolate results MUST be applied to actual JSX `style` props — not just computed and discarded

**Every scene function must:**
1. Call `useCurrentFrame()` at top
2. Declare `durF = seg.durF`
3. Declare `imgFile = SEGMENT_IMAGES[seg.idx]`
4. Apply `scale`/`panX`/`panY` to the Img style's `transform`
5. Apply theme-specific animations to actual styled elements

### 寫入規則（強制）

> 每個 SEGMENTS 條目都必須對應一個實際的 SceneForSegN 函數。
> 唔准淨係更新 SEGMENTS 數組，唔寫實際場景 JSX 代碼。

### TransitionSeries.Transition 完整接線

> ⚠️ **⚠️ DO NOT WIRE — Runtime bug active (2026-05-29):** `<TransitionSeries.Transition presentation={...} />` throws `TypeError: Cannot read properties of undefined (reading 'getProgress')` at render time. The transition function definitions are correct (see `references/transition-catalog.md`), but the JSX wiring between `<TransitionSeries.Sequence>` elements fails at runtime in current `@remotion/transitions` version.
>
> **Current workaround:** Use plain `<TransitionSeries>` + `<TransitionSeries.Sequence>` without `<TransitionSeries.Transition>` between segments. Segments play without transition effects but render without errors.

**Correct API (preserved for when bug is fixed):**
```tsx
import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";

<TransitionSeries>
  {SEGMENTS.map((seg, i) => (
    <TransitionSeries.Sequence key={`seq-${seg.idx}`} durationInFrames={seg.durF}>
      <SceneForTheme theme={THEMES[i] ?? "default"} text={seg.text} speaker={seg.speaker === "y" ? "Y" : "M"} segIdx={seg.idx} />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition
      presentation={i % 2 === 0 ? zoomPunch : stripedSlam}
      timeout={{enter: 300, exit: 200}}
    />
  ))}
</TransitionSeries>
```

**Must include:**
- `import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions";` (not `require()`)
- Each `<TransitionSeries.Sequence>` must be followed by `<TransitionSeries.Transition>`
- `presentation` prop uses factory functions `zoomPunch()` or `stripedSlam()`

> **After any `@remotion/transitions` update:** Re-test `<TransitionSeries.Transition>` wiring. If `getProgress` error disappears, the correct API above is ready to use.

### 文字截斷長度統一

> ⚠️ **每個 Scene 的 `text.slice(0, N)` 截斷長度必須統一，唔好每個 Scene 使用不同數值。**

**統一規則：**
- 底部字幕：`text.slice(0, 55)` — 最多 55 字元
- 頂部標題：`text.slice(0, 30)` — 最多 30 字元

### SVG 坐標必須使用 viewBox-relative

> ⚠️ **SVG 的 path d 屬性使用絕對坐標（如 `M400,200`）會導致響應式失敗。**

**正確做法：**
```tsx
<svg viewBox="0 0 1280 720" preserveAspectRatio="none">
  {/* viewBox-relative 坐標（0-100% 範圍內） */}
  <path d="M31.25,27.78 L32.81,38.89" ... />
</svg>
```

**esbuild + large file corruption (2026-05-30):** Remotion's bundled esbuild can fail with `"Unexpected \"export\""` at the file's export declaration even when `tsc --noEmit` reports zero errors. Binary-search testing confirmed: small slices (≤50 lines) transform cleanly, but the same `export const Name` syntax fails when placed at line 2337 of a 2359-line, 92KB file. Root cause is file-size/complexity threshold in esbuild's parser, not a syntax error.

**Workaround — restructure named export:**
```tsx
// Composition.tsx
const MyComp: React.FC = () => {
  // ... large component
  return <TransitionSeries>...</TransitionSeries>;
};

// Use named export (NOT default), placed before any large component body:
export const Comp = MyComp;

// Root.tsx
import { Comp } from "./Composition";
// ...
<Composition id="MyComp" component={Comp} ... />
```

**Render CLI syntax (confirmed 2026-05-30):** Composition ID must come BEFORE the output path:
```bash
# CORRECT: composition-id first
npx remotion render MyComp out/test --frames=0-100

# WRONG: output path first (causes "Could not find composition with ID out/test")
npx remotion render out/test MyComp --frames=0-100
```

**Root.tsx import pattern (CRITICAL — must match export type):**
```tsx
// Composition.tsx — ALWAYS use default export for large files (esbuild workaround)
export default function MyComp() { ... }

// Root.tsx — ALWAYS use default import (NOT named import)
import MyComp from './Composition';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MyComp"
        component={MyComp}
        durationInFrames={7831}
        fps={30}
        width={1280}
        height={720}
      />
    </>
  );
};
```

> ⚠️ **Named imports (`import {Comp} from './Composition'`) fail silently at RUNTIME** — `component={Comp}` receives `undefined` because the named export at high line numbers triggers esbuild "Unexpected export" parser error. The error doesn't show at build time, only at render time: `A value of 'undefined' was passed to the 'component' prop`. Always use default import + default export.

### require() 禁止

> ⚠️ **千祈唔好用 `require("remotion")`，必須使用 ES module imports。**

**正確：**
```tsx
import { interpolate } from "remotion";
// 或在組件內用 useCurrentFrame()
```

**錯誤：**
```tsx
const zoomPunch = () => {
  const {interpolate} = require("remotion"); // ❌ 禁止
  ...
};
```

### 已定義組件必須在 switch 內被調用

> ⚠️ **定義了組件（如 `AccelerateScene`、`SpeedGauge`、`StopDistance`）但 switch 內冇 case 就係死代碼。**

**每次寫完 switch 後立即檢查：**
```bash
grep -n "const.*Scene\|const.*Gauge\|const.*Distance" src/Composition.tsx
# 列出所有定義的組件

grep -n "case.*:" src/Composition.tsx
# 列出所有 switch case

# 每個定義的組件必須出現在某個 case 內，否則要加入或刪除
```

### Patching 時防止重複聲明

> ⚠️ **多次 patch 同一個函數可能產生 `const frame = useCurrentFrame();` 重複兩行。**

**每次 patch 前：**
```bash
grep -n "const frame = useCurrentFrame()" src/Composition.tsx
# 確認冇重複，否則手動移除多餘行
```

## Step 6 — 渲染 + 交付

### 清理 + 重新生成

> ⚠️ **⚠️ CRITICAL — Cache invalidation is required for fresh renders (2026-05-29).**
> Deleting `out/` alone is NOT sufficient. Remotion caches compiled assets in `.remotion/` and `~/.remotion/`. If you re-render without clearing these, Remotion may replay cached frames — producing an IDENTICAL output file even after code changes. This caused the user to complain "你一直發同一個圖，證明根本不是每次都重新生成".
>
> **The correct full cache clear before any re-render:**
> ```bash
> cd /tmp/remotion-demo
> rm -rf out/
> rm -rf .remotion/
> rm -rf cache/
> mkdir -p out
> # THEN render
> npx remotion render MyComp out/MyComp_fresh.mp4 --log=info 2>&1
> ```
>
> **Verify the render is actually fresh — pixel comparison:**
> After render, extract frames and compare MD5 hashes to a previous render:
> ```bash
> mkdir -p frames_new
> ffmpeg -y -i out/MyComp_fresh.mp4 -vf "fps=0.3" -q:v 2 frames_new/frame_%03d.jpg
> md5sum frames_new/*.jpg | head -5
> ```
> Fresh renders produce different MD5 hashes. If hashes match the previous render, the cache was not fully cleared.

**Also:** Render time scales with total frame count. At 30fps, a 261-second video = 7831 frames, which takes ~4-6 minutes to encode. Set user expectation accordingly:
> "Render已啟動後台。render完成後我第一時間告知你，確保係全新生成。"

### 渲染前最終檢查（Pre-render Checklist）

1. **確認冇未使用的 `const frame`**：
   ```bash
   grep -n "const frame = useCurrentFrame()" src/Composition.tsx | wc -l
   # 如果 > 每個場景函數的合理數量，檢查是否有多餘聲明
   ```

2. **確認 THEMES 與 SEGMENTS 數量一致**（兩者都係 23）：
   ```bash
   python3 -c "
   import re
   content = open('src/Composition.tsx').read()
   t = content[content.find('const THEMES'):content.find('const SEGMENTS')]
   themes = re.findall(r'\"(\w+)\"', t)
   s = content[content.find('const SEGMENTS'):content.find('const TOTAL_FRAMES')]
   segs = re.findall(r'idx:(\d+)', s)
   print(f'THEMES: {len(themes)} | SEGMENTS: {len(set(segs))}')
   print('OK' if len(themes) == len(set(segs)) else 'MISMATCH')
   "
   ```

3. **確認所有場景函數都有被 switch 調用**：
   ```bash
   # 列出所有定義但未使用的場景
   grep "const.*Scene" src/Composition.tsx
   # 手動確認每個都有對應 case
   ```

4. **確認圖片有 CSS 動畫（唔係 static opacity）**：
   ```bash
   grep -A5 "Img src=" src/Composition.tsx | grep "transform"
   # 如果冇輸出 = 圖片係 static，需要加 Ken Burns 動畫
   ```

### 驗證輸出

```bash
ls -lh out/MyComp.mp4
# 檔案必須 > 10MB（有意義的視頻內容）
# 如果 < 5MB → 可能係空視頻，檢查 Composition.tsx
```

### ⚠️ Critical: Scene Still Frame Numbers Are GLOBAL (2026-05-30)

> **Bug confirmed this session:** `npx remotion still MyComp out/scene.png --frame=30` renders **Scene0 frame 30**, NOT Scene9 or Scene13. This caused user to think Road/CarSVG and ZebraCrossing/PedestrianGroup were "not generated" — they were rendered at the wrong global frame.

**The fix:** Frame argument to `remotion still` is the **GLOBAL timeline** frame, not scene-local. To verify Scene9's Road+CarSVG:
```bash
# WRONG (renders Scene0 frame 30):
npx remotion still MyComp out/scene09.png --frame=30

# CORRECT (renders Scene9 at global frame 3780 + offset):
npx remotion still MyComp out/scene09_real.png --frame=3780
npx remotion still MyComp out/scene13_real.png --frame=5460
```

**Pre-calculated global frame starts (2026-05-30 verified):**
| Scene | Global Frame Start | Content |
|-------|-------------------|---------|
| Scene0 | 0 | Web3VPN Intro |
| Scene9 | 3780 | Road + CarSVG |
| Scene13 | 5460 | ZebraCrossing + PedestrianGroup |
| Scene22 | ~22172 | Memorial closing |

**Verify with Python:**
```python
# Calculate global frame for any scene offset
def global_frame(scene_idx, scene_offset, segments):
    seg = next(s for s in segments if s.idx == scene_idx)
    return seg.startF + scene_offset
# e.g. Scene9 offset 30 = global frame 3780 + 30 = 3810
```

**Rule:** Always use `seg.startF + offset` for still renders, never just `offset` like `30`.

### JSX Visual Element Audit (Pre-render Required)

> ⚠️ **每個 scene 必須有 6+ 視覺元素。** 用 `grep` 快速審計每個 Scene 的 `<div` 數量：

```bash
# 快速審計：每個 Scene 的視覺元素數量
python3 << 'EOF'
import re

with open("src/Composition.tsx") as f:
    content = f.read()

# 找每個 Scene 函數及其 div 數量
scene_pattern = r'const (Scene\d+): React\.FC.*?\{(.*?)(?=\nconst |\n\}(?:\nconst |$))'
matches = re.findall(scene_pattern, content, re.DOTALL)

for name, body in matches:
    div_count = len(re.findall(r'<div\s', body))
    img_count = len(re.findall(r'<Img\s', body))
    has_transform = bool(re.search(r'transform:\s*`', body))
    total_elements = div_count + img_count
    status = "✅" if total_elements >= 6 else "❌"
    print(f"{status} {name}: {total_elements} elements (divs={div_count}, imgs={img_count}, transform={has_transform})")

if len(matches) < 23:
    print(f"\n⚠️  WARNING: Only found {len(matches)}/23 scenes!")
EOF
```

**視覺元素閾值：**
- 6+ elements → ✅ 合格
- 4-5 elements → ⚠️ 不足，需要加
- < 4 elements → ❌ 不合格，必須重寫

### 交付

> ⚠️ **Telegram 視頻大小限制：** 發送前必須 compress，否則被 Telegram 拒絕。

```bash
# 1. 發送原檔（先讓用家確認內容）
curl -F "video=@out/MyComp.mp4" "https://api.telegram.org/bot<TOKEN>/sendVideo?chat_id=<CHAT_ID>"

# 2. 如果 > 20MB，用 ffmpeg compress 後再發壓縮版
ffmpeg -y -i out/MyComp.mp4 -vcodec libx264 -crf 28 -preset fast \
  -vf "scale=1280:720" -c:a copy out/MyComp_compressed.mp4

# 3. 先發送再 compress 是正確順序：用家等睇片，唔等壓縮
```

### 常見錯誤速查

| 錯誤 | 原因 | 修復 |
|------|------|------|
| `Could not find composition with ID MyComposition` | composition 名寫錯 | 確認 composition 名係 `MyComp`（唔係 `MyComposition`） |
| `Expected ">" but found "·"` | JSX expression 缺少 `>` | 檢查 `}}text` 變成 `}}>text` |
| `Expected ">" but found "}"` | ternary 多了 `}` | `speaker={seg.speaker === "y" ? "Y" : "M"}` 有雙 `}` |
| `src/Composition.tsx(XXX,9): error TS6133: 'xxx' is declared but its value is never read` | 未使用的 const | 呢啲係 warning唔係 error，可以照常 render |
| `WARNING: Img has NO transform/animation!` | 圖片冇 Ken Burns | 確認 Img tag 有 `transform: scale(...)` 而唔係淨係 `opacity` |

**驗證 composition 名：**
```bash
cd /tmp/remotion-demo && npx remotion render MyComp --log=error 2>&1 | grep "Available compositions"
```

**JSX 語法快速檢查（render 前必做）：**
```bash
# 檢查雙 `}}` 問題
python3 -c "
content = open('src/Composition.tsx').read()
import re
# 找所有 `}}` 後面冇 `>` 的情況（即 `}}` 後直接係字母/中文）
problems = re.finditer(r'\}\}(\S[^\s<>])', content)
for m in problems:
    pos = m.start()
    print(f'Double }} at pos {pos}: {repr(content[pos-20:pos+30])}')
"

# 找 `}}文字` pattern（缺少 >）
text_problems = re.finditer(r'\}\}([^\s<>])', content)
for m in text_problems:
    ch = m.group(1)
    if not ch.startswith('<'):
        print(f'Possible missing > at pos {m.start()}: {repr(content[m.start()-5:m.end()+10])}')
```

## Communication Protocol

- **User says "你去做啊" / "直接確認" / "哪個效果最好就哪個啊" = act immediately.** Do not ask "which direction?" — pick the best option and execute. The user wants the agent to exercise judgment and deliver, not deliberate.
- **User says "停" = stop immediately.** No explanation, no "let me finish this one thing."
- **User says "正常？" = report problem status.** Do not deflect or reframe.
- **"不要問沒意義的事"** — When the user's complaint is clear ("你一直發同一個圖，證明根本不是每次都重新生成"), do not ask clarifying questions. User has already diagnosed the problem; your job is immediate execution, not triangulation. Fix the root cause directly and re-render.
  - Example of WRONG response: "你睇緊邊個檔案？係 Telegram 上面收到嘅壓縮版視頻，定係其他？"
  - Example of CORRECT response: "明白，完全清除 cache + 重新 render。"
- **"說實話吧"** — Admit mistakes directly, do not minimize or reframe.

## Decision Tree

| 情況 | 操作 |
|------|------|
| 收到腳本 | → Step 0 分析，生成 JSX 場景代碼，寫入 Composition.tsx |
| 開始新視頻 | → Step 1 清理舊音頻 → Step 2 生成音頻 |
| 更新 timing | → Step 3 分析音頻時長 → Step 4 更新 Root.tsx |
| 生成 JSX 動畫 | → Step 5A（全局）立即寫入，或 Step 5B（段落）等 timing |
| AI 圖下載後 | → 立即 `file` 驗證，JPEG → ffmpeg 轉換 → 寫入 _fixed.png |
| 渲染最終輸出 | → Step 6 render + send |

## ⚠️ Visual Approach Contradiction — CRITICAL (2026-05-30)

> **核心矛盾：User 明確拒絕 AI 生圖，但投訴 JSX 動畫「行人、馬路、什麼都沒有」。** JSX/CSS 無法生成現實世界的視覺元素（斑馬線、行人、汽車、交通燈）。呢個矛盾必須在項目開始前解決，唔係等到 render 完成後先發現。

**兩種視覺方案，必須在 Step 0 之前確認：**

### 方案 A — JSX-Only（用家拒絕 AI 生圖時的唯一選擇）

**適用場景：** 用家明確說「唔好用 AI 生圖」或「唔好再試 AI 生成工具」

**限制：** 
- 只能做抽象視覺（幾何圖形、漸變、動態線條、字體動畫）
- 無法呈現現實場景（道路、斑馬線、行人、汽車、具體人物）
- 視頻會係「動態資訊圖」風格，唔係「紀錄片」風格

**JSX-only 最佳實踐：**
- 7-10+ 幾何視覺元素（pulse rings、decorative lines、corner accents、animated icons）
- 主題色 vignette + Ken Burns image（如果有用圖）
- 每個 scene 有 content-matched 動態組件（SpeedGauge、CandleFlame、Gavel、PhoneIcon）
- 唔好假設 JSX 可以代替真實圖片 — 你必須接受這個限制

**如果用家不接受 JSX-only 的限制：**
- 明確告訴用家：「呢個方案只能做出抽象動態圖形，冇辦法做出真實道路/行人/汽車場景。如果你要現實視覺，必須用 AI 生圖或提供真實圖片。」
- 唔好假設「跟多啲 JSX 就可以解決」。

### 方案 B — AI 圖輔助（推薦用於有現實場景需求的腳本）

**適用場景：** 腳本涉及具體事故現場、人物訪談、街景、設施實拍

**流程：**
1. Step 0 分析脚本文本，識別需要現實視覺的段落
2. 用 ComfyUI 或 Pollinations AI 生成相關圖片（512x512, sd15/flux）
3. 下載 → `file` 驗證格式（JPEG → ffmpeg 轉 PNG）→ 存入 `public/images/`
4. 寫入 SEGMENT_IMAGES map + Ken Burns + vignette overlay
5. 剩餘段落用 JSX 幾何動畫補足

**ComfyUI 快速生圖（本地, port 8188）：**
```bash
# 提交 workflow
curl -s -X POST "http://127.0.0.1:8188/prompt" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": {
      "3": {"inputs": {"checkpoint": "sd15.safetensors"}},
      "4": {"inputs": {"text": "prompt_here", "clip": ["4", 1]}},
      "5": {"inputs": {"width": 512, "height": 512, "batch_size": 1}},
      "6": {"inputs": {"sampler_name": "euler", "steps": 10, "cfg": 7, "seed": 42, "model": ["3", 0], "positive": ["4", 0], "negative": ["4", 1], "latent_image": ["5", 0]}},
      "8": {"inputs": {"images": ["6", 0]}},
      "9": {"inputs": {"images": ["8", 0], "filename_prefix": "segXX", "output_path": "/Volumes/Lexar/ComfyUI/output"}}
    }
  }' | python3 -c "import sys,json; print(json.load(sys.stdin)['prompt_id'])"

# 查狀態
curl -s "http://127.0.0.1:8188/api/history_v2/<prompt_id>" | python3 -c "import sys,json; d=json.load(sys.stdin); print('status:', d.get('status'))"
```

> ⚠️ **用家明確拒絕方案 B（「不用ai生圖」）時，唔好自行使用方案 B。** 必須尊重用家偏好。但如果用家投訴「冇現實視覺元素」，必須告知方案 A 的限制，問用家是否願意重新考慮方案 B。

**决策树：**
1. 項目開始 → 問用家：「呢個視頻需要現實場景（道路/人/汽車）定係純動態圖形？」
2. 如果用家選「現實場景」→ 方案 B（AI 生圖）
3. 如果用家選「唔好 AI 生圖」→ 方案 A（JSX-only）+ 明確告知限制
4. 如果用家選了方案 A 又投訴「冇現實視覺」→ 立即反饋限制，問是否改用方案 B

> ⚠️ **千祈唔好揀「中間路線」**：唔好一邊話「冇AI生圖」，一邊偷偷嘗試 ComfyUI 或其他 AI 生圖工具。用家明確拒絕就唔好再試。

## Common Pitfalls

1. **Aurora/Particle layers invisible** (2026-05-29) — Empirical pixel analysis proves Layer 1.5 (Aurora) + Layer 1.6 (Particles) + Layer 1.7 (Film grain) + Layer 1.8 (Cinematic vignette) ALL become invisible under `box-shadow:inset 0 0 120px rgba(0,0,0,0.8)`. Center pixel of rendered frame = `(131,27,26)` at avg brightness 53 — scene is near-black. **FIX:** Maximum 2 background layers (base color/image + ONE vignette). For visual richness use JSX animation components (SpeedGauge, CandleFlame, Gavel) not more overlay layers.
2. **跳过 Step 5** — 只更新 SEGMENTS 數組，唔寫實際 JSX 場景代碼。視頻會空白或只有聲音。
2. **Pollination JPEG trap** — 下載後唔驗證格式，直接用 .png 路徑，圖不顯示。
3. **跳過 Step 0 直接做 timing** — 以为分析就等於完成，其實净係做咗「計劃」，冇做「執行」。
4. **Layer 1 vs Layer 2 混淆** — 全局視覺在 Step 0 完成，段落動畫在 Step 5 完成，唔可以倒轉。
5. **SEGMENTS 和實際場景代碼脫節** — 更新咗 timing 但每個段落的 SceneForSegN 函數係空的。
6. **Compound patch 產生重複聲明** — 多次 patch 同一個組件（如 SpeedScene）可能產生 `const frame = useCurrentFrame();` 重複兩行。始终 read_file 確認無重複後再 render。
7. **`afinfo` 時長輸出格式不稳定** — macOS 上 `afinfo` 的 Duration 字段可能為空。用 `ffprobe -v quiet -show_entries format=duration -of csv=p=0` 代替。
8. **THEMES 主題錯配** — THEMES[i] 的主題與 SEGMENT_IMAGES[i] 語義不一致（如 THEMES[11]="past" 但 seg 11 是專家訪談）。每個 THEMES 分配後要對照 SEGMENTS[i].text 實際內容檢查。
9. **TransitionSeries.Transition 未接線** — 每個 `<TransitionSeries.Sequence>` 後面必須有 `<TransitionSeries.Transition>`，否則段落之間沒有視覺過渡。
10. **linearTiming/springTiming 未 import** — `@remotion/transitions` 的 timing 函數未引入，導致過渡動畫唔正常。確保 `import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions"`。
11. **SVG 使用絕對坐標** — path d 內使用 `M400,200` 等絕對坐標，響應式失效。必須使用 viewBox-relative 坐標。
12. **`require()` 代替 import** — 在函數內部用 `require("remotion")` 而非頂層 import，導致 tree-shaking 失效。正確用法：頂層 `import { interpolate } from "remotion"`。
13. **未使用的場景組件** — 定義了組件但 switch 內冇對應 case，每次寫完 switch 都應該 grep 確認所有定義的組件都有被調用。
14. **圖片不透明度靜態** — 所有圖片都用 `opacity: 0.55`，導致 news/memorial 主題睇唔清楚。必須按主題調整（news=0.35, memorial=0.70, anger=0.40）。
15. **文字截斷長度不統一** — 每個 Scene 的 `text.slice(0, N)` 使用不同數值，導致部分文字被截斷過多或過少。統一底部字幕 55 字元，頂部標題 30 字元。
16. **Theme-based generic scenes produce static/monotonous video** — All segments using `NewsScene`/`AngerScene` via switch/case look identical. **FIX: Write 23 unique per-segment scene components** (Scene0..Scene22), each with content-specific animations. See Section 5B architecture note.
18. **gavelX / interpolate 結果未使用** — LegalScene 入面宣告了 `const gavelX = interpolate(...)` 但 JSX 冇用到 `gavelX`，導致 TS6133 error。每次宣告 interpolate 變量後要確認有喺 JSX 入面使用。
19. **SVG data URI with double quotes breaks JSX** — Inline SVG background URLs like `url("data:image/svg+xml,...")` contain unescaped double quotes inside the JSX string literal, causing parse failures. **FIX:** Use a simple solid color or CSS gradient instead: `background:"rgba(255,255,255,0.03)"`.
20. **Surgical multi-line insertion corrupts JSX files** — When inserting new background-layer blocks (aurora/particle/noise) between existing JSX sections using Python string manipulation (split+join or find+replace), corruption patterns emerge:
    - Scene header duplication: `const SceneN: React.FC<...> = ({seg}) => {[0]}> = ({seg}) => {`
    - `SEGMENTS[0]}=` instead of `SEGMENTS[0]}> =`
    - Orphaned opening braces: `{\n{/* Layer 1.5:` (the first `{` is stray from a template literal followed by the inserted block)
    - `} />` doubled: `} /> />`
    **Correct approach:** For inserting multi-layer background systems across ALL 23 scenes, write the complete Composition.tsx as a single artifact. Do NOT try to surgically patch an existing file — the corruption rate is near 100% for this operation.
22. **esbuild "Unexpected export" at high line numbers on large files (2026-05-30)** — Even when `tsc --noEmit` reports zero errors, esbuild can fail with `Unexpected "export"` at the named export declaration of a 2300+ line / 90KB+ file. Binary-search testing confirmed: the issue is file-size/complexity threshold in esbuild's parser, not a syntax error. **Workaround:** Use `export default function MyComp()` in Composition.tsx + `import MyComp from './Composition'` (default import, NOT named) in Root.tsx. This resolved the esbuild parser issue in demo3 (1693-line file, 39KB). Named exports (`export const Comp = MyComp`) at high line numbers still fail esbuild. Default export works because esbuild handles `export default` differently from named exports in large files.
22. **Remotion render CLI syntax — ID comes BEFORE output path** — Verified 2026-05-30: `npx remotion render MyComp out/demo --frames=0-120` ✅. Reversed syntax `npx remotion render out/demo MyComp` ❌ gives "Could not find composition with ID out/demo".
23. **Border style values must use string concatenation, not template literals** — Complex CSS values like `border:"3px solid "+accent+alphaHex` risk esbuild parsing failures when using template literals inside large files. Use explicit string concatenation `"3px solid "+color+alpha` instead. Template literals in style props near high line numbers can trigger esbuild "Unexpected \"export\"" errors.
24. **Zebra/crosswalk image contamination (2026-05-30)** — Source images from real footage contain visible zebra crossing (pedestrian crosswalk) stripe patterns. User rejected: (1) ComfyUI regeneration (too slow), (2) AI image generation tools. **Solution: JSX ZebraMask overlay components** that cover pedestrian crossing patterns without modifying source images. Three variants: `"bottom"` (bottom 140px gradient), `"full"` (30-100% gradient overlay), `"corners"` (bottom + side gradient panels). See ZebraMask component reference.
26. **ComfyUI model file discovery** (2026-05-30) — Before using local ComfyUI for image generation, verify model files exist. Common locations checked: `~/ComfyUI/models/checkpoints/`, `~/Library/Application Support/ComfyUI/`, `/Volumes/*/ComfyUI/`. If no models found, workflow will queue but never complete. **Always check FIRST:** `find /Volumes -name "*.safetensors" -type f 2>/dev/null | head -5`. If no models available, either download a model or use Pollinations AI web API instead.
27. **Lucide React `stroke="currentColor"` invisible on dark bg (2026-05-30)** — When using Lucide React icons, icons by default use `stroke="currentColor"`. In Remotion JSX on dark backgrounds, `currentColor` may resolve to near-invisible dark gray instead of white. The fix: npm install `lucide-react`, then import and apply `color={LIGHT}` (NOT `stroke={LIGHT}`, Lucide uses `color` for stroke color) on each icon, OR use the inline SVG factory approach with explicit `stroke` props. Demo3 used Lucide but icons appeared black because `currentColor` on dark bg → dark stroke. Demo4/5 switched to inline SVG factory with `stroke={LIGHT}` and icons became visible.
26. **Disk space emergency cleanup** (2026-05-30) — When `.remotion/` cache grows large during extended renders, free space with: `rm -rf ~/.remotion/ /tmp/remotion-demo/.remotion/ /tmp/remotion-demo/out/ /tmp/remotion-demo/node_modules/.cache/`. Also clean system caches: `rm -rf ~/.cache/apt /var/cache/apt/archives/*.deb ~/.cache/curl ~/.cache/wget ~/.local/share/Trash ~/.trash`. Verify with `df -h /` after cleanup.

## Quick Reference

```bash
# 分析音頻時長
for f in public/audio/seg_*.m4a; do echo "$f: $(afinfo "$f" 2>/dev/null | grep Duration | awk '{print $3}')"; done

# 驗證 PNG 格式
file public/images/seg*.png

# 轉換 JPEG → PNG
ffmpeg -y -i "INPUT.png" "OUTPUT_fixed.png"

# Render
cd /tmp/remotion-demo && npx remotion render out/MyComp.mp4 --log=info

# 確認輸出大小
ls -lh out/MyComp.mp4

# 檢查未使用的場景組件
grep "const.*Scene" src/Composition.tsx | grep -v "^//"

# 確認 THEMES 數量與 SEGMENTS 一致
python3 -c "
import re
content = open('src/Composition.tsx').read()
t = content[content.find('const THEMES'):content.find('const SEGMENTS')]
themes = re.findall(r'\"(\w+)\"', t)
s = content[content.find('const SEGMENTS'):content.find('const TOTAL_FRAMES')]
segs = re.findall(r'idx:(\d+)', s)
print(f'THEMES count: {len(themes)}')
print(f'SEGMENTS count: {len(set(segs))}')
print('OK' if len(themes) == len(set(segs)) else 'MISMATCH — FIX THEMES!')
"

# 確認圖片有 CSS 動畫（唔係 static opacity）
grep -A5 "Img src=" src/Composition.tsx | grep "transform" || echo "WARNING: Img has NO transform/animation!"

# Pixel-based frame verification (when effects appear invisible)
python3 /Users/whypuss/.hermes/profiles/puss_profile/skills/media/remotion-video/references/frame-pixel-analysis.md

# 確認冇未使用的 interpolate 變量
grep "const.*= interpolate" src/Composition.tsx
```

## Verification Checklist

- [ ] Step 0 完成後，Composition.tsx 有所有段落的 SceneForSegN 函數（含 JSX 代碼）
- [ ] 所有 AI 圖片經過 ffmpeg 轉換，file 確認係真正 PNG
- [ ] Step 2 生成 46 個 .m4a 文件，ls 確認數量正確
- [ ] Step 3 每個段落的 durF 正確（ceil(duration * 30)）
- [ ] Step 5 每個 SceneForSegN 都有實際 JSX 代碼，唔係净係 SEGMENTS 數組更新
- [ ] THEMES[i] 的主題與 SEGMENT_IMAGES[i] 的 comment 語義一致
- [ ] THEMES 數量 = SEGMENTS 數量（都係 23 個）
- [ ] 所有已定義的場景組件都有對應 switch case，冇死代碼
- [ ] `<TransitionSeries.Transition>` 在每個 `<TransitionSeries.Sequence>` 後都有接線（⚠️ 當前 `@remotion/transitions` 有 `getProgress` bug，預設不接線，見 TransitionSeries.Transition 節)
- [ ] `import { TransitionSeries, linearTiming, springTiming } from "@remotion/transitions"` 存在
- [ ] 冇 `require("remotion")` 或 `require("@remotion/transitions")` 在函數內部
- [ ] 圖片不透明度按主題調整（news=0.35, memorial=0.70, anger=0.40）
- [ ] SVG path 使用 viewBox-relative 坐標（唔係 `M400,200` 等絕對坐標）
- [ ] 所有場景函數的 `text.slice(0, N)` 截斷長度統一（底部字幕 55，頂部標題 30）
- [ ] 圖片有 CSS 動畫（Ken Burns: scale + translate + vignette overlay），唔係淨係 static opacity
- [ ] THEMES 數量等於 SEGMENTS 數量（都係 23 個），python3 驗證脚本確認
- [ ] **JSX Richness: 每個 Scene 有 6+ 視覺元素**（用 JSX Visual Element Audit 脚本確認）
- [ ] 所有 `const xxx = interpolate(...)` 的變量都有喺 JSX 入面使用（特別係 gavelX）
- [ ] render 前 `grep -n "const frame = useCurrentFrame()" src/Composition.tsx` 確認冇重複聲明
- [ ] render 前執行 JSX Visual Element Audit（`references/jsx-visual-audit.md`），每個 Scene 必須 6+ 元素