import type { ItemSummary } from "@/types/api";

// 홈 목록 메모리 캐시: 상품을 보고 뒤로가기 했을 때 목록을 즉시 보여줘 스크롤 위치가 복원되게 한다.
// 새로고침하면 비워지며, 화면은 캐시를 먼저 그린 뒤 뒤에서 최신 목록으로 바꾼다
interface HomeItemsCache {
  authenticated: boolean;
  popular?: ItemSummary[];
  all?: ItemSummary[];
}

let cache: HomeItemsCache | null = null;

export const homeItemsCache = {
  get(authenticated: boolean) {
    return cache?.authenticated === authenticated ? cache : null;
  },
  set(authenticated: boolean, values: Pick<HomeItemsCache, "popular" | "all">) {
    const base = cache?.authenticated === authenticated ? cache : { authenticated };
    cache = { ...base, ...values };
  },
};
