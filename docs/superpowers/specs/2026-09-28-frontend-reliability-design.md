# Frontend Reliability and Loading Design

## Goal

Improve correctness, reconnect recovery, and initial loading using only `ignoa-web`, without changing API contracts or requiring new backend behavior.

## Included scope

- Keep auction actions in sync with the client-side deadline.
- Reconcile bid and chat state after a WebSocket reconnect using existing GET APIs.
- De-duplicate paginated and live chat messages by `message_id`.
- Lazy-load page routes.
- Compress the bundled logo and main banner without changing their appearance.
- Show a consistent fallback when remote product/chat images fail.
- Remove confirmed-unused font and Slick resources.
- Let public home data load independently of authentication initialization, while refreshing personalized data after authentication becomes known.
- Distinguish API failure from a valid empty product result.

## Excluded scope

- Backend thumbnail generation or responsive media variants.
- Changes to WebSocket payloads, event replay, or API response shapes.
- Server upload limits and client limits that would need to mirror an undecided server policy.
- Optimizing bid history by synthesizing complete history entries from incomplete events.
- Treating client-side auction expiry as authoritative; the server remains the final validator.

## Design

Correctness changes use existing authoritative APIs. Reconnect callbacks notify page-level consumers, which re-fetch current state without introducing a new global data library. Auction availability is derived from both server status and the current deadline.

Loading changes preserve the current UI. Routes are split with React lazy loading, local bitmap assets are replaced with visually equivalent compressed files, image fallback behavior is centralized, and unused external resources are removed only after confirming there are no references.

## Success criteria

- Auction actions disable when the displayed countdown reaches zero.
- A reconnect refreshes the current bid/chat state and does not create duplicate messages.
- Direct navigation to every route still renders correctly.
- Broken remote images show a stable fallback without layout shift.
- Empty product results and failed requests render different states.
- Production build succeeds and the initial JS/assets are smaller than the current build.
