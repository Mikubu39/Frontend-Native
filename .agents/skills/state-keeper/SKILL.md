---
name: State Keeper
description: Manages the active session state, plans, and decisions.
---
# State Keeper Skill

## Responsibility
Maintain `.state/session_state.md` as the living record of the current session.

## Update Rules
- At session start, read `.state/session_state.md` if it exists; otherwise create it.
- After each major step (component implemented, bug fixed, blocker found, decision made), update this file.
- Use concise bullets; avoid narrative text.

## Session State Structure
The `.state/session_state.md` file must follow this structure:
```markdown
# Session State – React Native

## Mission
Ship a fast, stable, accessible RN app aligned with the roadmap.

## Session Goal
<one sentence goal description>

## Plan
- [ ] Step 1
- [ ] Step 2
...

## Progress
- Done: ...
- In progress: ...
- Blocked: ...

## Blockers
- ...

## Decisions
- ...
```
