import { useState, useRef, useEffect, useCallback } from "react";
import { homeItemsCache } from "@/store/homeItemsCache";
import { wishStore } from "@/store/wishStore";
import { ProductCard } from "@/components/common/ProductCard";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { itemApi } from "@/api/item";
import { useAuth } from "@/context/AuthContext";
import type { ItemSummary } from "@/types/api";
import lightweightPufferBanner from "@/assets/banner-lightweight-puffer-optimized.jpg";
import shoesBanner from "@/assets/banner-shoes.jpg";
import circleBanner from "@/assets/banner-circle.jpg";
import posterBanner from "@/assets/banner-poster.jpg";

const bannerSlides = [
  {
    type: "collection" as const,
    image: lightweightPufferBanner as string | null,
    label: "Curated Collection",
    title: "Light Down",
    subtitle: "환절기부터 초겨울까지, 가볍게",
  },
  {
    type: "fee" as const,
    image: null as string | null,
    label: "수수료 0원",
    title: "영원히 0원",
    subtitle: "판매 수수료 0원. 새로운 수수료 정책이 시작됩니다.",
  },
  {
    type: "typography" as const,
    image: null as string | null,
    label: "BID ON YOUR STYLE",
    title: "취향을 낙찰받다",
    subtitle: "단 한 번의 입찰로 완성되는 컬렉션.",
  },
];

// 임시 문구: 실제 기획전 문구가 정해지면 교체한다
const curationBanners = [
  { image: shoesBanner, label: "Local Auction", title: "우리 동네 신발장, 경매로 새 주인 찾기" },
  { image: circleBanner, label: "Meet the Neighbor", title: "가까운 사람과 주고받는 취향" },
  { image: posterBanner, label: "Pop-up", title: "이번 주말, 동네 플리마켓 소식" },
];

// 사진 아래쪽을 어둡게 깔고 라벨과 제목을 얹는다
function CurationBanner({ image, label, title }: { image: string; label: string; title: string }) {
  return (
    <div className="relative h-[340px] overflow-hidden rounded-2xl">
      <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/70">{label}</p>
        <p className="mt-1.5 line-clamp-2 text-xl font-bold leading-snug text-white md:text-2xl">{title}</p>
      </div>
    </div>
  );
}

function toProductCardProps(item: ItemSummary) {
  return {
    id: String(item.item_id),
    brand: item.brand,
    title: item.title,
    currentPrice: item.current_price,
    imageUrl: item.media_url,
    isWished: item.is_wished,
    wishCount: item.wish_count,
    status: item.status,
    isEnded: new Date(item.end_at) < new Date(),
  };
}

// 서버 목록의 찜 상태가 기준이다. 카드가 먼저 넣어 둔 값(seed)을 덮어쓴다
function syncWishes(items: ItemSummary[]) {
  items.forEach((item) => wishStore.sync(item.item_id, item.is_wished, item.wish_count));
}

const LATEST_PAGE_SIZE = 20;

export function HomePage() {
  const { isAuthenticated, isInitializing } = useAuth();
  const [ctaSlide, setCtaSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  // 뒤로가기로 돌아온 경우 캐시한 목록을 바로 그린다(로딩·등장 애니메이션 없이)
  const [cached] = useState(() => homeItemsCache.get(isAuthenticated));
  const [popularItems, setPopularItems] = useState<ItemSummary[]>(cached?.popular ?? []);
  const [endingSoonItems, setEndingSoonItems] = useState<ItemSummary[]>(cached?.endingSoon ?? []);
  const [allItems, setAllItems] = useState<ItemSummary[]>(cached?.all ?? []);
  const [popularLoading, setPopularLoading] = useState(!cached?.popular);
  const [endingSoonLoading, setEndingSoonLoading] = useState(!cached?.endingSoon);
  const [allLoading, setAllLoading] = useState(!cached?.all);
  const [popularError, setPopularError] = useState(false);
  const [endingSoonError, setEndingSoonError] = useState(false);
  const [allError, setAllError] = useState(false);
  const [popularReload, setPopularReload] = useState(0);
  const [endingSoonReload, setEndingSoonReload] = useState(0);
  const [allReload, setAllReload] = useState(0);
  const [allNextCursor, setAllNextCursor] = useState<number | null>(cached?.allNextCursor ?? null);
  const [allHasNext, setAllHasNext] = useState(cached?.allHasNext ?? false);
  const [allLoadingMore, setAllLoadingMore] = useState(false);
  const allLoadingMoreRef = useRef(false);
  const allSentinelRef = useRef<HTMLDivElement>(null);

  const popularRef = useRef(null);
  const endingSoonRef = useRef(null);
  const allProductsRef = useRef(null);

  const popularInView = useInView(popularRef, { once: true, amount: 0.1 });
  const endingSoonInView = useInView(endingSoonRef, { once: true, amount: 0.1 });
  const allProductsInView = useInView(allProductsRef, { once: true, amount: 0.1 });

  useEffect(() => {
    // 로그인 확인 전에 비로그인 목록(찜 여부 없음)을 받지 않는다
    if (isInitializing) return;
    let stale = false;
    // 캐시가 있으면 화면을 유지한 채 뒤에서 새로 고친다
    const hasCache = Boolean(homeItemsCache.get(isAuthenticated)?.popular);
    if (!hasCache) setPopularLoading(true);
    setPopularError(false);
    itemApi
      .getItems({ view: "POPULAR", size: 5 }, { public: !isAuthenticated })
      .then((res) => {
        if (stale) return;
        setPopularItems(res.content);
        homeItemsCache.set(isAuthenticated, { popular: res.content });
        syncWishes(res.content);
      })
      .catch(() => { if (!stale && !hasCache) setPopularError(true); })
      .finally(() => { if (!stale) setPopularLoading(false); });
    return () => { stale = true; };
  }, [isAuthenticated, isInitializing, popularReload]);

  useEffect(() => {
    if (isInitializing) return;
    let stale = false;
    const hasCache = Boolean(homeItemsCache.get(isAuthenticated)?.endingSoon);
    if (!hasCache) setEndingSoonLoading(true);
    setEndingSoonError(false);
    itemApi
      .getItems({ view: "ENDING_SOON", size: 5 }, { public: !isAuthenticated })
      .then((res) => {
        if (stale) return;
        setEndingSoonItems(res.content);
        homeItemsCache.set(isAuthenticated, { endingSoon: res.content });
        syncWishes(res.content);
      })
      .catch(() => { if (!stale && !hasCache) setEndingSoonError(true); })
      .finally(() => { if (!stale) setEndingSoonLoading(false); });
    return () => { stale = true; };
  }, [isAuthenticated, isInitializing, endingSoonReload]);

  useEffect(() => {
    if (isInitializing) return;
    let stale = false;
    const cachedAll = homeItemsCache.get(isAuthenticated)?.all;
    const hasCache = Boolean(cachedAll);
    // 이어 받은 페이지까지 캐시돼 있으면 뒤로가기 스크롤 위치를 지키려고 첫 페이지로 덮어쓰지 않는다
    if (cachedAll && cachedAll.length > LATEST_PAGE_SIZE) return;
    if (!hasCache) setAllLoading(true);
    setAllError(false);
    itemApi
      .getItems({ view: "LATEST", size: LATEST_PAGE_SIZE }, { public: !isAuthenticated })
      .then((res) => {
        if (stale) return;
        setAllItems(res.content);
        setAllNextCursor(res.next_cursor);
        setAllHasNext(res.has_next);
        homeItemsCache.set(isAuthenticated, { all: res.content, allNextCursor: res.next_cursor, allHasNext: res.has_next });
        syncWishes(res.content);
      })
      .catch(() => { if (!stale && !hasCache) setAllError(true); })
      .finally(() => { if (!stale) setAllLoading(false); });
    return () => { stale = true; };
  }, [isAuthenticated, isInitializing, allReload]);

  // 최신순 목록 끝에 닿으면 next_cursor로 다음 페이지를 이어 받는다
  const loadMoreLatest = useCallback(() => {
    if (allLoadingMoreRef.current || !allHasNext || allNextCursor === null) return;
    allLoadingMoreRef.current = true;
    setAllLoadingMore(true);
    itemApi
      .getItems({ view: "LATEST", cursor: allNextCursor, size: LATEST_PAGE_SIZE }, { public: !isAuthenticated })
      .then((res) => {
        setAllItems((prev) => {
          const known = new Set(prev.map((item) => item.item_id));
          const next = [...prev, ...res.content.filter((item) => !known.has(item.item_id))];
          homeItemsCache.set(isAuthenticated, { all: next, allNextCursor: res.next_cursor, allHasNext: res.has_next });
          return next;
        });
        setAllNextCursor(res.next_cursor);
        setAllHasNext(res.has_next);
        syncWishes(res.content);
      })
      .catch(() => {})
      .finally(() => {
        allLoadingMoreRef.current = false;
        setAllLoadingMore(false);
      });
  }, [allHasNext, allNextCursor, isAuthenticated]);

  useEffect(() => {
    const sentinel = allSentinelRef.current;
    if (!sentinel || !allHasNext) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMoreLatest();
    }, { rootMargin: "400px" });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [allHasNext, loadMoreLatest]);

  const goToSlide = (next: number) => {
    setSlideDir(next > ctaSlide ? 1 : -1);
    setCtaSlide(next);
  };

  return (
    <div className="min-h-screen bg-white pt-[170px]">
      <div style={{ zoom: 0.8 }}>
      {/* Section 1: Main Banner Slider */}
      <div className="relative mb-8 h-[420px] w-full overflow-hidden md:h-[500px]">
        <AnimatePresence mode="sync" custom={slideDir} initial={false}>
          {bannerSlides.map((slide, i) =>
            ctaSlide === i ? (
              <motion.div
                key={`slide-${i}`}
                custom={slideDir}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%" }),
                  center: { x: 0 },
                  exit: (d: number) => ({ x: d > 0 ? "-100%" : "100%" }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0"
              >
                {slide.type === "typography" ? (
                  <div className="absolute inset-0 overflow-hidden" style={{ background: "#050505" }}>
                    {/* Ambient glow */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse 70% 55% at 50% 48%, rgba(0,196,184,0.09) 0%, transparent 100%)",
                      }}
                    />
                    {/* Typography stack */}
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center"
                      style={{ paddingBottom: "80px" }}
                    >
                      {/* Top reflection — scaleY(-1) so local "to bottom" = visually "to top" */}
                      <span
                        className="block font-black leading-none select-none whitespace-nowrap"
                        style={{
                          fontSize: "clamp(68px, 12vw, 168px)",
                          color: "#00C4B8",
                          letterSpacing: "-0.05em",
                          transform: "scaleY(-1)",
                          opacity: 0.24,
                          WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 65%)",
                          maskImage: "linear-gradient(to bottom, black 0%, transparent 65%)",
                          marginBottom: "-6px",
                        }}
                      >
                        IGNOA
                      </span>
                      {/* Main text */}
                      <span
                        className="block font-black leading-none select-none whitespace-nowrap"
                        style={{
                          fontSize: "clamp(68px, 12vw, 168px)",
                          color: "#00C4B8",
                          letterSpacing: "-0.05em",
                        }}
                      >
                        IGNOA
                      </span>
                      {/* Bottom reflection */}
                      <span
                        className="block font-black leading-none select-none whitespace-nowrap"
                        style={{
                          fontSize: "clamp(68px, 12vw, 168px)",
                          color: "#00C4B8",
                          letterSpacing: "-0.05em",
                          transform: "scaleY(-1)",
                          opacity: 0.24,
                          WebkitMaskImage: "linear-gradient(to top, black 0%, transparent 65%)",
                          maskImage: "linear-gradient(to top, black 0%, transparent 65%)",
                          marginTop: "-6px",
                        }}
                      >
                        IGNOA
                      </span>
                    </div>
                  </div>
                ) : slide.image ? (
                  <>
                    <img src={slide.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden">
                    <span
                      className="absolute text-[22vw] font-black text-white select-none whitespace-nowrap"
                      style={{ filter: "blur(60px)", opacity: 0.25 }}
                    >
                      수수료 0원
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 pb-9">
                  <div className="max-w-[1400px] mx-auto px-8">
                    <div className="flex items-center gap-2 mb-4">
                      {bannerSlides.map((_, j) => (
                        <button
                          key={j}
                          onClick={() => goToSlide(j)}
                          className={`block rounded-full transition-all duration-300 ${
                            ctaSlide === j
                              ? "w-7 h-[5px] bg-white"
                              : "w-[5px] h-[5px] bg-white/40 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] font-semibold tracking-[0.25em] text-white/60 uppercase mb-2">
                      {slide.label}
                    </p>
                    {slide.title && (
                      <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">
                        {slide.title}
                      </h2>
                    )}
                    <p className="text-sm text-white/70">{slide.subtitle}</p>
                  </div>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center pointer-events-none z-10">
          <div className="w-full max-w-[1400px] mx-auto px-8 flex justify-between pointer-events-none">
            <button
              onClick={() => goToSlide(ctaSlide === 0 ? bannerSlides.length - 1 : ctaSlide - 1)}
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => goToSlide(ctaSlide === bannerSlides.length - 1 ? 0 : ctaSlide + 1)}
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Popular Listings */}
      <div className="max-w-[1400px] mx-auto px-8 pt-7 pb-8">
        <motion.div
          ref={popularRef}
          initial={cached ? false : { opacity: 0, y: 40 }}
          animate={popularInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8">
            <p className="text-[13px] font-normal uppercase tracking-[0.2em] text-gray-400">Popular Listings</p>
            <h2 className="mt-1 text-2xl font-bold text-black md:text-3xl">인기 상품</h2>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : popularError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-gray-400">
              <p>인기 상품을 불러오지 못했습니다.</p>
              <button type="button" onClick={() => setPopularReload((value) => value + 1)} className="text-black underline underline-offset-4">
                다시 시도
              </button>
            </div>
          ) : popularItems.length > 0 ? (
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {popularItems.map((item) => (
                <div key={item.item_id}>
                  <ProductCard product={toProductCardProps(item)} imageLoading="eager" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-gray-300">등록된 인기 상품이 없습니다.</div>
          )}
        </motion.div>
      </div>

      {/* Section 3: Curated Collections */}
      <motion.section
        initial={cached ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mt-12"
      >
        <div className="max-w-[1400px] mx-auto px-8 mb-8">
          <p className="text-[13px] font-normal uppercase tracking-[0.2em] text-gray-400">Curated Collections</p>
          <h2 className="mt-1 text-2xl font-bold text-black md:text-3xl">에디터 컬렉션</h2>
        </div>

        <div className="max-w-[1400px] mx-auto grid gap-6 px-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* 왼쪽 2/3는 사진 두 장, 오른쪽 1/3은 포스터. 모두 칸 크기에 맞춰 채운다 (넘치는 부분은 잘림) */}
          <div className="grid grid-cols-2 gap-6">
            {curationBanners.slice(0, 2).map((banner) => (
              <CurationBanner key={banner.title} {...banner} />
            ))}
          </div>
          <CurationBanner {...curationBanners[2]} />
        </div>
      </motion.section>

      {/* Section 4: Ending Soon */}
      <div className="max-w-[1400px] mx-auto px-8 pt-24">
        <motion.div
          ref={endingSoonRef}
          initial={cached ? false : { opacity: 0, y: 40 }}
          animate={endingSoonInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8">
            <p className="text-[13px] font-normal uppercase tracking-[0.2em] text-gray-400">Last Chance</p>
            <h2 className="mt-1 text-2xl font-bold text-black md:text-3xl">오늘이 지나면 만날 수 없는</h2>
          </div>

          {endingSoonLoading ? (
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : endingSoonError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm text-gray-400">
              <p>마감 임박 상품을 불러오지 못했습니다.</p>
              <button type="button" onClick={() => setEndingSoonReload((value) => value + 1)} className="text-black underline underline-offset-4">
                다시 시도
              </button>
            </div>
          ) : endingSoonItems.length > 0 ? (
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {endingSoonItems.map((item) => (
                <div key={item.item_id}>
                  <ProductCard product={toProductCardProps(item)} />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center text-sm text-gray-300">마감이 다가오는 경매가 없습니다.</div>
          )}
        </motion.div>
      </div>

      {/* Section 5: All Products */}
      <div className="max-w-[1400px] mx-auto px-8 pt-24 pb-24">
        <motion.div
          ref={allProductsRef}
          initial={cached ? false : { opacity: 0, y: 40 }}
          animate={allProductsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8">
            <p className="text-[13px] font-normal uppercase tracking-[0.2em] text-gray-400">WE LOVE</p>
            <h2 className="mt-1 text-2xl font-bold text-black md:text-3xl">지금 사랑받는 아이템</h2>
          </div>

          {allLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : allError ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-sm text-gray-400">
              <p>상품을 불러오지 못했습니다.</p>
              <button type="button" onClick={() => setAllReload((value) => value + 1)} className="text-black underline underline-offset-4">
                다시 시도
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {allItems.map((item) => (
                <div key={item.item_id}>
                  <ProductCard product={toProductCardProps(item)} />
                </div>
              ))}
            </div>
          )}

          {/* 무한 스크롤 감지 지점 */}
          <div ref={allSentinelRef} />
          {allLoadingMore && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 mt-3 md:mt-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {!allLoading && !allError && allItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
              <p className="text-sm font-normal">등록된 상품이 없습니다.</p>
            </div>
          )}
        </motion.div>
      </div>
      </div>
    </div>
  );
}
