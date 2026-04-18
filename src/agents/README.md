# Agents

This directory is reserved for AI agent modules.

## Intended purpose

Future AI agents for StickyBoard can be placed here. Examples:

- **SummaryAgent** — Summarizes the content of all notes on the board using an LLM.
- **TaggingAgent** — Automatically categorizes and tags notes based on their content.
- **SearchAgent** — Semantic search across note contents using embeddings.
- **AutoLayoutAgent** — Suggests or applies optimal note arrangements on the board.

Each agent should be a self-contained module that receives board state and returns structured results.
