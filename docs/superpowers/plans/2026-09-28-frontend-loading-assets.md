# Frontend Loading and Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce initial download cost and make remote image failures graceful without backend changes.

**Architecture:** Split page modules at router boundaries, optimize only repository-owned bitmap assets, and route remote image rendering through one fallback component. Remove resources only after reference checks prove they are unused.

**Tech Stack:** React 18, TypeScript, React Router, Vite, repository image tooling

**Spec:** `docs/superpowers/specs/2026-09-28-frontend-reliability-design.md`

## Global Constraints

- Modify only `ignoa-web`.
- Preserve current layouts and image appearance.
- Do not invent thumbnail URLs or backend media variants.
- Do not remove a package or stylesheet until source references are absent.

## Review Focus

- Direct navigation to every lazy route must render without a blank screen.
- Lazy route loading must retain the shared header and appropriate footer.
- Above-the-fold banner must not be accidentally lazy-loaded.
- A failed remote image must preserve its container dimensions and alt semantics.
- Optimized local images must not show visible color, crop, or transparency regressions.

---

### Task 1: Route-level code splitting

**Files:**
- Modify: `src/router/index.tsx`
- Modify or create: a shared route-loading fallback component if needed.

**Interfaces:**
- Produces: lazy route modules for every page while `Root` and providers remain eagerly loaded.

- [ ] Record the current production chunk sizes with `npm run build`.
- [ ] Convert page imports to React Router lazy route modules or `React.lazy` with a shared fallback.
- [ ] Build and verify that multiple JS chunks are emitted and all direct URLs render.

### Task 2: Repository-owned image optimization

**Files:**
- Replace: `src/assets/logo.png` with an optimized equivalent and update imports if the extension changes.
- Replace: `src/assets/banner-lightweight-puffer.png` with an optimized equivalent and update imports if needed.

**Interfaces:**
- Produces: visually equivalent local assets with smaller byte sizes.

- [ ] Record dimensions, transparency, and byte sizes before conversion.
- [ ] Convert with lossless or visually lossless settings; retain originals until visual verification succeeds.
- [ ] Inspect the optimized files and update imports.
- [ ] Build and compare emitted asset sizes against the baseline.

### Task 3: Remote image fallback behavior

**Files:**
- Modify: `src/components/common/ImageWithFallback.tsx`
- Modify: `src/components/common/ProductCard.tsx`
- Modify: `src/pages/ProductDetailPage.tsx`
- Modify: `src/pages/MessagesPage.tsx`
- Modify: `src/pages/ProfilePage.tsx`

**Interfaces:**
- Produces: reusable image fallback preserving `className`, dimensions, alt text, lazy/eager loading, and retry on `src` change.

- [ ] Add a failing component behavior check for a changed `src` after an error, or document the no-test-harness exception.
- [ ] Reset fallback state when `src` changes and prevent fallback recursion.
- [ ] Replace remote product/chat/profile `<img>` elements while keeping the hero image eager and cards lazy.
- [ ] Build and manually verify valid URLs, broken URLs, and URL changes.

### Task 4: Unused external resource cleanup

**Files:**
- Modify: `src/styles/fonts.css`
- Modify: `src/styles/index.css`
- Modify: `package.json`
- Modify: lockfile if dependency removal changes it.

**Interfaces:**
- Produces: only Pretendard and actually used styles/dependencies in the initial CSS graph.

- [ ] Confirm there are no runtime references to Playfair, Cabinet Grotesk, React Slick, or Slick class rules.
- [ ] Remove unused external font/Slick CSS imports and dead Slick selectors.
- [ ] Remove confirmed-unused slider dependencies through the package manager.
- [ ] Run `npm run build` and compare CSS/JS sizes with the baseline.
