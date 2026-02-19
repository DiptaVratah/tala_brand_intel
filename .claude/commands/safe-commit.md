# Safe Commit - Protected Commit Workflow

Create a commit with safety checks for PulseCraft.

## Pre-Commit Checks

1. **Protected Files Check** - Verify no protected files are staged:
   - `gpt_router.js` - MUST NOT be modified
   - `schemas.js` - MUST NOT be modified
   - `server.js` - MUST NOT be modified (core logic only)
   - `services/latentMeta.js` - MUST NOT be modified

2. **CSS Standards Check** - Verify CSS follows standards:
   - No hardcoded hex colors (should use CSS variables)
   - No magic numbers for durations (should use --duration-* tokens)

3. **Secrets Check** - Verify no secrets are staged:
   - No `.env` files
   - No API keys or credentials

## Commit Process

1. Run `git status` to see staged files
2. Run `git diff --cached` to review changes
3. Check against protected files list
4. If safe, create commit with conventional format:
   ```
   <type>(<scope>): <description>

   Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
   ```

## Types
- feat: New feature
- fix: Bug fix
- perf: Performance improvement
- style: CSS/styling changes
- docs: Documentation
- refactor: Code refactoring
- chore: Maintenance

## Scopes
- ui: Frontend/CSS changes
- backend: Server-side changes
- api: API endpoints
- config: Configuration changes
