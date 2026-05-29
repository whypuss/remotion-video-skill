# Transition Catalog (from Ashad001/remotion-transitions)

⚠️ **CRITICAL (2026-05-29):** `<TransitionSeries.Transition presentation={stripedSlam} />` throws `TypeError: Cannot read properties of undefined (reading 'getProgress')` at render time. The API works in the transition function definitions below, but wiring it as JSX between `TransitionSeries.Sequence` elements causes runtime failure in current `@remotion/transitions` version. Until fixed:
- Use plain `<TransitionSeries>` + `<TransitionSeries.Sequence>` without `<TransitionSeries.Transition>` between segments for reliable rendering
- The transition function definitions (`stripedSlam`, `zoomPunch`, etc.) are correct and preserved below — do NOT delete them
- `linearTiming`/`springTiming` from `@remotion/transitions` are used **inside** transition components for custom timing, NOT as JSX props

---

Six production-tested transitions using `TransitionPresentation` API. Install: `npm install @remotion/transitions`

Design tokens: `DARK_BG = "#0a0a0a"`, `EMERALD = "#10b981"`

---

## 1. Striped Slam (Max Energy)

8 horizontal bars slam in from left/right, cover scene, retract to reveal new scene.
Timing: `linearTiming({ durationInFrames: 50 })`

```tsx
function stripedSlam(stripes = 8): TransitionPresentation<Record<string, never>> {
  const STRIPE_COLORS = [DARK_BG, EMERALD];
  const component = ({ presentationProgress, presentationDirection, children }) => {
    const bars = Array.from({ length: stripes }, (_, i) => {
      const h = 100 / stripes;
      const color = STRIPE_COLORS[i % 2];
      const fromLeft = i % 2 === 0;
      const stagger = (i / stripes) * 0.3;
      const p = Math.max(0, Math.min(1, (presentationProgress - stagger) / (1 - stagger)));
      const pe = 1 - Math.pow(1 - p, 3);
      let x: number;
      if (presentationDirection === "exiting") {
        x = fromLeft ? interpolate(pe, [0, 1], [-112, 0]) : interpolate(pe, [0, 1], [112, 0]);
      } else {
        const revStagger = ((stripes - 1 - i) / stripes) * 0.3;
        const rp = Math.max(0, Math.min(1, (presentationProgress - revStagger) / (1 - revStagger)));
        const rpe = 1 - Math.pow(1 - rp, 3);
        x = fromLeft ? interpolate(rpe, [0, 1], [0, -112]) : interpolate(rpe, [0, 1], [0, 112]);
      }
      return <div key={i} style={{ position: "absolute", top: `${i * h}%`, left: 0, width: "112%", height: `${h + 0.4}%`, background: color, transform: `translateX(${x}%)`, pointerEvents: "none" }} />;
    });
    return <AbsoluteFill>{children}{bars}</AbsoluteFill>;
  };
  return { component, props: {} };
}
```

---

## 2. Zoom Punch (Medium-High Energy)

Old scene zooms out + fades. New scene punches in from slightly smaller scale.
Timing: `springTiming({ config: { damping: 200 }, durationInFrames: 35 })`

```tsx
function zoomPunch(): TransitionPresentation<Record<string, never>> {
  const component = ({ presentationProgress, presentationDirection, children }) => {
    const entering = presentationDirection === "entering";
    if (entering) {
      const p = presentationProgress;
      const pe = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      const scale = interpolate(pe, [0, 1], [0.86, 1]);
      return <AbsoluteFill style={{ opacity: presentationProgress, transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
    }
    const scale = interpolate(presentationProgress, [0, 1], [1, 1.08]);
    return <AbsoluteFill style={{ opacity: 1 - presentationProgress, transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
  };
  return { component, props: {} };
}
```

---

## 3. Diagonal Reveal (Cinematic)

Dark panel with skewed right edge sweeps left→right, revealing new scene.
Timing: `linearTiming({ durationInFrames: 40 })`

```tsx
function diagonalReveal(): TransitionPresentation<Record<string, never>> {
  const component = ({ presentationProgress, presentationDirection, children }) => {
    if (presentationDirection === "exiting") {
      return <AbsoluteFill style={{ opacity: 1 - Math.pow(presentationProgress, 0.6) }}>{children}</AbsoluteFill>;
    }
    const pe = 1 - Math.pow(1 - presentationProgress, 2.5);
    const bx = interpolate(pe, [0, 1], [-12, 116]);
    return (
      <AbsoluteFill>
        {children}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${bx}%`, right: 0, background: DARK_BG, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-10%", bottom: "-10%", left: `${bx - 7}%`, width: "10%", background: DARK_BG, transform: "skewX(-9deg)", transformOrigin: "top left", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, bottom: 0, left: `${bx - 0.5}%`, width: 3, background: EMERALD, transform: "skewX(-9deg)", boxShadow: `0 0 14px ${EMERALD}`, pointerEvents: "none" }} />
      </AbsoluteFill>
    );
  };
  return { component, props: {} };
}
```

---

## 4. Emerald Burst (High Energy)

Radial burst of emerald bars from center outward.
Timing: `linearTiming({ durationInFrames: 45 })`

```tsx
function emeraldBurst(): TransitionPresentation<Record<string, never>> {
  const N = 16;
  const component = ({ presentationProgress, presentationDirection, children }) => {
    const bars = Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2;
      const stagger = Math.abs(Math.sin(angle)) * 0.25;
      const p = Math.max(0, Math.min(1, (presentationProgress - stagger) / (1 - stagger)));
      const pe = 1 - Math.pow(1 - p, 2);
      const w = presentationDirection === "exiting" ? interpolate(pe, [0, 1], [0, 160]) : interpolate(pe, [0, 1], [160, 0]);
      const cx = 50 + Math.cos(angle) * 50;
      const cy = 50 + Math.sin(angle) * 50;
      return <div key={i} style={{ position: "absolute", top: `${cy}%`, left: `${cx}%`, width: w, height: 8, background: EMERALD, transform: `translate(-50%, -50%) rotate(${angle}rad)`, pointerEvents: "none", boxShadow: `0 0 8px ${EMERALD}` }} />;
    });
    return <AbsoluteFill>{children}{bars}</AbsoluteFill>;
  };
  return { component, props: {} };
}
```

---

## Easing Reference

```ts
const easeOut3 = (p: number) => 1 - Math.pow(1 - p, 3);
const easeInOut3 = (p: number) => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
const easeOutN = (p: number, n: number) => 1 - Math.pow(1 - p, n); // n=3 standard, n=6 snappy
```

**Stagger forward:** `delay = (i / N) * 0.3; p = max(0, min(1, (progress - delay) / (1 - delay)));`
**Stagger reverse:** `delay = ((N-1-i) / N) * 0.3;`
**Bidirectional:** `dist = abs(i - center) / center; delay = dist * STAGGER;`

**Shake (decaying oscillation):** `Math.sin(progress * Math.PI * 12) * 30 * Math.pow(1 - progress, 1.5);`

**Spring configs:** `{ damping: 200 }` (critically damped), `{ damping: 14, stiffness: 340 }` (subtle bounce)

---

## Frame Budget

```
Total rendered = Σ(scene durations) − Σ(transition durations)
Example: 3 scenes × 120f = 360f, 2 transitions × 30f = 60f removed → 300f rendered
```