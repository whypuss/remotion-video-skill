# JSX Visual Element Audit Script

Use this to audit each Scene's visual element count (divs + imgs) before rendering. 
Minimum threshold: 6 elements per scene.

## Python Audit Script

```python
import re

with open("src/Composition.tsx") as f:
    content = f.read()

# Split by Scene definitions
scene_blocks = re.split(r'\nconst (Scene\d+)', content)

total_elements = {}
for i in range(1, len(scene_blocks), 2):
    name = scene_blocks[i]
    body = scene_blocks[i+1] if i+1 < len(scene_blocks) else ""
    div_count = len(re.findall(r'<div\s', body))
    img_count = len(re.findall(r'<Img\s', body))
    svg_count = len(re.findall(r'<svg\s', body))
    total = div_count + img_count + svg_count
    status = "✅" if total >= 6 else "⚠️" if total >= 4 else "❌"
    total_elements[name] = (status, total, div_count, img_count, svg_count)

for name in sorted(total_elements.keys(), key=lambda n: int(n.replace('Scene',''))):
    s, t, d, img, svg = total_elements[name]
    print(f"{s} {name}: {t} elements (div={d}, img={img}, svg={svg})")

scenes_found = (len(scene_blocks)-1)//2
print(f"\nTotal scenes: {scenes_found}/23")
```

## Thresholds

| Element Count | Status | Action |
|--------------|--------|--------|
| 6+ | ✅ | Ready to render |
| 4-5 | ⚠️ | Add 1-2 more visual elements |
| < 4 | ❌ | Rewrite scene with richer JSX |

## Common Patterns to Add More Elements

- `<SpeedLines progress={...}/>` — animated horizontal lines
- `<RippleEffect cx cy progress />` — expanding circle ripples  
- `<CandleFlame x y size progress />` — candle flame animation
- `<Gavel progress />` — judge hammer animation
- `<PhoneIcon progress />` — phone vibration
- Additional `<div>` layers: decorative borders, corner accents, pulse rings
- Animated count-up values: `{Math.round(countUp)}`
- Themed vignette `<div>` overlays

## Pre-render Run

Always run this before `npx remotion render` to catch low-element scenes early.