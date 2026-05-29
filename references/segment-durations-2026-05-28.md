# Segment Duration Reference (2026-05-28)
# Generated via edge-tts + ffprobe, 46 audio files

## Verified Durations (ffprobe, seconds → frames)

| seg | voice | dur(s) | durF | startF |
|-----|-------|--------|------|--------|
| 00 | y | 12.312 | 369 | 0 |
| 01 | m | 18.840 | 565 | 369 |
| 02 | y | 29.232 | 877 | 934 |
| 03 | m | 25.440 | 763 | 1811 |
| 04 | y | 32.904 | 987 | 2574 |
| 05 | m | 45.456 | 1364 | 3561 |
| 06 | y | 28.752 | 863 | 4925 |
| 07 | m | 38.448 | 1153 | 5788 |
| 08 | y | 45.792 | 1374 | 6941 |
| 09 | m | 45.528 | 1366 | 8315 |
| 10 | y | 38.328 | 1150 | 9681 |
| 11 | m | 48.768 | 1463 | 10831 |
| 12 | y | 38.376 | 1151 | 12294 |
| 13 | m | 29.568 | 887 | 13445 |
| 14 | y | 48.864 | 1466 | 14332 |
| 15 | m | 33.744 | 1012 | 15798 |
| 16 | y | 38.904 | 1167 | 16810 |
| 17 | m | 49.464 | 1484 | 17977 |
| 18 | y | 20.928 | 628 | 19461 |
| 19 | m | 27.408 | 822 | 20089 |
| 20 | y | 23.688 | 711 | 20911 |
| 21 | m | 18.336 | 550 | 21622 |
| 22 | y | 17.232 | 517 | 22172 |

**TOTAL: 756.3s = 12.61min = 22689 frames @ 30fps**

## Script Used

Working audio gen script: `scripts/gen-audio.py`
- 46 files: `seg_00_y.m4a` through `seg_22_y.m4a` (y=male/zh-HK-WanLungNeural, m=female/zh-HK-HiuMaanNeural)
- Deletes old seg_ files before regenerating
- Prints per-file duration and total
- MUST be run from `/tmp/remotion-demo` directory