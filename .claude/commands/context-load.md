# Context Load - Session Initialization

Execute the mandatory session initialization sequence for PulseCraft.

## Steps

1. **Query Memory** - Retrieve identity and equation:
   ```
   mcp__memory__search_nodes("Dipta Vratah Anantagah")
   ```

2. **Read Golden Rules** - Load skill triggers and protected files:
   ```
   Read: .planning/GOLDEN_RULES.md
   ```

3. **Scan Planning Context** - Understand current milestone and phase:
   ```
   Glob: .planning/**/*.md
   Read any active PLAN.md, ROADMAP.md, or VERIFICATION.md files
   ```

4. **Code Orientation** - Quick read of key files:
   ```
   Read: pulsecraft_ui/style.css (first 100 lines for design tokens)
   Read: CLAUDE.md for compliance rules
   ```

5. **Report** - Summarize:
   - Who: Identity retrieved from memory
   - Where: Current phase/milestone
   - What: Recent changes or active work

This command ensures full context at session start.
