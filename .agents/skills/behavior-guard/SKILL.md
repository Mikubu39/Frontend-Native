---
name: Behavior Guard
description: Prevents tool-use loops, checks limits, and implements safety guards.
---
# Behavior Guard Skill

## Loop Prevention
- If you notice yourself repeating the same pattern or command with no progress, stop immediately.
- Summarize what you've tried, explain the obstacle, and ask the user for guidance or propose an alternative.
- Do not call the same tool more than 3 times with the exact same arguments.

## Verification
- Before completing tasks, run tests/linters if available.
- Describe exactly what has changed and what manual testing the user should perform on the React Native emulator or device.

## Safety Guard
- Ask for explicit user confirmation before executing any destructive operations (like deleting major files, folders, or clearing databases).
