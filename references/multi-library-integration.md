# Remotion + Multi-Library Integration (2026-05-28)

## 整合工具清單（按類別）

| 類別 | 工具 | Remotion 相容性 |
|------|------|----------------|
| 3D | Three.js / R3F | ❌ **Mac Puppeteer WebGL 崩潰** |
| 3D | Spline | ✅ via embed |
| 地圖 | MapLibre GL JS | ⚠️ 需 delayRender() |
| 地圖 | Deck.gl | ⚠️ 需 delayRender() |
| 圖表 | Recharts | ✅ **今日驗證成功** |
| 圖表 | Chart.js | ✅ via HTML canvas |
| 圖表 | Visx | ✅ React native |
| 圖表 | D3.js | ✅ 計算層，React 渲染 |
| 動畫 | Lottie-React | ✅ @remotion/lottie |
| 動畫 | GSAP | ✅ via useProgress |
| 動畫 | Framer Motion | ⚠️ spring 可用，但慎用 |

## ❌ Three.js / R3F — Mac 環境崩潰

**問題**：Remotion 底層用 Puppeteer 渲染，Mac 上 Puppeteer 的 WebGL context 與 `@react-three/fiber` 的 `<Canvas>` 組件衝突，導致：
```
TypeError: Cannot read properties of undefined (reading 'getExtension')
at recursivelyTraverseLayoutEffects
```

**適用環境**：Linux/Cloudflare Pages（無 headless Chrome GPU issue）或其他非 Mac 環境。

**替代方案**：
- 用純 CSS/JavaScript 動畫代替 3D（已驗證可行）
- 用 `@remotion/three` 而非 `@react-three/fiber`（需進一步測試）
- 用 `spline` 嵌入 3D 場景

## ✅ 今日成功整合

**4 場景短片（13s）**：`Remotion + Recharts + CSS Animation + Waveform`

| 場景 | 技術 | 狀態 |
|------|------|------|
| 柱狀圖 | Recharts BarChart | ✅ |
| 趨勢線圖 | Recharts LineChart | ✅ |
| 脈衝波動畫 | CSS (scale + opacity) | ✅ |
| 波形可視化 | CSS flex + JS math | ✅ |

**代價**：Three.js 3D cube 場景被移除，改用 CSS pulse rings。

## Key Insight: Determinism

Remotion 核心原則：**確定性（Determinism）**。

每幀輸出必須完全由 `useCurrentFrame()` 決定，唔可以依賴：
- 外部異步状态（如 setTimeout、requestAnimationFrame）
- 隨機性（Math.random() 每幀要 seed）
- 庫內部動畫（如 MapLibre fade-in、Three.js 內部 tween）

所有動畫必須用 `interpolate(frame, [...])` 包裹。

## 安裝（2026-05-28 驗證）

```bash
cd /tmp/remotion-demo
npm install three @react-three/fiber @remotion/three recharts lottie-react
```

**注意**：`@remotion/three` 需要額外配置（3D 模型需 pre-load），未來如果要整合，需測試 `delayRender()` pattern。

## 示範 Composition（2026-05-28）

位於：`/tmp/remotion-demo/src/Composition.tsx`

- 4 個 Sequence 場景（Bar → Line → Pulse → Waveform → EndCard）
- Recharts 圖表 + CSS 動畫 + Waveform 可視化
- 總長 390 frames（13s @ 30fps）
- 音頻：Mac TTS Sinji Cantonese

## Workflow（已驗證）

```bash
# 1. 搭建 project
npx create-video@latest --yes --blank --no-tailwind .

# 2. 安裝整合庫
npm install @remotion/media recharts lottie-react

# 3. 寫 Composition.tsx
# 注意：唔用 Three.js/R3F，用 Recharts + CSS 動畫

# 4. Mac 渲染用本地 binary
node_modules/.bin/remotion render MyComp --codec=h264 --crf=20
```

## 禁忌（2026-05-28 確認）

- ❌ CSS transitions/animation — 唔渲染
- ❌ Tailwind animation class — 唔渲染
- ❌ @react-three/fiber Canvas — Mac Puppeteer 崩潰
- ❌ Math.random() — 每幀不確定

## 未來整合方向

1. **Lottie** — `@remotion/lottie` 加載 AE JSON，適用所有平臺
2. **MapLibre** — 地理飛越動畫，需 `delayRender()` 等待 tiles
3. **Spline** — 設計師友好 3D，embed 方式繞過 WebGL 問題
4. **D3.js** — 力導向圖，用 D3 計算 + React 渲染