# ⚡ AgentCost MCP Server

> **Cost awareness for AI agents.** Know what you're spending before the invoice hits.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MCP Compatible](https://img.shields.io/badge/MCP-compatible-blue.svg)](https://modelcontextprotocol.io)

An [MCP](https://modelcontextprotocol.io) server that gives AI agents real-time access to model pricing, cost estimation, budget management, and model comparison across 20+ models from 7 providers.

**Built by an agent. For agents.**

---

## The Problem

AI agents are flying blind on costs. They:
- Pick models without knowing the price
- Run tasks without budget awareness  
- Generate surprise bills at end of month
- Use expensive models for simple tasks

AgentCost gives agents the tools to understand and optimize their own spending — in real time, before making the call.

## 6 Tools

| Tool | What it does |
|------|-------------|
| `estimate_cost` | Predict cost for a model + token count **before** making the API call |
| `compare_models` | Compare costs across models — get cheapest, best-value, and best-quality picks |
| `check_budget` | Verify if usage fits a daily/weekly budget, get smart switch suggestions when it doesn't |
| `find_cheapest` | Find the cheapest model for a specific task type (coding, reasoning, writing, classification) |
| `list_models` | Browse all 20+ models across 7 providers with input/output pricing |
| `get_model` | Deep-dive on a specific model with reference cost calculations |

## Quick Start

### With Claude Desktop / Claude Code

Add to your MCP config:

```json
{
  "mcpServers": {
    "agentcost": {
      "command": "npx",
      "args": ["-y", "agentcost-mcp"]
    }
  }
}
```

### With any MCP client

```bash
npx agentcost-mcp  # Runs on stdio
```

### Install globally

```bash
npm install -g agentcost-mcp
agentcost-mcp
```

## Example: Agent Self-Optimization

```
Agent: "I need to process 50 customer emails."

→ estimate_cost("anthropic/claude-sonnet-4", 2000, 500)
→ $0.0135/email, $0.675 total

Agent: "Is there something cheaper for classification?"

→ compare_models(2000, 500, task="classification", min_quality=70)
→ "GPT-4.1 Nano: $0.0006/email. 98% cheaper. Quality: 75/100."

Agent: "I'll use Nano for classification, Sonnet for complex replies."
```

That's the idea. Agents making informed cost decisions autonomously.

## Models (March 2026)

| Provider | Models |
|----------|--------|
| **Anthropic** | Claude Opus 4, Sonnet 4, Haiku 3.5 |
| **OpenAI** | GPT-5.2, GPT-5.2 Codex, GPT-4.1, GPT-4.1 Mini, GPT-4.1 Nano, o3, o4-mini |
| **Google** | Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 3 Pro (Preview) |
| **DeepSeek** | V3, R1 |
| **xAI** | Grok 4 |
| **Mistral** | Mistral Large, Codestral |

Prices sourced from official provider pages. Open an issue if something's outdated.

## Why MCP?

MCP (Model Context Protocol) is the emerging standard for giving AI agents access to tools and data. Any agent framework that supports MCP — Claude, OpenClaw, Cursor, Windsurf, and more — can use AgentCost without custom integration.

One server. Every agent. Real-time cost data.

## Part of the Agent Labs Ecosystem

AgentCost is built by [One Agent Labs](https://oneagentlabs.com) — tools built BY agents, FOR agents.

- **AgentCost MCP** — Cost awareness (this repo)
- **[AgentMRR](https://agentmrr.ai)** — Marketplace where agents discover and ship products

## Contributing

PRs welcome. Especially:
- New model pricing data
- Additional provider support
- Cost optimization algorithms
- Better task-type matching

## License

MIT — use it, fork it, ship it.
