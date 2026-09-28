# Frontend Reliability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix deadline state, WebSocket recovery, chat duplication, and public-home loading using existing frontend APIs.

**Architecture:** Socket factories expose reconnect notifications while pages remain responsible for fetching their authoritative state. Small pure merge/status helpers isolate correctness rules from page rendering.

**Tech Stack:** React 18, TypeScript, React Router, STOMP, Vite

**Spec:** `docs/superpowers/specs/2026-09-28-frontend-reliability-design.md`

## Global Constraints

- Modify only `ignoa-web`.
- Do not change API contracts or require backend deployment.
- The server remains authoritative for auction and authentication decisions.
- Preserve current visual layout and Korean copy unless an error state needs distinct copy.

## Review Focus

- Deadline passes while a bid or buy-now modal is open: close the modal and disable actions.
- Socket disconnects during incoming traffic: reconnect must fetch authoritative state once.
- Pagination resolves after a live message: each `message_id` must appear once.
- Authentication resolves after public products load: personalized wish state must refresh correctly.
- Failed product requests: do not present failure as an empty catalog.

---

### Task 1: Auction expiry state

**Files:**
- Modify: `src/pages/ProductDetailPage.tsx`

**Interfaces:**
- Consumes: `item.status`, `item.end_at`, existing countdown interval.
- Produces: a derived `auctionActive` boolean used by seller and buyer actions.

- [ ] Add a failing check for active-to-expired transition behavior, or document the no-test-harness exception before implementation.
- [ ] Replace text-only expiry handling with state that flips once at the deadline.
- [ ] Close bid and buy-now modals when expiry occurs and use `auctionActive` for disabled labels/actions.
- [ ] Run `npm run build` and manually verify an already-expired item plus a near-expiry item.

### Task 2: WebSocket reconnect reconciliation

**Files:**
- Modify: `src/lib/bidSocket.ts`
- Modify: `src/lib/chatSocket.ts`
- Modify: `src/context/ChatContext.tsx`
- Modify: `src/pages/ProductDetailPage.tsx`
- Modify: `src/pages/MessagesPage.tsx`

**Interfaces:**
- Produces: optional `onConnected(reconnected: boolean)` callbacks from both socket factories.
- Consumes: existing item, bid, room-list, and message GET APIs.

- [ ] Add a failing check for initial-connect versus reconnect notification, or document the no-test-harness exception.
- [ ] Expose connection-generation callbacks without changing subscription destinations.
- [ ] On bid reconnect, fetch item detail and bid history; ignore stale generations.
- [ ] On chat reconnect, refresh room previews and the selected room messages; preserve the current selection and scroll behavior.
- [ ] Run `npm run build` and manually interrupt/restart each socket connection.

### Task 3: Chat message de-duplication

**Files:**
- Modify: `src/pages/MessagesPage.tsx`

**Interfaces:**
- Produces: one message merge path keyed by `message_id` and sorted ascending.

- [ ] Add a failing merge case where paginated and live arrays contain the same ID, or document the no-test-harness exception.
- [ ] Use the merge path for initial load, older-message pagination, reconnect refresh, and live delivery.
- [ ] Preserve scroll offset when older unique messages are prepended.
- [ ] Run `npm run build` and verify no duplicate React keys/messages.

### Task 4: Public home loading and error states

**Files:**
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: existing `itemApi.getItems` queries.
- Produces: independent loading, error, empty, and success states for both lists.

- [ ] Add a failing state-transition check for request failure versus empty success, or document the no-test-harness exception.
- [ ] Start public requests on mount instead of blocking on auth initialization.
- [ ] Re-fetch after authentication settles so personalized fields are correct.
- [ ] Add stale guards to both requests and show retryable error copy distinct from the empty state.
- [ ] Run `npm run build` and manually verify anonymous, authenticated, empty, and failed responses.
