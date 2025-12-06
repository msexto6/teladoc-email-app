TASK-001 – Baseline Verification Test

Objective:
Verify that Claude's full task lifecycle, logging, diff generation, 
status file handling, and inbox file movement are working correctly.

Instructions:

1. Create a status file for this task in:
   /inbox/claude/status/
   Name: TASK-001-in-progress.json

2. Read the directory:
   /app/current-version/
   This is only a read operation (no modifications expected).

3. Generate a unified diff file comparing:
   /app/current-version/
   against itself.
   (This should produce an empty or zero-diff result, validating the diff pipeline.)
   Save the diff file to:
   /inbox/claude/diffs/
   Name: DIFF-TASK-001-baseline.diff

4. Write a log entry documenting:
   - Task start
   - Directories read
   - Diff generation
   - Status transitions
   Save to:
   /inbox/claude/logs/

5. Update the status file to:
   TASK-001-completed.json

6. Move this task file into:
/inbox/completed/
(Create this folder if it does not exist;
ask permission before creating it.)

Expected Result:
Claude should perform all pipeline actions with no modifications to app code.