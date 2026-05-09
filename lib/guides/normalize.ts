export function normalizeGuideText(value: string | null | undefined) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[()[\]{}'"`~!@#$%^&*_=+\\|;:,.<>/?·ㆍ-]/g, "");
}

export function normalizeGuideTargetType(value: string | null | undefined) {
  const text = normalizeGuideText(value);

  if (["섬마", "섬의마음"].includes(text)) return "섬의마음";
  if (["모코코", "모코코씨앗"].includes(text)) return "모코코씨앗";
  if (["세계수", "세계수의잎"].includes(text)) return "세계수의잎";
  if (["오페별", "오르페우스의별"].includes(text)) return "오르페우스의별";
  if (["거심", "거인의심장"].includes(text)) return "거인의심장";

  return text;
}

export function normalizeGuideTargetName(
  value: string | null | undefined,
  targetType?: string | null
) {
  let text = normalizeGuideText(value);
  const type = normalizeGuideTargetType(targetType);

  text = text.replace(/공략$/g, "");

  if (type === "섬의마음") {
    text = text.replace(/섬의마음$/g, "");
    text = text.replace(/섬$/g, "");
  }

  return text;
}