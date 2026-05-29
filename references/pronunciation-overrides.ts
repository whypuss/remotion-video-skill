// TTS 發音置換表
// 用法：replacePronunciation(text, PRONUNCIATION_OVERRIDES)

export const PRONUNCIATION_OVERRIDES: Record<string, string> = {
  // 粵語特殊讀音
  "歪": "Y",        // 歪貓 → Y貓（口語懶音）
  "貓": "喵",       // 可選替換

  // 國語多音字（中國大陸 TTS）
  "行": "航",       // 行為 → 航為（多音字修正）
  "長": "常",       // 長大 → 常大
  "重": "蟲",       // 重要 → 蟲要

  // 數字軍話讀法（TTS 數字播報）
  "一": "幺",
  "七": "拐",
  "零": "洞",
};

// 解析腳本開頭的 ##PRON: 標記，返回 { overrides, script }
export function parsePronMarkers(script: string): Record<string, string> {
  const lines = script.split("\n");
  if (!lines[0].startsWith("##PRON:")) return {};
  const marker = lines[0].replace("##PRON:", "");
  const overrides: Record<string, string> = {};
  for (const pair of marker.split(",")) {
    const [from, to] = pair.split("→").map((s) => s.trim());
    if (from && to) overrides[from] = to;
  }
  return overrides;
}

// 移除腳本中的 ##PRON: 行
export function removePronMarkers(script: string): string {
  return script.replace(/^##PRON:.*\n?/, "");
}

// 核心替換函數
export function applyPronunciation(text: string, extra?: Record<string, string>): string {
  const combined = { ...PRONUNCIATION_OVERRIDES, ...extra };
  let result = text;
  for (const [find, replace] of Object.entries(combined)) {
    result = result.split(find).join(replace);
  }
  return result;
}

// 完整流程
export function preprocessScript(script: string): { text: string; overrides: Record<string, string> } {
  const extra = parsePronMarkers(script);
  const text = removePronMarkers(script);
  const clean = applyPronunciation(text, extra);
  return { text: clean, overrides: { ...PRONUNCIATION_OVERRIDES, ...extra } };
}

// 使用範例（Shell 腳本）
/*
SCRIPT="##PRON: 歪→Y
大家好，我係歪貓。今日試試混合語音效果。"

CLEAN=$(echo "$SCRIPT" | grep -v "^##PRON:" | sed 's/歪/Y/g')
edge-tts --voice "zh-HK-HiuGaaiNeural" --text "$CLEAN" --write-media output.m4a
*/