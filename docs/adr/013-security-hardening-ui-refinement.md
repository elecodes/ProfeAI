# ADR 013: Security Hardening and Dialogue UI Refinement

## Status
Accepted

## Context
A recent security audit (Snyk) identified multiple critical and high-severity vulnerabilities in transitive dependencies:
- `path-to-regexp`: Vulnerable to Denial of Service (DoS) via regular expression complexity.
- `yaml`: Vulnerable to prototype pollution and other security risks in older versions.
- `fast-xml-parser`: Vulnerable to stack overflow and ReDoS.

Additionally, the UI for the Dialogue Tutor (`DialogueViewer.tsx`) had accessibility and aesthetic issues:
- Grey cards (`slate-700`) appeared "muddy" and had poor contrast.
- Speaker names and translation buttons in `amber-200` were difficult to read against dark backgrounds.

## Decision
We implemented a two-fold improvement strategy:

### 1. Security Hardening
- **Monorepo Overrides**: Implemented `overrides` in the root `package.json` to force secure versions of transitive dependencies:
  - `path-to-regexp@0.1.13`
  - `yaml@2.8.3`
  - `fast-xml-parser@5.6.0`
- **Core SDK Upgrades**: Updated direct dependencies to their latest secure versions:
  - `@aws-sdk/client-polly@3.991.0`
  - `langchain@1.2.8`
  - `genkit@0.2.18`

### 2. Dialogue UI Refinement
- **Brand Alignment**: Switched the dark card background from generic `slate-700` to the brand's `secondary` color (`var(--color-secondary)` / #2D3748).
- **Contrast Optimization**: Upgraded highlight colors from `amber-200` to `amber-300` for better visibility and vibrancy against dark backgrounds.
- **Visual Depth**: Added a subtle `border-white/10` to dark cards to improve definition and provide a more premium, layered feel.

## Consequences
- **Improved Security Posture**: Resolved critical vulnerabilities reported by Snyk without requiring deep dependency tree refactoring.
- **Better Accessibility**: Text elements in the Dialogue mode now meet higher contrast standards.
- **Unified Aesthetics**: The application feels more cohesive by utilizing the defined design tokens (secondary color) instead of ad-hoc Tailwind shades.
- **Maintenance**: We must regularly audit the `overrides` section in `package.json` as dependencies evolve to ensure they don't block necessary updates.
