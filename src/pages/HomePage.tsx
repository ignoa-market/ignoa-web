import { useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/common/ProductCard";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { itemApi } from "@/api/item";
import type { ItemSummary } from "@/types/api";

const bannerSlides = [
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

const allCategories = ["All", "아우터", "상의", "하의", "신발", "가방", "액세서리"];

function toProductCardProps(item: ItemSummary) {
  return {
    id: String(item.item_id),
    brand: item.brand,
    title: item.title,
    currentPrice: item.current_price,
    imageUrl: item.media_url,
    wishCount: item.wish_count,
    viewCount: item.view_count,
  };
}

export function HomePage() {
  const [ctaSlide, setCtaSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [popularItems, setPopularItems] = useState<ItemSummary[]>([]);
  const [allItems, setAllItems] = useState<ItemSummary[]>([]);
  const [popularLoading, setPopularLoading] = useState(true);
  const [allLoading, setAllLoading] = useState(true);

  const popularRef = useRef(null);
  const promoRef = useRef(null);
  const allProductsRef = useRef(null);

  const popularInView = useInView(popularRef, { once: true, amount: 0.1 });
  const promoInView = useInView(promoRef, { once: true, amount: 0.15 });
  const allProductsInView = useInView(allProductsRef, { once: true, amount: 0.1 });

  useEffect(() => {
    setPopularLoading(true);
    itemApi
      .getItems({ view: "POPULAR", size: 5 })
      .then((res) => setPopularItems(res.content))
      .catch(() => setPopularItems([]))
      .finally(() => setPopularLoading(false));
  }, []);

  useEffect(() => {
    setAllLoading(true);
    const category = selectedCategory === "All" ? undefined : selectedCategory;
    itemApi
      .getItems({ view: "ALL", category, size: 20 })
      .then((res) => setAllItems(res.content))
      .catch(() => setAllItems([]))
      .finally(() => setAllLoading(false));
  }, [selectedCategory]);

  const goToSlide = (next: number) => {
    setSlideDir(next > ctaSlide ? 1 : -1);
    setCtaSlide(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white pt-[196px]"
    >
      {/* Section 1: Main Banner Slider */}
      <motion.div
        ref={promoRef}
        initial={{ opacity: 0 }}
        animate={promoInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="relative w-full overflow-hidden h-[420px] md:h-[500px] mb-8"
      >
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
      </motion.div>

      {/* Section 2: Popular Listings */}
      <div className="max-w-[1400px] mx-auto px-8 pt-7 pb-8">
        <motion.div
          ref={popularRef}
          initial={{ opacity: 0, y: 40 }}
          animate={popularInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-black">Popular Listings</h2>
            <p className="text-sm text-gray-500 mt-1">지금 가장 인기 있는 경매</p>
          </div>

          {popularLoading ? (
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {popularItems.map((item, index) => (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={popularInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
                >
                  <ProductCard product={toProductCardProps(item)} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Section 3: All Products */}
      <div className="max-w-[1400px] mx-auto px-6 pt-24 pb-24">
        <motion.div
          ref={allProductsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={allProductsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-black">All Products</h2>
            <p className="text-sm text-gray-500 mt-1">전체 경매 상품</p>
          </div>

          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {allLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {allItems.map((item, index) => (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
                >
                  <ProductCard product={toProductCardProps(item)} />
                </motion.div>
              ))}
            </div>
          )}

          {!allLoading && allItems.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-300">
              <p className="text-sm font-medium">등록된 상품이 없습니다</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
