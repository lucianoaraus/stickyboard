# Skills

This directory is reserved for reusable AI skill modules.

## Intended purpose

Skills are discrete, reusable capabilities that agents can compose. Examples:

- **formatNote** — Reformat or clean up note content via an LLM prompt.
- **translateNote** — Translate note content to another language.
- **extractKeywords** — Extract key topics from note text.
- **suggestColor** — Suggest a note color based on content sentiment or topic.
- **generateNote** — Generate a new note given a brief prompt.

Each skill should export a typed async function with a clear input/output contract.
