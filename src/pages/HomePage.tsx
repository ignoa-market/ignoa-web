import { useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/common/ProductCard";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { itemApi } from "@/api/item";
import { useAuth } from "@/context/AuthContext";
import type { ItemSummary } from "@/types/api";
import lightweightPufferBanner from "@/assets/banner-lightweight-puffer-optimized.jpg";
import { toast } from "sonner";

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

const popularBrands = [
  "Stone Island",
  "Chrome Hearts",
  "Supreme",
  "PLASTICPRODUCT",
  "Levi's",
  "Polo Ralph Lauren",
  "C.P. Company",
  "Bape",
];

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

export function HomePage() {
  const { isAuthenticated } = useAuth();
  const [ctaSlide, setCtaSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [popularItems, setPopularItems] = useState<ItemSummary[]>([]);
  const [allItems, setAllItems] = useState<ItemSummary[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(true);
  const [popularError, setPopularError] = useState(false);
  const [allError, setAllError] = useState(false);
  const [popularReload, setPopularReload] = useState(0);
  const [allReload, setAllReload] = useState(0);

  const popularRef = useRef(null);
  const allProductsRef = useRef(null);

  const popularInView = useInView(popularRef, { once: true, amount: 0.1 });
  const allProductsInView = useInView(allProductsRef, { once: true, amount: 0.1 });

  useEffect(() => {
    let stale = false;
    setPopularLoading(true);
    setPopularError(false);
    itemApi
      .getItems({ view: "POPULAR", size: 5 }, { public: !isAuthenticated })
      .then((res) => { if (!stale) setPopularItems(res.content); })
      .catch(() => { if (!stale) setPopularError(true); })
      .finally(() => { if (!stale) setPopularLoading(false); });
    return () => { stale = true; };
  }, [isAuthenticated, popularReload]);

  useEffect(() => {
    let stale = false;
    setAllLoading(true);
    setAllError(false);
    itemApi
      .getItems({ view: "ALL", size: 20 }, { public: !isAuthenticated })
      .then((res) => { if (!stale) setAllItems(res.content); })
      .catch(() => { if (!stale) setAllError(true); })
      .finally(() => { if (!stale) setAllLoading(false); });
    return () => { stale = true; };
  }, [isAuthenticated, allReload]);

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
          initial={{ opacity: 0, y: 40 }}
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

      {/* Section 3: Popular Brands */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
        className="mt-12 bg-stone-100/80 py-16 md:py-20"
      >
        <div className="max-w-[1400px] mx-auto px-8">
          <p className="text-[13px] font-normal uppercase tracking-[0.2em] text-gray-400">
            Popular Brands
          </p>
          <h2 className="mt-1 text-2xl font-bold text-black md:text-3xl">인기 브랜드</h2>

          <div className="mt-12 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max items-center">
              {popularBrands.map((brand, index) => (
                <div key={brand} className="flex items-center">
                  {index > 0 && <span className="mx-7 text-gray-300">•</span>}
                  <button
                    type="button"
                    onClick={() => toast.info("아직 준비 중인 기능입니다.")}
                    className="text-lg font-semibold text-gray-400 whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:text-black active:translate-y-0"
                  >
                    {brand}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* Section 4: All Products */}
      <div className="max-w-[1400px] mx-auto px-8 pt-24 pb-24">
        <motion.div
          ref={allProductsRef}
          initial={{ opacity: 0, y: 40 }}
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
