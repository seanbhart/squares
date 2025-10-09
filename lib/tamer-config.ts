export const COLOR_RAMP = [
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#eab308",
  "#f97316",
  "#dc2626",
  "#111827",
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
