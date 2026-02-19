---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior. MUST be used before proposing fixes. Integrates with ralph-wiggum for complex multi-step debugging.
---

# Systematic Debugging

**Adapted for PulseCraft - builds on top of existing workflow**

## Overview

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law

```
NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST
```

If you haven't completed Phase 1, you cannot propose fixes.

## Integration with Existing Workflow

| Scenario | Use |
|----------|-----|
| Simple bug, clear cause | This skill alone |
| Complex bug, multiple attempts failing | This skill + `ralph-wiggum:ralph-loop` |
| Bug in protected files | STOP - escalate to user (gpt_router.js, schemas.js, server.js are sacred) |

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- CSS rendering issues
- API integration problems

**Use ESPECIALLY when:**
- Under time pressure
- "Just one quick fix" seems obvious
- Previous fix didn't work
- You don't fully understand the issue

## The Four Phases

### Phase 1: Root Cause Investigation

**BEFORE attempting ANY fix:**

1. **Read Error Messages Carefully**
   - Don't skip past errors or warnings
   - Read stack traces completely
   - Note line numbers, file paths, error codes

2. **Reproduce Consistently**
   - Can you trigger it reliably?
   - What are the exact steps?
   - If not reproducible → gather more data, don't guess

3. **Check Recent Changes**
   - What changed that could cause this?
   - `git diff`, recent commits
   - New dependencies, config changes

4. **Gather Evidence in Multi-Component Systems**

   For PulseCraft (frontend + backend + AI):
   ```
   Frontend Issue:
   - Check browser console
   - Check network tab for API failures
   - Check CSS specificity conflicts

   Backend Issue:
   - Check server logs
   - Trace API request through gpt_router.js
   - Check Zod validation errors

   AI Integration Issue:
   - Check streaming response
   - Verify API keys in env
   - Check rate limits
   ```

5. **Trace Data Flow**
   - Where does bad value originate?
   - What called this with bad value?
   - Keep tracing up until you find the source
   - Fix at source, not at symptom

### Phase 2: Pattern Analysis

1. **Find Working Examples**
   - Locate similar working code in same codebase
   - What works that's similar to what's broken?

2. **Compare Against References**
   - Use Context7 MCP to query documentation
   - Read reference implementation COMPLETELY

3. **Identify Differences**
   - What's different between working and broken?
   - List every difference, however small

### Phase 3: Hypothesis and Testing

1. **Form Single Hypothesis**
   - State clearly: "I think X is the root cause because Y"
   - Be specific, not vague

2. **Test Minimally**
   - Make SMALLEST possible change
   - One variable at a time
   - Don't fix multiple things at once

3. **Verify Before Continuing**
   - Did it work? Yes → Phase 4
   - Didn't work? Form NEW hypothesis
   - DON'T add more fixes on top

### Phase 4: Implementation

1. **Create Failing Test Case** (if applicable)
   - Simplest possible reproduction
   - MUST have before fixing

2. **Implement Single Fix**
   - Address root cause identified
   - ONE change at a time
   - No "while I'm here" improvements

3. **Verify Fix**
   - Test passes now?
   - No other tests broken?
   - Use `verification-before-completion` skill

4. **If 3+ Fixes Failed**
   - STOP - this indicates architectural problem
   - Question fundamentals with user
   - May need to escalate or redesign

## Red Flags - STOP and Follow Process

If you catch yourself thinking:
- "Quick fix for now, investigate later"
- "Just try changing X and see if it works"
- "It's probably X, let me fix that"
- "I don't fully understand but this might work"

**ALL of these mean: STOP. Return to Phase 1.**

## PulseCraft-Specific Debugging

### CSS Issues
```
1. Check browser DevTools computed styles
2. Check specificity (use --important only as last resort)
3. Verify CSS variables are defined in :root
4. Check for conflicting styles in shapeshifter.css modes
```

### Backend Issues (READ-ONLY - Protected Files)
```
If bug is in protected files (gpt_router.js, schemas.js, server.js):
- DO NOT attempt to fix
- Document the issue
- Escalate to user
- Suggest workaround that builds ON TOP
```

### Streaming/AI Issues
```
1. Check Vercel AI SDK patterns
2. Verify streaming is not being blocked
3. Check Zod validation on responses
4. Use Context7 to query latest SDK docs
```

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| **1. Root Cause** | Read errors, reproduce, gather evidence | Understand WHAT and WHY |
| **2. Pattern** | Find working examples, compare | Identify differences |
| **3. Hypothesis** | Form theory, test minimally | Confirmed or rejected |
| **4. Implementation** | Create test, fix, verify | Bug resolved, verified |

## Escalation to Ralph Loop

If after 2 hypothesis cycles the bug persists:
```
Invoke: ralph-wiggum:ralph-loop
Provide: Root cause analysis from Phase 1-2
Let Ralph iterate with fresh context
```

---

*Adapted from obra/superpowers - systematic-debugging*
*Integrated for PulseCraft by Dipta Vratah Anantagah*
