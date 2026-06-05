import { wishApi } from "@/api/item";

export interface WishState {
  wished: boolean;
  count: number;
}

export type WishEventSource = "sync" | "toggle" | "commit" | "rollback";

type Listener = (id: number, state: WishState, source: WishEventSource) => void;

const states = new Map<number, WishState>();
const pendingCounts = new Map<number, number>();
const listeners = new Set<Listener>();

const notify = (id: number, state: WishState, source: WishEventSource) =>
  listeners.forEach((listener) => listener(id, state, source));

const set = (id: number, state: WishState, source: WishEventSource) => {
  states.set(id, state);
  notify(id, state, source);
};

const beginPending = (id: number) =>
  pendingCounts.set(id, (pendingCounts.get(id) ?? 0) + 1);

const endPending = (id: number) => {
  const remaining = (pendingCounts.get(id) ?? 0) - 1;
  if (remaining > 0) pendingCounts.set(id, remaining);
  else pendingCounts.delete(id);
};

export const wishStore = {
  get: (id: number) => states.get(id),

  sync: (id: number, wished: boolean, count: number) => {
    if (pendingCounts.has(id)) return;
    const prev = states.get(id);
    if (prev && prev.wished === wished && prev.count === count) return;
    set(id, { wished, count }, "sync");
  },

  toggle: async (id: number, fallback: WishState) => {
    const prev = states.get(id) ?? fallback;
    const next: WishState = prev.wished
      ? { wished: false, count: Math.max(prev.count - 1, 0) }
      : { wished: true, count: prev.count + 1 };

    beginPending(id);
    set(id, next, "toggle");
    try {
      if (next.wished) await wishApi.addWish(id);
      else await wishApi.removeWish(id);
      notify(id, states.get(id) ?? next, "commit");
    } catch (error) {
      set(id, prev, "rollback");
      throw error;
    } finally {
      endPending(id);
    }
  },

  clear: () => {
    states.clear();
    pendingCounts.clear();
  },

  subscribe: (fn: Listener) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  },
};
