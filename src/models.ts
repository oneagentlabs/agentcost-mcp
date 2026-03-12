/**
 * AI Model Pricing Database
 * Last updated: March 11, 2026
 * Sources: OpenAI, Anthropic, Google, DeepSeek, xAI, Mistral official pricing pages
 * Prices in USD per 1M tokens
 */

export interface ModelPricing {
  id: string;
  provider: string;
  name: string;
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M?: number;
  contextWindow: number;
  qualityScore: number; // 0-100 based on benchmarks
  tier: "flagship" | "standard" | "budget" | "reasoning";
  bestFor: string[];
  released: string;
}

export const MODELS: ModelPricing[] = [
  // === ANTHROPIC ===
  {
    id: "anthropic/claude-opus-4",
    provider: "Anthropic",
    name: "Claude Opus 4",
    inputPer1M: 15,
    outputPer1M: 75,
    cachedInputPer1M: 1.5,
    contextWindow: 200_000,
    qualityScore: 98,
    tier: "flagship",
    bestFor: ["complex reasoning", "architecture", "strategy", "long documents"],
    released: "2026-03",
  },
  {
    id: "anthropic/claude-sonnet-4",
    provider: "Anthropic",
    name: "Claude Sonnet 4",
    inputPer1M: 3,
    outputPer1M: 15,
    cachedInputPer1M: 0.3,
    contextWindow: 200_000,
    qualityScore: 90,
    tier: "standard",
    bestFor: ["coding", "general tasks", "analysis", "writing"],
    released: "2026-01",
  },
  {
    id: "anthropic/claude-haiku-3.5",
    provider: "Anthropic",
    name: "Claude Haiku 3.5",
    inputPer1M: 0.8,
    outputPer1M: 4,
    cachedInputPer1M: 0.08,
    contextWindow: 200_000,
    qualityScore: 72,
    tier: "budget",
    bestFor: ["classification", "simple tasks", "high throughput", "cost-sensitive"],
    released: "2025-10",
  },

  // === OPENAI ===
  {
    id: "openai/gpt-5.2",
    provider: "OpenAI",
    name: "GPT-5.2",
    inputPer1M: 1.75,
    outputPer1M: 14,
    contextWindow: 400_000,
    qualityScore: 96,
    tier: "flagship",
    bestFor: ["general intelligence", "reasoning", "creative writing"],
    released: "2026-02",
  },
  {
    id: "openai/gpt-5.2-codex",
    provider: "OpenAI",
    name: "GPT-5.2 Codex",
    inputPer1M: 1.75,
    outputPer1M: 14,
    contextWindow: 400_000,
    qualityScore: 92,
    tier: "standard",
    bestFor: ["coding", "agentic tasks", "code review"],
    released: "2026-03",
  },
  {
    id: "openai/gpt-4.1",
    provider: "OpenAI",
    name: "GPT-4.1",
    inputPer1M: 2,
    outputPer1M: 8,
    contextWindow: 1_000_000,
    qualityScore: 85,
    tier: "standard",
    bestFor: ["long context", "document analysis", "coding"],
    released: "2025-04",
  },
  {
    id: "openai/gpt-4.1-mini",
    provider: "OpenAI",
    name: "GPT-4.1 Mini",
    inputPer1M: 0.4,
    outputPer1M: 1.6,
    contextWindow: 1_000_000,
    qualityScore: 75,
    tier: "budget",
    bestFor: ["simple tasks", "classification", "extraction"],
    released: "2025-04",
  },
  {
    id: "openai/gpt-4.1-nano",
    provider: "OpenAI",
    name: "GPT-4.1 Nano",
    inputPer1M: 0.1,
    outputPer1M: 0.4,
    contextWindow: 1_000_000,
    qualityScore: 65,
    tier: "budget",
    bestFor: ["high throughput", "simple classification", "routing"],
    released: "2025-04",
  },
  {
    id: "openai/o3",
    provider: "OpenAI",
    name: "o3",
    inputPer1M: 10,
    outputPer1M: 40,
    contextWindow: 200_000,
    qualityScore: 95,
    tier: "reasoning",
    bestFor: ["math", "science", "complex reasoning", "planning"],
    released: "2025-12",
  },
  {
    id: "openai/o4-mini",
    provider: "OpenAI",
    name: "o4-mini",
    inputPer1M: 1.1,
    outputPer1M: 4.4,
    contextWindow: 200_000,
    qualityScore: 82,
    tier: "reasoning",
    bestFor: ["math", "code reasoning", "logic", "cost-effective reasoning"],
    released: "2026-01",
  },

  // === GOOGLE ===
  {
    id: "google/gemini-2.5-pro",
    provider: "Google",
    name: "Gemini 2.5 Pro",
    inputPer1M: 1.25,
    outputPer1M: 10,
    contextWindow: 1_000_000,
    qualityScore: 89,
    tier: "flagship",
    bestFor: ["multimodal", "long context", "reasoning", "code"],
    released: "2025-12",
  },
  {
    id: "google/gemini-2.5-flash",
    provider: "Google",
    name: "Gemini 2.5 Flash",
    inputPer1M: 0.3,
    outputPer1M: 2.5,
    contextWindow: 1_000_000,
    qualityScore: 80,
    tier: "budget",
    bestFor: ["fast inference", "multimodal", "cost-effective"],
    released: "2025-12",
  },
  {
    id: "google/gemini-3-pro-preview",
    provider: "Google",
    name: "Gemini 3 Pro (Preview)",
    inputPer1M: 2,
    outputPer1M: 12,
    contextWindow: 1_000_000,
    qualityScore: 91,
    tier: "flagship",
    bestFor: ["multimodal", "reasoning", "agentic tasks"],
    released: "2026-03",
  },

  // === DEEPSEEK ===
  {
    id: "deepseek/deepseek-v3",
    provider: "DeepSeek",
    name: "DeepSeek V3",
    inputPer1M: 0.27,
    outputPer1M: 1.1,
    contextWindow: 128_000,
    qualityScore: 78,
    tier: "budget",
    bestFor: ["coding", "general tasks", "cost-sensitive workloads"],
    released: "2025-12",
  },
  {
    id: "deepseek/deepseek-r1",
    provider: "DeepSeek",
    name: "DeepSeek R1",
    inputPer1M: 0.55,
    outputPer1M: 2.19,
    contextWindow: 128_000,
    qualityScore: 80,
    tier: "reasoning",
    bestFor: ["reasoning", "math", "science", "cost-effective reasoning"],
    released: "2025-12",
  },

  // === XAI ===
  {
    id: "xai/grok-4",
    provider: "xAI",
    name: "Grok 4",
    inputPer1M: 3,
    outputPer1M: 15,
    contextWindow: 256_000,
    qualityScore: 77,
    tier: "flagship",
    bestFor: ["real-time knowledge", "general tasks"],
    released: "2026-02",
  },

  // === MISTRAL ===
  {
    id: "mistral/mistral-large",
    provider: "Mistral",
    name: "Mistral Large",
    inputPer1M: 2,
    outputPer1M: 6,
    contextWindow: 128_000,
    qualityScore: 76,
    tier: "standard",
    bestFor: ["multilingual", "reasoning", "code generation"],
    released: "2025-11",
  },
  {
    id: "mistral/codestral",
    provider: "Mistral",
    name: "Codestral",
    inputPer1M: 0.3,
    outputPer1M: 0.9,
    contextWindow: 256_000,
    qualityScore: 74,
    tier: "budget",
    bestFor: ["code completion", "code generation", "FIM"],
    released: "2025-10",
  },
];

export function getModel(id: string): ModelPricing | undefined {
  return MODELS.find((m) => m.id === id);
}

export function getModelsByProvider(provider: string): ModelPricing[] {
  return MODELS.filter((m) => m.provider.toLowerCase() === provider.toLowerCase());
}

export function getModelsByTier(tier: ModelPricing["tier"]): ModelPricing[] {
  return MODELS.filter((m) => m.tier === tier);
}
