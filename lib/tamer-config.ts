export const COLOR_RAMP = [
  "#7e568e", // Purple (Trade) - more muted violet
  "#1f6adb", // Blue (Abortion) - softer blue
  "#398a34", // Green - muted green
  "#eab308", // Yellow (Economics) - warm amber
  "#e67e22", // Orange - softer orange
  "#c0392b", // Red (Migration) - muted red/coral
  "#383b3d", // Dark slate - softer than black
] as const;

export const EMOJI_SQUARES = ["🟪", "🟦", "🟩", "🟨", "🟧", "🟥", "⬛️"] as const;

export const POLICIES = [
  {
    key: "trade",
    label: "Trade",
    colorRamp: [
      "free trade",
      "minimal tariffs",
      "selective trade agreements",
      "balanced tariffs",
      "strategic protections",
      "heavy tariffs",
      "closed economy",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "abortion",
    label: "Abortion",
    colorRamp: [
      "partial birth abortion",
      "limit after viability",
      "limit after third trimester",
      "limit after second trimester",
      "limit after first trimester",
      "limit after heartbeat detection",
      "no exceptions allowed",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "migration",
    label: "Migration / Immigration",
    colorRamp: [
      "open borders",
      "easy pathways to citizenship",
      "expanded quotas",
      "current restrictions",
      "reduced quotas",
      "strict limits only",
      "no immigration",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "economics",
    label: "Economics",
    colorRamp: [
      "pure free market",
      "minimal regulation",
      "market-based with safety net",
      "balanced public-private",
      "strong social programs",
      "extensive public ownership",
      "full state control",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "rights",
    label: "Rights (civil liberties)",
    colorRamp: [
      "full legal equality",
      "protections with few limits",
      "protections with some limits",
      "tolerance without endorsement",
      "traditional definitions only",
      "no legal recognition",
      "criminalization",
    ],
    colors: COLOR_RAMP,
  },
] as const;

export type PolicyKey = (typeof POLICIES)[number]["key"];

export function getScoreLabel(policyKey: PolicyKey, score: number): string {
  const ramp = POLICIES.find((policy) => policy.key === policyKey)?.colorRamp ?? [];
  return ramp[score] ?? "";
}

export function getScoreColor(policyKey: PolicyKey, score: number): string {
  const palette = POLICIES.find((policy) => policy.key === policyKey)?.colors ?? [];
  return palette[score] ?? COLOR_RAMP[COLOR_RAMP.length - 1];
}

export function getEmojiSquare(score: number): string {
  return EMOJI_SQUARES[score] ?? "⬛️";
}
