# Audit CSS - Check CSS Standards Compliance

Audit CSS files against PulseCraft design standards.

## Checks to Perform

### 1. Hardcoded Colors
Search for hex colors that should be CSS variables:
```
Grep: #[0-9a-fA-F]{3,6} in pulsecraft_ui/*.css
```
Flag any that aren't in :root definitions.

### 2. Magic Numbers
Search for raw duration values:
```
Grep: [0-9]+\.?[0-9]*s in pulsecraft_ui/*.css
```
Should use `var(--duration-*)` tokens instead.

### 3. Missing Vendor Prefixes
Check backdrop-filter has webkit prefix:
```
Grep: backdrop-filter in pulsecraft_ui/*.css
```
Each should have corresponding `-webkit-backdrop-filter`.

### 4. Missing Cursor Pointer
Check interactive elements have cursor pointer.

### 5. Design Token Usage
Verify these tokens are used consistently:
- `--duration-instant/fast/base/slow/reveal`
- `--ease-smooth/bounce/out`
- `--blur-shallow/medium/deep`
- `--radius-sm/md/lg/xl/2xl`
- `--lift-subtle/medium/emphasis`

## Output
Report any violations with file:line references.
Suggest fixes using the correct CSS variable.
