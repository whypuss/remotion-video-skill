# Scene Global Frame Map (2026-05-30 Verified)

**Critical for still rendering:** Use global frame numbers, not scene-local offsets.

## Verified Frame Ranges

| Scene | Global Start | Global End | Frames | Duration | Content |
|-------|-------------|------------|--------|----------|---------|
| Scene0 | 0 | 420 | 420 | 14.0s | Web3VPN Intro + icons |
| Scene1 | 420 | 840 | 420 | 14.0s | — |
| Scene2 | 840 | 1260 | 420 | 14.0s | — |
| Scene3 | 1260 | 1680 | 420 | 14.0s | — |
| Scene4 | 1680 | 2100 | 420 | 14.0s | — |
| Scene5 | 2100 | 2520 | 420 | 14.0s | — |
| Scene6 | 2520 | 2940 | 420 | 14.0s | — |
| Scene7 | 2940 | 3360 | 420 | 14.0s | — |
| Scene8 | 3360 | 3780 | 420 | 14.0s | — |
| **Scene9** | **3780** | **4200** | **420** | **14.0s** | **Road + CarSVG (5 cars)** |
| Scene10 | 4200 | 4620 | 420 | 14.0s | — |
| Scene11 | 4620 | 5040 | 420 | 14.0s | — |
| Scene12 | 5040 | 5460 | 420 | 14.0s | — |
| **Scene13** | **5460** | **5880** | **420** | **14.0s** | **ZebraCrossing + PedestrianGroup (4)** |
| Scene14 | 5880 | 6300 | 420 | 14.0s | — |
| Scene15 | 6300 | 6720 | 420 | 14.0s | — |
| Scene16 | 6720 | 7140 | 420 | 14.0s | — |
| Scene17 | 7140 | 7560 | 420 | 14.0s | — |
| Scene18 | 7560 | 7980 | 420 | 14.0s | — |
| Scene19 | 7980 | 8400 | 420 | 14.0s | — |
| Scene20 | 8400 | 8820 | 420 | 14.0s | — |
| Scene21 | 8820 | 9240 | 420 | 14.0s | — |
| Scene22 | 9240 | 9660 | 420 | 14.0s | — |

**TOTAL: ~9660 frames @ 30fps ≈ 5.4 minutes** (demo render)

## Verified SVG Components per Scene

| Scene | SVG Components |
|-------|---------------|
| Scene0 | IconShield, IconGlobe, IconZap, IconLock, IconCar, IconUsers |
| **Scene9** | `<Road y={300}>`, `<CarSVG>` (5 instances, bidirectional) |
| **Scene13** | `<ZebraCrossing y={300}>`, `<PedestrianGroup count={4}>` |

## Quick Verify Commands

```bash
cd /tmp/remotion-demo

# Scene9 at global frame 3780
npx remotion still MyComp out/scene09_check.png --frame=3780

# Scene13 at global frame 5460
npx remotion still MyComp out/scene13_check.png --frame=5460

# Scene9 at frame 30 within scene (global = 3780 + 30 = 3810)
npx remotion still MyComp out/scene09_offset30.png --frame=3810
```

## Python: Calculate Global Frame

```python
SCENE_FRAMES = {
    0: 0, 1: 420, 2: 840, 3: 1260, 4: 1680, 5: 2100,
    6: 2520, 7: 2940, 8: 3360, 9: 3780, 10: 4200,
    11: 4620, 12: 5040, 13: 5460, 14: 5880, 15: 6300,
    16: 6720, 17: 7140, 18: 7560, 19: 7980, 20: 8400,
    21: 8820, 22: 9240
}

def global_frame(scene_idx, offset=0):
    return SCENE_FRAMES[scene_idx] + offset

# e.g. Scene9 frame 30 within scene = global frame 3810
print(global_frame(9, 30))  # 3810
```

## Bug History (2026-05-30)

- **Wrong:** `npx remotion still MyComp --frame=30` → renders Scene0 frame 30
- **Right:** `npx remotion still MyComp --frame=3780` → renders Scene9 frame 0 (global)
- User said "9和13根本沒生成你說的" → confusion from wrong frame numbers
- Fix: Always use `scene_start_global_frame + offset` for still renders
