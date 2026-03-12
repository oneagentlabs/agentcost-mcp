#!/usr/bin/env node
/**
 * AgentCost MCP Server
 * Gives AI agents real-time cost awareness.
 *
 * Tools:
 * - estimate_cost: Estimate cost for a specific model + token count
 * - compare_models: Compare costs across models for the same workload
 * - check_budget: Check if current usage fits within a daily budget
 * - find_cheapest: Find the cheapest model for a specific task type
 * - list_models: List all available models and their pricing
 * - get_model: Get detailed pricing for a specific model
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MODELS, getModel, getModelsByProvider, getModelsByTier } from "./models.js";
import { estimateCost, compareModels, checkBudget, findCheapestForTask } from "./calculator.js";

const server = new McpServer({
  name: "agentcost",
  version: "0.1.0",
});

// === TOOLS ===

server.tool(
  "estimate_cost",
  "Estimate the cost of an API call to a specific model. Use this BEFORE making expensive API calls to understand the cost impact.",
  {
    model_id: z.string().describe("Model ID (e.g., 'anthropic/claude-sonnet-4', 'openai/gpt-4.1')"),
    input_tokens: z.number().describe("Number of input/prompt tokens"),
    output_tokens: z.number().describe("Number of output/completion tokens"),
    use_caching: z.boolean().optional().describe("Whether prompt caching is enabled (reduces input cost)"),
  },
  async ({ model_id, input_tokens, output_tokens, use_caching }) => {
    const result = estimateCost(model_id, input_tokens, output_tokens, use_caching);
    if (!result) {
      return {
        content: [{ type: "text", text: `Model '${model_id}' not found. Use list_models to see available models.` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "compare_models",
  "Compare costs across multiple models for the same workload. Returns cheapest, best value (quality/price), and best quality options with a recommendation.",
  {
    input_tokens: z.number().describe("Number of input tokens for the workload"),
    output_tokens: z.number().describe("Number of output tokens for the workload"),
    task: z.string().optional().describe("Task type (e.g., 'coding', 'reasoning', 'writing', 'classification')"),
    min_quality: z.number().optional().describe("Minimum quality score (0-100) to include in comparison"),
    max_cost_per_1m: z.number().optional().describe("Maximum output cost per 1M tokens to consider"),
    tier: z.string().optional().describe("Filter by tier: 'flagship', 'standard', 'budget', 'reasoning'"),
  },
  async ({ input_tokens, output_tokens, task, min_quality, max_cost_per_1m, tier }) => {
    const result = compareModels(input_tokens, output_tokens, task, min_quality, max_cost_per_1m, tier);
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          task: result.task,
          recommendation: result.recommendation,
          cheapest: { model: result.cheapest.modelName, cost: `$${result.cheapest.totalCost.toFixed(6)}`, quality: result.cheapest.qualityScore },
          bestValue: { model: result.bestValue.modelName, cost: `$${result.bestValue.totalCost.toFixed(6)}`, quality: result.bestValue.qualityScore, valueScore: result.bestValue.valueScore },
          bestQuality: { model: result.bestQuality.modelName, cost: `$${result.bestQuality.totalCost.toFixed(6)}`, quality: result.bestQuality.qualityScore },
          allOptions: result.estimates.map((e) => ({
            model: e.modelName,
            provider: e.provider,
            cost: `$${e.totalCost.toFixed(6)}`,
            quality: e.qualityScore,
            valueScore: e.valueScore,
          })),
        }, null, 2),
      }],
    };
  }
);

server.tool(
  "check_budget",
  "Check if your current model usage fits within a daily budget. Gets a recommendation if over budget.",
  {
    model_id: z.string().describe("Model ID you're currently using"),
    daily_budget: z.number().describe("Daily spending limit in USD"),
    messages_per_day: z.number().describe("Estimated number of messages/calls per day"),
    avg_input_tokens: z.number().describe("Average input tokens per message"),
    avg_output_tokens: z.number().describe("Average output tokens per message"),
  },
  async ({ model_id, daily_budget, messages_per_day, avg_input_tokens, avg_output_tokens }) => {
    const result = checkBudget(model_id, daily_budget, messages_per_day, avg_input_tokens, avg_output_tokens);
    if (!result) {
      return {
        content: [{ type: "text", text: `Model '${model_id}' not found.` }],
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  }
);

server.tool(
  "find_cheapest",
  "Find the cheapest models suitable for a specific task type. Returns models sorted by price that meet minimum quality.",
  {
    task: z.string().describe("Task type: 'coding', 'reasoning', 'writing', 'classification', 'general', 'multimodal'"),
    min_quality: z.number().optional().describe("Minimum quality score (0-100). Default: 70"),
  },
  async ({ task, min_quality }) => {
    const models = findCheapestForTask(task, min_quality);
    if (models.length === 0) {
      return {
        content: [{ type: "text", text: `No models found for task '${task}' with quality >= ${min_quality || 70}.` }],
      };
    }
    return {
      content: [{
        type: "text",
        text: JSON.stringify(models.map((m) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          inputPer1M: `$${m.inputPer1M}`,
          outputPer1M: `$${m.outputPer1M}`,
          quality: m.qualityScore,
          bestFor: m.bestFor,
        })), null, 2),
      }],
    };
  }
);

server.tool(
  "list_models",
  "List all available AI models and their pricing. Optionally filter by provider or tier.",
  {
    provider: z.string().optional().describe("Filter by provider: 'OpenAI', 'Anthropic', 'Google', 'DeepSeek', 'xAI', 'Mistral'"),
    tier: z.string().optional().describe("Filter by tier: 'flagship', 'standard', 'budget', 'reasoning'"),
    sort_by: z.string().optional().describe("Sort by: 'price' (cheapest first), 'quality' (best first), 'value' (best quality/price)"),
  },
  async ({ provider, tier, sort_by }) => {
    let models = [...MODELS];

    if (provider) {
      models = models.filter((m) => m.provider.toLowerCase() === provider.toLowerCase());
    }
    if (tier) {
      models = models.filter((m) => m.tier === tier);
    }

    switch (sort_by) {
      case "price":
        models.sort((a, b) => a.outputPer1M - b.outputPer1M);
        break;
      case "quality":
        models.sort((a, b) => b.qualityScore - a.qualityScore);
        break;
      case "value":
        models.sort((a, b) => (b.qualityScore / b.outputPer1M) - (a.qualityScore / a.outputPer1M));
        break;
      default:
        models.sort((a, b) => b.qualityScore - a.qualityScore);
    }

    return {
      content: [{
        type: "text",
        text: JSON.stringify(models.map((m) => ({
          id: m.id,
          name: m.name,
          provider: m.provider,
          tier: m.tier,
          input: `$${m.inputPer1M}/1M`,
          output: `$${m.outputPer1M}/1M`,
          cached: m.cachedInputPer1M ? `$${m.cachedInputPer1M}/1M` : "N/A",
          context: `${(m.contextWindow / 1000).toFixed(0)}K`,
          quality: m.qualityScore,
          bestFor: m.bestFor,
        })), null, 2),
      }],
    };
  }
);

server.tool(
  "get_model",
  "Get detailed pricing and information for a specific model.",
  {
    model_id: z.string().describe("Model ID (e.g., 'anthropic/claude-sonnet-4')"),
  },
  async ({ model_id }) => {
    const model = getModel(model_id);
    if (!model) {
      return {
        content: [{ type: "text", text: `Model '${model_id}' not found. Use list_models to see available models.` }],
      };
    }

    // Calculate some useful reference costs
    const ref1k = estimateCost(model_id, 500, 500);
    const ref10k = estimateCost(model_id, 5000, 5000);
    const refHeavy = estimateCost(model_id, 50000, 10000);

    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          ...model,
          contextWindow: `${(model.contextWindow / 1000).toFixed(0)}K tokens`,
          referenceCosts: {
            "light_message_1k_tokens": ref1k ? `$${ref1k.totalCost.toFixed(6)}` : null,
            "medium_message_10k_tokens": ref10k ? `$${ref10k.totalCost.toFixed(6)}` : null,
            "heavy_task_60k_tokens": refHeavy ? `$${refHeavy.totalCost.toFixed(6)}` : null,
            "1000_light_messages_per_day": ref1k ? `$${(ref1k.totalCost * 1000).toFixed(4)}/day` : null,
          },
        }, null, 2),
      }],
    };
  }
);

// === RESOURCES ===

server.resource(
  "pricing-summary",
  "agentcost://pricing-summary",
  async (uri) => ({
    contents: [{
      uri: uri.href,
      mimeType: "application/json",
      text: JSON.stringify({
        lastUpdated: "2026-03-11",
        totalModels: MODELS.length,
        providers: [...new Set(MODELS.map((m) => m.provider))],
        priceRange: {
          cheapestInput: `$${Math.min(...MODELS.map((m) => m.inputPer1M))}/1M tokens`,
          cheapestOutput: `$${Math.min(...MODELS.map((m) => m.outputPer1M))}/1M tokens`,
          mostExpensiveInput: `$${Math.max(...MODELS.map((m) => m.inputPer1M))}/1M tokens`,
          mostExpensiveOutput: `$${Math.max(...MODELS.map((m) => m.outputPer1M))}/1M tokens`,
        },
        tiers: {
          flagship: MODELS.filter((m) => m.tier === "flagship").map((m) => m.id),
          standard: MODELS.filter((m) => m.tier === "standard").map((m) => m.id),
          budget: MODELS.filter((m) => m.tier === "budget").map((m) => m.id),
          reasoning: MODELS.filter((m) => m.tier === "reasoning").map((m) => m.id),
        },
      }, null, 2),
    }],
  })
);

// === START SERVER ===

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AgentCost MCP server running on stdio");
}

main().catch(console.error);
