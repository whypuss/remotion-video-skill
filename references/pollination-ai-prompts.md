# Pollination AI Image Prompts (Tested 2026-05-28)

## Macau Zebra Crossing Accident Context

All images: 768x512, no logo, realistic photo style.

### seg00_news.png — Breaking news Macau street
```
A serious traffic accident at a zebra crossing in Macau at night, emergency lights flashing, police tape, a child-sized stretcher covered with a white sheet, rain-wet asphalt, dramatic news photography style, emotional, photojournalism
```

### seg06_anger.png — Driver aggressive at zebra
```
A close-up of a driver's face with angry expression stepping on gas pedal aggressively, view from inside car looking at pedestrian on zebra crossing ahead, dramatic lighting, tension, cinematic, phone recording screen visible
```

### seg09_speed.png — Speeding car on Macau road
```
A blurred speeding car on a wet Macau urban road at night, motion speed lines, red taillights, zebra crossing ahead slightly out of focus, dangerous driving atmosphere, cinematic photography
```

### seg13_past.png — Old Macau nostalgic street
```
Nostalgic old Macau street scene in the 1990s, traditional shop houses with neon signs, a polite driver waving to let pedestrian cross, warm sepia tone, film grain, nostalgic atmosphere, people in casual clothing
```

### seg16_legal.png — Courtroom Macau
```
Macau courtroom scene with judge bench, scales of justice,严肃的气氛, empty public gallery, dramatic lighting from high window, legal atmosphere, desaturated, cinematic
```

### seg22_memorial.png — Child memorial candles
```
A memorial for a child traffic victim at a zebra crossing in Macau, candles, white flowers, child's photo in a wreath, rain on asphalt, somber atmosphere, people laying flowers, evening, photographic style
```

## Rate Limit Notes

- 1 request per IP, 60s cooldown
- Retry pattern: sleep 65s between failed attempts
- Parallel generation: use subagents with staggered start (5-10s offsets)
- All saved as .png (actually JPEG data), verified with `file` command

## Prompt Engineering Tips

- Always include: "Macau" or "Hong Kong" for local context
- Use: `rain-wet asphalt`, `emergency lights`, `cinematic photography` for atmosphere
- Negative: avoid cartoon, anime, illustration styles
- Sepia/desaturated for past/memorial scenes
- High contrast for anger/speed scenes