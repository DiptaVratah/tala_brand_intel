---
name: verification-before-completion
description: Use before claiming work is complete, fixed, or passing. MUST run verification commands and confirm output before any success claims. Evidence before assertions.
---

# Verification Before Completion

**Adapted for PulseCraft - integrates with code-review and safe-commit workflow**

## Overview

Claiming work is complete without verification breaks trust.

**Core principle:** Evidence before claims, always.

## The Iron Law

```
NO COMPLETION CLAIMS WITHOUT FRESH VERIFICATION EVIDENCE
```

If you haven't run verification in this message, you cannot claim it passes.

## Integration with Existing Workflow

| Action | Verification Required |
|--------|----------------------|
| Before `/safe-commit` | Run this skill |
| Before `code-review:code-review` | Run this skill |
| Before claiming "bug fixed" | Run this skill |
| Before saying "done" | Run this skill |

## The Gate Function

```
BEFORE claiming any status or completion:

1. IDENTIFY: What command proves this claim?
2. RUN: Execute the FULL command (fresh, complete)
3. READ: Full output, check exit code
4. VERIFY: Does output confirm the claim?
   - If NO: State actual status with evidence
   - If YES: State claim WITH evidence
5. ONLY THEN: Make the claim

Skip any step = unverified claim
```

## PulseCraft Verification Commands

### Frontend (CSS/UI)
```bash
# Check for CSS syntax errors (if build system exists)
# Visual verification in browser

# Check for hardcoded colors (should use CSS variables)
grep -r "#[0-9a-fA-F]\{6\}" pulsecraft_ui/*.css | grep -v ":root"

# Check for missing vendor prefixes
grep "backdrop-filter" pulsecraft_ui/*.css | wc -l
grep "\-webkit-backdrop-filter" pulsecraft_ui/*.css | wc -l
# Both counts should match
```

### Backend (if modified)
```bash
# Start server and check for errors
node server.js &
sleep 2
curl http://localhost:3000/health
# Should return 200 OK
```

### Git Status
```bash
# Before claiming "committed"
git status
git log -1 --oneline
# Verify commit exists and contains expected files
```

### Protected Files Check
```bash
# Before ANY commit - verify protected files unchanged
git diff --name-only HEAD~1 | grep -E "(gpt_router|schemas|server)\.js"
# Should return empty (no matches)
```

## Common Failures

| Claim | Requires | Not Sufficient |
|-------|----------|----------------|
| "Tests pass" | Test output: 0 failures | "Should pass" |
| "CSS fixed" | Visual verification | "Changed the code" |
| "Build works" | Build command: exit 0 | "Looks correct" |
| "Bug fixed" | Original symptom gone | "Code changed" |
| "Committed" | `git log` shows commit | "Ran git commit" |
| "PR ready" | All checks pass | "Code complete" |

## Red Flags - STOP

If you catch yourself:
- Using "should", "probably", "seems to"
- Saying "Great!", "Perfect!", "Done!" before verification
- About to commit without running checks
- Relying on previous run results
- Thinking "just this once"

**STOP. Run verification. Then claim.**

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Should work now" | RUN verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "I checked earlier" | Run FRESH check |
| "It's a small change" | Small changes break things |

## Verification Checklist for PulseCraft

### Before Claiming CSS Complete
- [ ] Opened in browser (not just code)
- [ ] Checked all three modes (Branding/Author/Self-Reflection)
- [ ] Checked mobile responsive (375px, 768px)
- [ ] No console errors
- [ ] Hover states work
- [ ] Focus states visible

### Before Claiming Bug Fixed
- [ ] Reproduced original bug
- [ ] Applied fix
- [ ] Bug no longer reproduces
- [ ] No new errors introduced
- [ ] Related functionality still works

### Before Commit
- [ ] `git status` shows expected files
- [ ] `git diff` reviewed
- [ ] No protected files modified
- [ ] No secrets staged (.env)
- [ ] Commit message follows convention

### Before PR
- [ ] All commits verified
- [ ] Code review skill will pass
- [ ] CLAUDE.md compliance checked

## The Bottom Line

**No shortcuts for verification.**

Run the command. Read the output. THEN claim the result.

This integrates with:
- `/safe-commit` command
- `code-review:code-review` skill
- `/audit-css` command

---

*Adapted from obra/superpowers - verification-before-completion*
*Integrated for PulseCraft by Dipta Vratah Anantagah*
