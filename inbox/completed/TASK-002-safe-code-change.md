TASK-002 – Safe Code Change Simulation (No Live Writes)

Objective:
Simulate a real code change end-to-end (logs + diffs + changes) WITHOUT modifying the live app files in /app/current-version/.
All modifications should be written ONLY to /inbox/claude/changes/.

Target file:
- /app/current-version/js/debug-patch.js

This file is a debug utility and safe for a simulated change.

Instructions:

1. STATUS: IN-PROGRESS
   - Create or update a status file in:
     /inbox/claude/status/TASK-002-safe-code-change.json
   - Set:
     {
       "task": "TASK-002-safe-code-change",
       "status": "in-progress",
       "timestamp": "<current ISO timestamp>",
       "notes": "Starting safe simulated change on debug-patch.js"
     }

2. READ ORIGINAL FILE
   - Read the file:
     /app/current-version/js/debug-patch.js
   - Do NOT modify this file on disk.
   - Hold the content in memory.

3. PREPARE MODIFIED VERSION (IN MEMORY ONLY)
   - Create a modified version in memory by PREPENDING this comment line at the very top of the file:
     // TASK-002 TEST COMMENT: This is a safe simulated change and should not remain in production.
   - The rest of the file content must remain unchanged.

4. GENERATE DIFF (ORIGINAL vs MODIFIED)
   - Generate a unified (git-style) diff between:
     - original debug-patch.js
     - modified-in-memory debug-patch.js
   - Save this diff file to:
     /inbox/claude/diffs/DIFF-TASK-002-debug-patch.js.diff

5. WRITE MODIFIED FILE TO CHANGES ONLY
   - DO NOT write the modified version back into /app/current-version/js/.
   - Instead, write the modified version to:
     /inbox/claude/changes/TASK-002-debug-patch.js
   - This represents the "candidate" version for review, not an applied change.

6. WRITE LOG ENTRY
   - Create a log file in:
     /inbox/claude/logs/
   - Suggested name:
     LOG-TASK-002-safe-code-change.log
   - Log must include:
     - That debug-patch.js was read
     - That a comment line was prepended in-memory
     - That a diff file was written to /inbox/claude/diffs/
     - That a modified file was written to /inbox/claude/changes/
     - That the live app file in /app/current-version/js/ was NOT changed

7. STATUS: COMPLETED
   - Update the status file:
     /inbox/claude/status/TASK-002-safe-code-change.json
   - Set:
     {
       "task": "TASK-002-safe-code-change",
       "status": "completed",
       "timestamp": "<current ISO timestamp>",
       "notes": "Simulated change completed with no writes to app/current-version/"
     }

8. MOVE TASK FILE
   - Move this task file:
     /inbox/TASK-002-safe-code-change.md
   - To:
     /inbox/completed/TASK-002-safe-code-change.md
   - If /inbox/completed/ does not exist, ask for permission and create it (it already exists from TASK-001, but this rule is for safety).

Constraints and Safety:
- DO NOT modify the live file in /app/current-version/js/debug-patch.js.
- All changes must be written only into /inbox/claude/changes/.
- If any unexpected issue occurs, STOP, log the problem, set status to "blocked", and await further instruction.