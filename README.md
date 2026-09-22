# pong

Pong above the Claude Code prompt, for the minutes Claude spends working: rally against an AI paddle, first to 7 wins. The game pauses and its status line says so when Claude finishes the turn, so you never miss a reply. Playing costs no tokens: the mod answers every key and click itself.

Built the same way as the [`tetris`](../tetris) mod — the AI paddle just tracks the ball a cell at a time, so it's beatable, not psychic.

## Play

1. `/pong` opens the board above the prompt (`/pong stop` or the `close` button closes it).
2. **Click the board** to give it the keyboard; **Esc** gives the keyboard back to the prompt.
3. ↑ ↓ (or `w`/`s`) move your paddle (the left, cyan one). `p` pauses, `r` restarts. Hit the ball near the edge of your paddle to steepen its return.

Your best winning margin (points you won by) is kept in the plugin's store across sessions — a loss never overwrites it.

## Install

Written to `.claude/skills/pong/`, which Claude Code auto-loads as `pong@skills-dir`. For one session with hot reload: `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 claude --plugin-dir .claude/skills/pong`.

## Requirements

- Claude Code 2.1.269 or later (the first build whose function hooks draw above the prompt) with `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1`. The `$` API is early access and may change between releases.
- An interactive terminal that reports the mouse. Nothing draws in `claude -p`, the desktop app or mobile.
- A terminal font with box-drawing and block characters.
