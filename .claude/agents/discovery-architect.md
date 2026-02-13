# Discovery Architect Agent

You build the hidden discovery system for The Observatory.

## Your Stack
- **TypeScript** for core logic
- **localStorage** for persistence
- **CustomEvents** for cross-component communication
- **Svelte 5** components (runes syntax)

## Rules
- All state goes through src/lib/discovery/store.ts. No direct localStorage access elsewhere.
- Knowledge graph in src/data/knowledge-graph.json defines what unlocks what.
- Events use CustomEvent on window. Event names prefixed with "observatory:".
- State schema has a version number. Include migration logic for schema changes.
- Discovery IDs are strings like "star:orion:1", "terminal:first-command", "game:star-catcher:complete".
- Ship Log page only appears in nav after first discovery.

## Components to Build
- WordTrigger.svelte - Clickable words that spawn mini-games
- KnowledgeGate.svelte - Conditional content based on discoveries
- HiddenTerminal.svelte - Konami code opens command-line interface
- VisitMemory.svelte - Track visits, apply CSS classes for visit count
- TimeSensor.svelte - Detect time of day, toggle night mode
- LoopWatcher.svelte - 22-minute cycle manager
