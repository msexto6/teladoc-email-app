# Email Briefing App — Shared Memory Bus (Local Version)

This folder acts as the shared communication hub between three AIs:

- Gemini 3.0 Pro (Full-system analysis)
- GPT-5.1 (Architect and integrator)
- Claude (MCP engineer performing live edits)

## Folder Overview

/app/
    current-version/       → Live working code
    previous-versions/     → Snapshots for rollback

/inbox/
    claude/
        diffs/             → Unified diffs from Claude
        logs/              → Execution logs
        changes/           → JSON summaries of applied changes
    gemini/
        analysis/          → Whole-system reviews
        bug-reports/       → Error and issue reports
        architecture/       → System maps and dependency graphs
        suggestions/        → Refactor or improvement proposals
    gpt/
        architecture-decisions/ → Structural rulings
        specifications/          → Updated contracts and rules
        regressions/            → Detected regressions
        task-lists/             → Task definitions for Claude

/outbox/
    claude-tasks/              → Approved tasks for Claude
    gemini-analysis-requests/  → Structured requests for deep analysis
    gpt-final-specs/           → Final, approved output from GPT

/history/
    snapshots/                 → Timestamped system snapshots
    diff-log/                  → Chronological diffs
    decisions-log/             → Architectural decisions

## How to Use This Folder
1. Upload the current app into /app/current-version/
2. Run Gemini analysis on full zips or modules.
3. Paste Gemini’s outputs here and into GPT.
4. GPT creates safe tasks for Claude.
5. Claude executes tasks using MCP and logs changes.
6. GPT integrates results and updates system documentation.


## Conventions for AI Agents

If you are an AI using this hub, follow these rules to keep things consistent and easy to understand:

- **Never duplicate the entire app** into new random folders. Use:
  - `/app/current-version/` for the live code,
  - `/app/previous-versions/` for older full copies when absolutely necessary.
- **Put code changes and diffs** in `/history/diff-log/` with a clear date and sprint label.
- **Record important decisions** in `/history/decisions-log/` as short markdown files:
  - one decision per file,
  - filename pattern: `YYYY-MM-DD_decision-###-short-title.md`.
- **Use `/inbox` for inputs and instructions**:
  - `/inbox/claude/` for tasks and context meant for the engineer,
  - `/inbox/gemini/` for analysis targets,
  - `/inbox/gpt/` for architecture and planning.
- **Use `/outbox` for outputs that are ready to share**:
  - if it’s been reviewed and is safe for humans or other AIs to consume, it belongs in the relevant `/outbox` folder.
- **Keep files small and text-first** when possible:
  - prefer markdown, JSON, or code over binary formats,
  - link to large assets rather than copying them into history.

The goal of this structure is to make it easy for multiple AIs (Claude, GPT, Gemini, etc.) to collaborate on the same project without stepping on each other’s toes.
