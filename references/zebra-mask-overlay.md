# ZebraMask Component Reference

## Problem
Source images from real footage contain visible **pedestrian zebra crossing** stripe patterns (white/black diagonal road markings). User rejected:
- ComfyUI regeneration (too slow)
- AI image generation tools
- Any tool-based image replacement

## Solution: JSX Overlay Mask

Add a reusable `<ZebraMask>` component to Composition.tsx that overlays semi-transparent dark panels to **cover** the zebra patterns without modifying source images.

## Three Variants

### 1. `"bottom"` — Bottom gradient (for scenes where zebra is at bottom)
```tsx
const ZebraMask: React.FC<{variant?:"bottom"|"full"|"corners"}> = ({variant="bottom"}) => {
  if (variant === "bottom") {
    return (
      <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,height:140,
          background:"linear-gradient(0deg, rgba(12,12,20,0.92) 0%, transparent 100%)"
        }} />
        <div style={{
          position:"absolute",bottom:0,left:0,right:0,height:60,
          background:"rgba(12,12,20,0.85)"
        }} />
      </div>
    );
  }
  // ... other variants
};
```

### 2. `"full"` — Full scene gradient (for memorial/candlelight scenes)
```tsx
if (variant === "full") {
  return (
    <div style={{
      position:"absolute",inset:0,pointerEvents:"none",
      background:"linear-gradient(180deg, transparent 30%, rgba(12,12,20,0.95) 70%, rgba(12,12,20,1) 100%)"
    }} />
  );
}
```

### 3. `"corners"` — Bottom + side gradients (most scenes)
```tsx
if (variant === "corners") {
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none"}}>
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:180,
        background:"linear-gradient(0deg, rgba(12,12,20,1) 0%, transparent 100%)"}} />
      <div style={{position:"absolute",top:0,left:0,width:200,height:"100%",
        background:"linear-gradient(90deg, rgba(12,12,20,0.9) 0%, transparent 100%)"}} />
      <div style={{position:"absolute",top:0,right:0,width:200,height:"100%",
        background:"linear-gradient(270deg, rgba(12,12,20,0.9) 0%, transparent 100%)"}} />
    </div>
  );
}
```

## Usage in Scenes

```tsx
// At the bottom of each scene's JSX return:
<ZebraMask variant="corners" />
```

**Variant selection guide:**
- `memorial`, `anger`, `closing` scenes → `"full"` (heavy overlay)
- `news`, `speed`, `legal`, `speaker` scenes → `"corners"` (light overlay)
- Scenes where zebra is only at bottom → `"bottom"`

## Color: Dark BG `#0c0c14`

Use same dark background color as scene base (`C.bg`) to blend seamlessly.

## esbuild template literal trap

> ⚠️ **When adding ZebraMask to a large (>2000 line) Composition.tsx, use string concatenation for background values, NOT template literals.**
>
> Template literals like `` background:`linear-gradient(180deg, transparent 30%, ${C.bg}95 70%)` `` inside a large file can trigger esbuild `"Unexpected \"export\""` at the file's export declaration.
>
> **Safe form:**
> ```tsx
> background:"linear-gradient(180deg, transparent 30%, rgba(12,12,20,0.95) 70%, rgba(12,12,20,1) 100%)"
> ```
>
> Use explicit color values `rgba(12,12,20,0.95)` instead of `${C.bg}` string interpolation inside style strings in large files.

## Verification

After adding ZebraMask to all scenes:
```bash
grep -c "ZebraMask" src/Composition.tsx
# Must be >= 23 (one per scene + definition)
```