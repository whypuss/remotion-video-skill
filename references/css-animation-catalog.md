# CSS Animation Catalog — Remotion Image Effects

## Core Pattern: Ken Burns on Images

Every image in `SceneForTheme` MUST have Ken Burns animation. Without it, images are static backgrounds that users can't see clearly.

```tsx
// In SceneForTheme, AFTER extracting imgOpacity:
const frame = useCurrentFrame();
// Ken Burns — subtle zoom + pan over segment duration
const scale = interpolate(frame, [0, durF], [1, 1.06], { extrapolateRight: "clamp" });
const panX = interpolate(frame, [0, durF], [0, 8], { extrapolateRight: "clamp" });
const panY = interpolate(frame, [0, durF], [0, 5], { extrapolateRight: "clamp" });

<Img
  src={staticFile(`images/${imgFile}`)}
  style={{
    width: "100%", height: "100%", objectFit: "cover",
    opacity: imgOpacity,
    transform: `scale(${scale}) translate(${panX}px, ${panY}px)`,
  }}
/>
```

## Theme-Specific Vignette Overlays

Add these `<div>` elements INSIDE the `<AbsoluteFill>` before the `<Img>`:

### news
```tsx
const redPulse = interpolate(frame, [0,30,60], [0,1,0], { extrapolateRight: "clamp" });
// Add inside AbsoluteFill:
<div style={{
  position: "absolute", inset: 0,
  background: `rgba(220,38,38,${0.15 + redPulse * 0.1})`,
  pointerEvents: "none"
}} />
```

### anger
```tsx
const shake = interpolate(frame, [0,5,10,15,20], [0,-4,4,-2,2], { extrapolateRight: "clamp" });
const pulse = interpolate(frame, [0,20,40], [0.8,1,0.8], { extrapolateRight: "clamp" });
// Container: <AbsoluteFill style={{transform: `translateX(${shake}px)`}}>
<div style={{
  position: "absolute", inset: 0,
  background: `radial-gradient(ellipse at center, rgba(220,38,38,${0.3 * pulse}) 0%, transparent 70%)`,
  pointerEvents: "none"
}} />
```

### memorial
```tsx
const fadeIn = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
// Sepia overlay:
<div style={{
  position: "absolute", inset: 0,
  background: "rgba(139,115,85,0.15)",
  mixBlendMode: "multiply",
  opacity: fadeIn,
  pointerEvents: "none"
}} />
```

### speed
```tsx
const speedPulse = interpolate(frame, [0,15,30], [0,1,0], { extrapolateRight: "clamp" });
<div style={{
  position: "absolute", inset: 0,
  background: `rgba(59,130,246,${0.1 + speedPulse * 0.15})`,
  pointerEvents: "none"
}} />
```

### phone (distraction)
```tsx
const danger = interpolate(frame, [0,20,40], [0,1,0], { extrapolateRight: "clamp" });
<div style={{
  position: "absolute", inset: 0,
  background: `radial-gradient(ellipse at center, transparent 30%, rgba(220,38,38,${0.4 + danger * 0.3}) 100%)`,
  pointerEvents: "none"
}} />
```

### legal
```tsx
// Dark solemn overlay
<div style={{
  position: "absolute", inset: 0,
  background: "rgba(20,20,40,0.8)",
  pointerEvents: "none"
}} />
```

### appeal
```tsx
const hope = interpolate(frame, [0,25], [0,0.12], { extrapolateRight: "clamp" });
<div style={{
  position: "absolute", inset: 0,
  background: `rgba(34,197,94,${hope})`,
  pointerEvents: "none"
}} />
```

### past
```tsx
// Sepia/yellow tint + slow fade
const fade = interpolate(frame, [0,20], [0,1], { extrapolateRight: "clamp"});
<div style={{
  position: "absolute", inset: 0,
  background: "rgba(196,168,130,0.2)",
  opacity: fade,
  pointerEvents: "none"
}} />
```

## Common Mistakes

1. **Img without transform** — just `opacity: 0.55` → static image, hard to see
2. **Vignette outside AbsoluteFill** — must be inside, same level as Img
3. **scale > 1.1** — Ken Burns should be subtle, 1.0→1.06 is enough
4. **panX/panY > 15px** — too aggressive, breaks composition
5. **Forgetting to pass `durF`** — Ken Burns needs segment duration, use `seg.durF` or pass as prop
