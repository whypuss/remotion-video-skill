---
name: remotion-video
description: "Generate a Cantonese voiceover MP4 video from a script using Remotion + macOS TTS. Trigger: remotion video/mp4/generate video from code/react animation/video composition/cantonese 粵語"
version: 2.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [remotion, video, mp4, animation, react, tts, voiceover, cantonese, mac-tts]
    related_skills: [comfyui, baoyu-comic]
---

# 嚴格標準作業程序 (SOP): Remotion 視頻生成

## 🛑 絕對鐵則 (CRITICAL RULES)
1. **嚴禁跳步**：必須嚴格遵守 Step 1 至 Step 7 的順序，未輸出當前步驟的驗證結果前，絕對不允許進入下一步。
2. **獨立場景原則**：必須為每一個段落建立獨立的組件（`Scene0` 到 `Scene22`），**嚴禁**使用 `switch/case` 搭配通用範本（如 `SceneForTheme`）。
3. **暖色調強制令 (Warm Colors Only)**：僅允許使用 Amber (`#f59e0b`)、Warm Dark (`#2a1408`)、Mid Brown (`#5c3317`) 與 Cream (`#fef3c7`)。**嚴禁**使用純紅、純藍或冷色調。
4. **極致視覺豐富度 (JSX Richness)**：每一個 Scene 必須達到 **100 行以上的 JSX 代碼**，且包含至少 6 種動態視覺元素。
5. **強制 SVG 動畫**：除非明確指定使用實景圖片，否則必須大量調用專屬 SVG 組件（如 `<Road/>`, `<CarSVG/>`），且其座標必須綁定 `interpolate` 動畫。

---

## 執行流程 (EXECUTION WORKFLOW)

### Step 1: 腳本視覺規劃 (Planning & Mapping)
讀取腳本，為所有段落 (Segments) 定義視覺主題與圖片。
1. 確認 `THEMES` 陣列長度必須與 `SEGMENTS` 完全一致（不能多也不能少）。
2. 主題必須與內容語義匹配（例如：`speed` 配馬路，`speaker` 配訪談）。
3. 確保 `SEGMENT_IMAGES` 覆蓋所有段落。
> ✅ **Step 1 檢查卡點**：執行 Python 腳本驗證 `len(THEMES) == len(SEGMENTS)`。

### Step 2: 音頻環境重置 (Audio Cleanup)
清除上一次生成的殘留檔案，防止污染。
1. 執行：`rm -f /tmp/remotion-demo/public/audio/seg_*.m4a`
2. 確認目錄內只剩下 `.gitkeep` 等非 `seg_` 檔案。
> ✅ **Step 2 檢查卡點**：確認 `/tmp/remotion-demo/public/audio/` 內無舊音檔。

### Step 3: 音頻生成 (Audio Generation)
生成粵語 TTS 音檔。
1. 執行：`cd /tmp/remotion-demo && python gen_audio.py`
2. 確保生成 Y (Male) 與 M (Female) 雙版本音軌。
> ✅ **Step 3 檢查卡點**：執行 `ls -la public/audio/ | grep "\.m4a" | wc -l`，確認檔案數量符合段落數。

### Step 4: 時間軸分析與對齊 (Timing Synchronization)
計算每個段落的精確影格數 (durF) 與起始點 (startF)。
1. 使用 `ffprobe` 讀取每個 `.m4a` 的精確秒數（嚴禁使用 `afinfo`）。
2. 計算公式：`durF = ceil(duration * 30)`。
3. 更新 `Composition.tsx` 內的 `SEGMENTS` 陣列。
4. 更新 `Root.tsx` 中的 `<Composition durationInFrames={totalFrames} />`。
> ✅ **Step 4 檢查卡點**：列印出所有 SEGMENTS 的 `durF` 總和，確認等於 `totalFrames`。

### Step 5: 分批撰寫場景代碼 (Chunked JSX Generation)
**注意：為了防止 Context 丟失，此步驟必須分批執行！每批最多生成 5 個 Scene。**
1. **Scene 結構要求**：
   * 呼叫 `useCurrentFrame()`。
   * **Layer 1**: 圖片必須加上 Ken Burns 效果 (`scale` + `translate`)。
   * **Layer 2**: 主題專屬 vignette overlay (暖色系)。
   * **Layer 3**: 文字進場動畫 (`slideUp`, `fadeIn`)。
   * **Layer 4+**: 該主題專屬的 SVG 動畫組件 (如 `<SpeedGauge/>`, `<ZebraCrossing/>`)。
2. 寫入 `Composition.tsx`，並將該 Scene 加入 `SceneComponents` 陣列。
3. 分批執行（例如先寫 Scene0~4，等待用戶確認「繼續」後再寫 Scene5~9）。
> ✅ **Step 5 檢查卡點**：使用 Python 正則表達式檢查每個 `SceneX` 的 `<div` 與 `<svg` 總數量是否大於 6，且代碼行數符合標準。

### Step 6: 渲染前終極審計 (Pre-Render Audit)
在執行渲染前，必須自我檢查代碼健康度。
1. 執行 `npx tsc --noEmit` 確保無語法與型別錯誤。
2. 確認沒有殘留的 `require("remotion")`，全部改用 ES6 `import`。
3. 檢查 `Composition.tsx` 中是否將預設匯出放在檔案頂端：`export default function MyComp() {...}`，防止 esbuild 崩潰。
> ✅ **Step 6 檢查卡點**：無 TypeScript Error，且 SVG Audit Script 全數顯示 `✅`。

### Step 7: 緩存清除與交付 (Render & Deliver)
強制清除所有快取，生成全新影片。
1. 執行嚴格清理：
```bash
cd /tmp/remotion-demo
rm -rf out/ .remotion/ cache/
mkdir -p out
```
2. 執行渲染：`npx remotion render MyComp out/MyComp.mp4 --log=info`
3. 若檔案大於 20MB，使用 ffmpeg 進行壓製：
```bash
ffmpeg -y -i out/MyComp.mp4 -vcodec libx264 -crf 28 -preset fast -vf "scale=1280:720" -c:a copy out/MyComp_compressed.mp4
```
4. 交付影片至 Telegram。
> ✅ **Step 7 檢查卡點**：確認輸出的 .mp4 檔案大小合理（>10MB），並發送。

---

## 附錄 A：標準場景範本 (Scene Template)
> 所有 Scene 必須基於此結構擴充，不允許偷工減料。

```tsx
const SceneN: React.FC<{seg: typeof SEGMENTS[0]}> = ({seg}) => {
  const frame = useCurrentFrame();
  const durF = seg.durF;
  const imgFile = SEGMENT_IMAGES[N];
  const progress = interpolate(frame, [0, durF], [0, 1], {extrapolateRight: "clamp"});

  // 1. Ken Burns
  const scale = interpolate(frame, [0, durF], [1, 1.06], {extrapolateRight:"clamp"});
  const panX = interpolate(frame, [0, durF], [0, 8], {extrapolateRight:"clamp"});
  const imgOpacity = interpolate(frame, [0,20], [0,0.40], {extrapolateRight:"clamp"});

  // 2. Theme Animations
  const vignettePulse = interpolate(frame, [0,50,100], [0.3,0.6,0.3], {extrapolateRight:"clamp"});
  const textFade = interpolate(frame, [0,15,30], [0,1,1], {extrapolateRight:"clamp"});

  return (
    <AbsoluteFill style={{background: "#2a1408"}}>
      {/* Layer 1: Ken Burns Image */}
      {imgFile && <Img src={staticFile(`images/${imgFile}`)} style={{
        width:"100%", height:"100%", objectFit:"cover", opacity: imgOpacity,
        transform:`scale(${scale}) translate(${panX}px,0px)`
      }} />}

      {/* Layer 2: Warm Vignette */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:`radial-gradient(ellipse at center, rgba(245,158,11,${0.2+vignettePulse*0.2}) 0%, transparent 70%)`
      }} />

      {/* Layer 3: SVG Component (Example) */}
      <div style={{ position: "absolute", inset: 0 }}>
         {/* 這裡必須放入根據主題選擇的 SVG 組件，例如 <Road/> 或 <CandleFlame/> */}
         <SpeedGauge progress={progress} speed={72} />
      </div>

      {/* Layer 4: Text Content */}
      <div style={{opacity: textFade, textAlign: "center"}}>
         {/* 內容文字 */}
      </div>

      {/* Layer 5: Caption */}
      <div style={{position:"absolute", bottom:30, left:0, right:0, textAlign:"center"}}>
        <span style={{color: "#fef3c7"}}>{seg.text.slice(0,55)}</span>
      </div>
    </AbsoluteFill>
  );
};
```

## 為什麼這樣改會有效？
1. 消除敘事廢話：Agent 讀檔時不再需要理解「為什麼 5/29 號的客戶會生氣」，它只需要看到「必須要有 100 行」這個死規定。
2. 卡點機制 (Checkpoints)：透過明確標示 ✅ 檢查卡點，強迫 Agent 在進入下一步前呼叫 Python 或 bash 去驗證自己的產出，打斷它「一口氣瞎編到底」的壞習慣。
3. Step 5 的分批指令 (Chunking)：直接在 SOP 內定死「每次最多寫 5 個 Scene」，這能完美迴避 LLM 寫長代碼時尾段爛尾（Lazy generation）的通病。