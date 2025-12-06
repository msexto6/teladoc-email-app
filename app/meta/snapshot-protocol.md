SNAPSHOT PROTOCOL v1.0
======================

Purpose
-------
Define a consistent, reproducible process for capturing application state
at critical junctures in the development cycle to enable rollback, auditing,
and multi-AI collaboration.

Trigger Conditions
------------------
1. Before major refactoring tasks
2. After successful deployment
3. Before destructive operations
4. On request from any AI collaborator
5. At phase boundaries

Snapshot Structure
------------------
email-app-shared-memory/
└── history/
    └── snapshots/
        └── <TIMESTAMP>/
            ├── app/               # Complete application copy
            ├── manifest.json      # Metadata and file registry
            └── commit.md          # Human-readable summary

Manifest Schema
---------------
{
  "timestamp": "YYYY-MM-DD_HH-MM-SS",
  "version": "vX.Y.Z",
  "executed_by": "Claude MCP | Gemini | GPT-5.1",
  "triggered_by_task": "task-id or manual",
  "reason": "Brief description",
  "files": [
    {
      "path": "relative/to/app/root",
      "size": bytes,
      "checksum": "sha256:hash",
      "modified": "ISO-8601"
    }
  ],
  "stats": {
    "total_files": number,
    "total_size": bytes,
    "js_files": number,
    "css_files": number,
    "html_files": number
  }
}

Execution Process
-----------------
1. Generate timestamp: YYYY-MM-DD_HH-MM-SS
2. Create snapshot directory: history/snapshots/<TIMESTAMP>/
3. Copy entire app directory to snapshot location
4. Generate manifest.json with checksums
5. Write commit.md with:
   - Timestamp
   - Reason for snapshot
   - Key changes since last snapshot
   - File statistics
6. Log operation to inbox/<AI>/logs/<TIMESTAMP>-snapshot.log

Rollback Process
----------------
1. Identify target snapshot by timestamp
2. Backup current state to history/snapshots/<TIMESTAMP>-rollback/
3. Copy target snapshot to application directory
4. Update manifest with rollback metadata
5. Log rollback operation

Retention Policy
----------------
- Keep all snapshots for 30 days
- After 30 days, keep only:
  - Phase boundary snapshots
  - Pre-deployment snapshots
  - Tagged important snapshots

Tagging System
--------------
Special snapshots can be tagged for preservation:
- baseline: Initial state
- phase-N-complete: Phase completion
- pre-deploy: Before production push
- stable: Known good configuration

Implementation Notes
--------------------
- Use SHA256 for checksums
- Exclude node_modules and .git directories
- Include all configuration files
- Preserve file permissions
- Maintain directory structure

Error Handling
--------------
If snapshot fails:
1. Log error to inbox/<AI>/logs/snapshot-error.log
2. Alert other AIs via outbox
3. Do not proceed with destructive operations
4. Request manual intervention if needed
