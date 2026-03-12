/**
 * Cost calculation engine for AI agents.
 * Agents call these to understand their own costs and optimize.
 */

import { MODELS, type ModelPricing } from "./models.js";

export interface CostEstimate {
  modelId: string;
  modelName: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  costWithCaching?: number;
  qualityScore: number;
  valueScore: number; // quality per dollar
}

export interface ComparisonResult {
  task: string;
  inputTokens: number;
  outputTokens: number;
  estimates: CostEstimate[];
  cheapest: CostEstimate;
  bestValue: CostEstimate;
  bestQuality: CostEstimate;
  recommendation: string;
}

export interface BudgetCheck {
  modelId: string;
  dailyBudget: number;
  estimatedDailyCost: number;
  messagesPerDay: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  withinBudget: boolean;
  budgetUtilization: number; // percentage
  maxMessagesInBudget: number;
  suggestion?: string;
}

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number,
  useCaching = false
): CostEstimate | null {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return null;

  const inputCost = (inputTokens / 1_000_000) * (useCaching && model.cachedInputPer1M ? model.cachedInputPer1M : model.inputPer1M);
  const outputCost = (outputTokens / 1_000_000) * model.outputPer1M;
  const totalCost = inputCost + outputCost;

  const cachingCost = model.cachedInputPer1M
    ? (inputTokens / 1_000_000) * model.cachedInputPer1M + outputCost
    : undefined;

  const valueScore = totalCost > 0 ? model.qualityScore / totalCost : 0;

  return {
    modelId: model.id,
    modelName: model.name,
    provider: model.provider,
    inputTokens,
    outputTokens,
    inputCost: Math.round(inputCost * 1_000_000) / 1_000_000,
    outputCost: Math.round(outputCost * 1_000_000) / 1_000_000,
    totalCost: Math.round(totalCost * 1_000_000) / 1_000_000,
    costWithCaching: cachingCost ? Math.round(cachingCost * 1_000_000) / 1_000_000 : undefined,
    qualityScore: model.qualityScore,
    valueScore: Math.round(valueScore * 100) / 100,
  };
}

export function compareModels(
  inputTokens: number,
  outputTokens: number,
  task?: string,
  minQuality?: number,
  maxCostPer1M?: number,
  tier?: string
): ComparisonResult {
  let candidates = [...MODELS];

  if (minQuality) {
    candidates = candidates.filter((m) => m.qualityScore >= minQuality);
  }
  if (maxCostPer1M) {
    candidates = candidates.filter((m) => m.outputPer1M <= maxCostPer1M);
  }
  if (tier) {
    candidates = candidates.filter((m) => m.tier === tier);
  }

  const estimates = candidates
    .map((m) => estimateCost(m.id, inputTokens, outputTokens)!)
    .filter(Boolean)
    .sort((a, b) => a.totalCost - b.totalCost);

  const cheapest = estimates[0];
  const bestValue = [...estimates].sort((a, b) => b.valueScore - a.valueScore)[0];
  const bestQuality = [...estimates].sort((a, b) => b.qualityScore - a.qualityScore)[0];

  let recommendation: string;
  if (bestValue.modelId === cheapest.modelId) {
    recommendation = `${bestValue.modelName} is both cheapest and best value. Use it.`;
  } else {
    const savings = ((bestQuality.totalCost - bestValue.totalCost) / bestQuality.totalCost * 100).toFixed(0);
    recommendation = `Best value: ${bestValue.modelName} (${savings}% cheaper than ${bestQuality.modelName} with ${bestValue.qualityScore}/${bestQuality.qualityScore} quality). Use ${bestQuality.modelName} only when quality is critical.`;
  }

  return {
    task: task || "general",
    inputTokens,
    outputTokens,
    estimates,
    cheapest,
    bestValue,
    bestQuality,
    recommendation,
  };
}

export function checkBudget(
  modelId: string,
  dailyBudget: number,
  messagesPerDay: number,
  avgInputTokens: number,
  avgOutputTokens: number
): BudgetCheck | null {
  const model = MODELS.find((m) => m.id === modelId);
  if (!model) return null;

  const costPerMessage = estimateCost(modelId, avgInputTokens, avgOutputTokens);
  if (!costPerMessage) return null;

  const estimatedDailyCost = costPerMessage.totalCost * messagesPerDay;
  const withinBudget = estimatedDailyCost <= dailyBudget;
  const budgetUtilization = (estimatedDailyCost / dailyBudget) * 100;
  const maxMessagesInBudget = costPerMessage.totalCost > 0
    ? Math.floor(dailyBudget / costPerMessage.totalCost)
    : Infinity;

  let suggestion: string | undefined;
  if (!withinBudget) {
    // Find a cheaper model that fits
    const cheaper = MODELS
      .filter((m) => m.id !== modelId && m.qualityScore >= model.qualityScore * 0.7)
      .map((m) => ({
        model: m,
        cost: estimateCost(m.id, avgInputTokens, avgOutputTokens)!,
      }))
      .filter((m) => m.cost && m.cost.totalCost * messagesPerDay <= dailyBudget)
      .sort((a, b) => b.model.qualityScore - a.model.qualityScore);

    if (cheaper.length > 0) {
      suggestion = `Switch to ${cheaper[0].model.name} ($${(cheaper[0].cost.totalCost * messagesPerDay).toFixed(4)}/day) to stay within budget while maintaining ${cheaper[0].model.qualityScore}% quality.`;
    } else {
      suggestion = `Reduce to ${maxMessagesInBudget} messages/day to stay within budget, or increase budget to $${estimatedDailyCost.toFixed(4)}/day.`;
    }
  }

  return {
    modelId,
    dailyBudget,
    estimatedDailyCost: Math.round(estimatedDailyCost * 1_000_000) / 1_000_000,
    messagesPerDay,
    avgInputTokens,
    avgOutputTokens,
    withinBudget,
    budgetUtilization: Math.round(budgetUtilization * 100) / 100,
    maxMessagesInBudget,
    suggestion,
  };
}

export function findCheapestForTask(
  task: string,
  minQuality: number = 70
): ModelPricing[] {
  const taskMap: Record<string, string[]> = {
    coding: ["coding", "code generation", "code review", "code completion"],
    reasoning: ["reasoning", "math", "science", "planning", "complex reasoning"],
    writing: ["creative writing", "writing", "analysis"],
    classification: ["classification", "simple tasks", "routing", "extraction"],
    general: ["general tasks", "general intelligence"],
    multimodal: ["multimodal"],
  };

  const keywords = taskMap[task.toLowerCase()] || [task.toLowerCase()];

  return MODELS
    .filter((m) => m.qualityScore >= minQuality)
    .filter((m) => m.bestFor.some((bf) => keywords.some((k) => bf.includes(k))))
    .sort((a, b) => a.outputPer1M - b.outputPer1M);
}
