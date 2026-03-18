# KitZ Brain CLI

Interactive AI business assistant for the terminal. Repurposes the KitZ Brain
(agentic loop from `kitz_gateway_ts/src/brain/`) and adds Google Workspace
integration (Gmail, Calendar, Drive).

## Architecture

```
kitz-cli/
├── src/
│   ├── cli.ts              # Entry point — REPL, onboarding, slash commands
│   ├── auth/
│   │   └── google.ts       # OAuth2 flow (browser callback on :3456)
│   ├── brain/
│   │   ├── router.ts       # Agentic loop — multi-turn tool execution
│   │   └── systemPrompt.ts # Adaptive prompt with tool descriptions
│   ├── llm/
│   │   ├── types.ts        # LlmMessage, LlmToolDef, LlmRequest/Response
│   │   ├── router.ts       # LLM init + call wrapper
│   │   └── providers/
│   │       └── claude.ts   # Anthropic Claude provider
│   └── tools/
│       ├── registry.ts     # ToolRegistry class
│       ├── gmail.ts        # Gmail: search, read, draft, send, labels
│       ├── calendar.ts     # Calendar: list, create, free time, delete
│       ├── drive.ts        # Drive: search, recent files
│       └── builtin.ts      # utc_now, shell_exec
```

## How It Works

1. **REPL** — user types natural language in terminal
2. **Brain** — builds system prompt + conversation history, calls Claude
3. **Tool loop** — Claude calls tools (Gmail, Calendar, etc.), brain executes,
   feeds results back, Claude synthesizes response
4. **Max 8 iterations** per turn to prevent runaway loops

## Commands

```bash
npm run dev           # Run with tsx (dev mode)
npm run build         # Compile TypeScript
npm start             # Run compiled version
npm run typecheck     # Type-check only
```

## Setup

1. Set `ANTHROPIC_API_KEY` in `.env`
2. For Google Workspace: set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
3. First run triggers OAuth2 browser flow; token stored in `~/.kitz/google-token.json`
4. Profile saved to `~/.kitz/cli-profile.json`

## Slash Commands

| Command | Description |
|---------|-------------|
| `/help` | Show example prompts |
| `/tools` | List available tools |
| `/clear` | Clear conversation history |
| `/profile` | View business profile |
| `/exit` | Quit |

## Relationship to Gateway Brain

This CLI repurposes the brain pattern from `kitz_gateway_ts/src/brain/`:
- **Same**: Agentic loop, tool execution, system prompt pattern
- **Different**: No Supabase dependency, no WhatsApp, file-based memory,
  Google Workspace tools instead of business tools, CLI REPL instead of HTTP
