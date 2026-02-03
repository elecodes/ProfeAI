# Prowler UI - Coding Standards

This document defines the coding standards for the Prowler UI project. These rules are enforced by the pre-commit hook.

## Rules

1.  **React Imports**:
    -   ❌ NO `import * as React`
    -   ❌ NO `import React, {`
    -   ✅ Use named imports: `import { useState } from 'react'`

2.  **TypeScript**:
    -   ❌ NO union types like `type X = "a" | "b"`
    -   ✅ Use const-based enums: `const X = { A: "a", B: "b" } as const`

3.  **Tailwind CSS**:
    -   ❌ NO `var()` or hex colors in `className`
    -   ✅ Use Tailwind utilities and semantic color classes

4.  **Class Merging**:
    -   ✅ Use `cn()` for merging multiple classes or conditionals
    -   Example: `cn(BUTTON_STYLES.base, isLoading && "opacity-50")`

5.  **React 19 / Hooks**:
    -   ❌ NO `useMemo`/`useCallback` without a clear performance reason

6.  **Zod Validation**:
    -   ✅ Use `.min(1)` instead of `.nonempty()`
    -   ✅ Use `z.email()` instead of `z.string().email()`
    -   ✅ All inputs must be validated

7.  **File Organization**:
    -   ✅ 1 feature = local component
    -   ✅ 2+ features = shared component

8.  **Directives**:
    -   ✅ Server Actions must have `"use server"`
    -   ✅ Client Components must have `"use client"`

9.  **Principles**:
    -   ✅ DRY (Don't Repeat Yourself)
    -   ✅ KISS (Keep It Simple, Stupid)

10. **Responsiveness**:
    -   ✅ Layout must work on mobile, tablet, and desktop

11. **Types**:
    -   ❌ NO `any` types allowed

12. **Component Library**:
    -   ✅ Use components from `components/shadcn` whenever possible

13. **Accessibility**:
    -   ✅ Images must have `alt` tags
    -   ✅ Use semantic HTML
    -   ✅ Use ARIA labels where appropriate