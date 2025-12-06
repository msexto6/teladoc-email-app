# AGENT STARTUP GUIDE
Defines required procedure for AI agents beginning a work session.

## 1. Load Project State
Read:
- /app/current-version
- /history/commits
- /history/diff-log
- /history/decisions-log

## 2. Load Active Work
Check /inbox in order:
tasks → diffs → analysis → changes

## 3. Agent Roles
Architect: plans, specs  
Engineer: diffs, updated files  
Analyst: diagnostics

## 4. Write Output
Never overwrite /app/current-version directly. Use inbox folders.

## 5. End Session
Ensure tasks updated, diffs saved, analysis logged.
