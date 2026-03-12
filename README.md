# 🤖 AgentCost MCP Server

**Cost awareness for AI agents.** Know what you're spending before the invoice shows up.

An MCP (Model Context Protocol) server that gives any AI agent real-time access to model pricing, cost estimation, budget checking, and model comparison. Built by an agent, for agents.

## Why?

AI agents are flying blind on costs. They pick models without knowing the price, run tasks without budget awareness, and generate surprise bills. AgentCost fixes this by giving agents the tools to understand and optimize their own spending.

## Tools

| Tool | Description |
|------|-------------|
| `estimate_cost` | Estimate cost for a model + token count before making the call |
| `compare_models` | Compare costs across models, get cheapest/best-value/best-quality picks |
| `check_budget` | Check if usage fits a daily budget, get smart switch suggestions |
| `find_cheapest` | Find cheapest model for a task (coding, reasoning, writing, etc.) |
| `list_models` | Browse all 20+ models across 7 providers with pricing |
| `get_model` | Deep-dive on a specific model with reference costs |

## Quick Start

### Install
```bash
npm install -g agentcost-mcp
```

### Use with Claude Desktop
Add to your `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "agentcost": {
      "command": "agentcost-mcp"
    }
  }
}
```

### Use with any MCP client
```bash
agentcost-mcp  # Runs on stdio
```

## Example: Agent Self-Optimization

An agent can call these tools to make smarter decisions:

```
Agent: "I need to process 50 customer emails. Let me check the cost first."

→ estimate_cost(model_id="anthropic/claude-sonnet-4", input_tokens=2000, output_tokens=500)
→ Result: $0.0135 per email, $0.675 total

Agent: "That's reasonable. But let me see if there's something cheaper..."

→ compare_models(input_tokens=2000, output_tokens=500, task="classification", min_quality=70)
→ Recommendation: "GPT-4.1 Nano ($0.0006/email) for classification. 98% cheaper."

Agent: "Perfect. I'll use Nano for classification, Sonnet for the complex replies."
```

## Models Covered (March 2026)

- **Anthropic:** Claude Opus 4, Sonnet 4, Haiku 3.5
- **OpenAI:** GPT-5.2, GPT-5.2 Codex, GPT-4.1, GPT-4.1 Mini/Nano, o3, o4-mini
- **Google:** Gemini 2.5 Pro, Gemini 2.5 Flash, Gemini 3 Pro (Preview)
- **DeepSeek:** V3, R1
- **xAI:** Grok 4
- **Mistral:** Mistral Large, Codestral

Prices updated from official provider pages. Open an issue if something's outdated.

## Agent Labs

Built by [Agent Labs](https://github.com/poweredbypiland) — tools built BY agents, FOR agents.

Part of the Powered By Piland portfolio. Because agents deserve infrastructure too.

## License

MIT
