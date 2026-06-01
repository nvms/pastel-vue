/**
 * Default model pricing - USD per 1,000,000 tokens.
 *
 * Standard (non-batch, non-cached) list rates, current as of May 2026. Model
 * prices change often, so for accurate client-facing numbers pass your own
 * up-to-date list via the `models` prop - e.g. fetched from a pricing API and
 * massaged into this shape: { id, label, inputPer1M, outputPer1M }
 */
// `id` is the real API model identifier - the string you pass to the provider
// and store against your usage records.
export const DEFAULT_MODEL_PRICING = [
  // OpenAI
  { id: "gpt-5.5", label: "GPT-5.5", inputPer1M: 5, outputPer1M: 30 },
  { id: "gpt-5.4", label: "GPT-5.4", inputPer1M: 2.5, outputPer1M: 15 },
  { id: "gpt-5", label: "GPT-5", inputPer1M: 0.625, outputPer1M: 5 },
  // Anthropic
  { id: "claude-opus-4-7", label: "Claude Opus 4.7", inputPer1M: 5, outputPer1M: 25 },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", inputPer1M: 3, outputPer1M: 15 },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5", inputPer1M: 1, outputPer1M: 5 },
  // Google
  { id: "gemini-3.5-flash", label: "Gemini 3.5 Flash", inputPer1M: 1.5, outputPer1M: 9 },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", inputPer1M: 1.25, outputPer1M: 10 },
  { id: "gemini-2.5-flash-lite", label: "Gemini 2.5 Flash-Lite", inputPer1M: 0.1, outputPer1M: 0.4 },
]

export const findModel = (id, models) =>
  (models && models.length ? models : DEFAULT_MODEL_PRICING).find((m) => m.id === id) || null

// returns { model, input, output, total } in USD, or null when the model is unknown
export const costOf = (modelId, inputTokens, outputTokens, models) => {
  const m = findModel(modelId, models)
  if (!m) return null
  const input = ((inputTokens || 0) / 1e6) * (m.inputPer1M || 0)
  const output = ((outputTokens || 0) / 1e6) * (m.outputPer1M || 0)
  return { model: m, input, output, total: input + output }
}

export const formatUSD = (v) => {
  if (v == null || !isFinite(v)) return "—"
  const digits = Math.abs(v) > 0 && Math.abs(v) < 0.01 ? 5 : 2
  return "$" + v.toLocaleString("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export const formatTokens = (n) => {
  if (n == null || !isFinite(n)) return "—"
  const abs = Math.abs(n)
  if (abs >= 1e6) return (n / 1e6).toFixed(abs >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M"
  if (abs >= 1e3) return (n / 1e3).toFixed(abs >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K"
  return String(Math.round(n))
}
