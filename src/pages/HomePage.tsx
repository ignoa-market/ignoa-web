import { useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/common/ProductCard";
import { motion, AnimatePresence, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import bannerImage from "@/assets/banner-fashion.jpg";
import bannerMainImage from "@/assets/banner-main.jpg";
import bannerStone from "@/assets/banner-stone.jpg";
import bannerHero from "@/assets/banner-hero.png";
import bannerPuffer from "@/assets/banner-puffer.jpg";

const mockProducts = [
  {
    id: "1",
    title: "PLUTO x PROJEXT",
    brand: "CHROME HEARTS",
    currentPrice: 350000,
    size: "M",
    imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80",
    timeLeft: "2h 34m",
    wishCount: 142,
    location: "New York",
  },
  {
    id: "2",
    title: "Vintage Leather Jacket",
    brand: "RICK OWENS",
    currentPrice: 820000,
    size: "L",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    timeLeft: "1d 5h",
    wishCount: 89,
    location: "Los Angeles",
  },
  {
    id: "3",
    title: "Classic White Sneakers",
    brand: "MARGIELA",
    currentPrice: 450000,
    size: "10",
    imageUrl: "https://images.unsplash.com/photo-1625860191460-10a66c7384fb?w=600&q=80",
    timeLeft: "4h 12m",
    wishCount: 234,
    location: "Paris",
  },
  {
    id: "4",
    title: "Oversized Hoodie",
    brand: "STUSSY",
    currentPrice: 180000,
    size: "XL",
    imageUrl: "https://images.unsplash.com/photo-1772311993942-872095c6a227?w=600&q=80",
    timeLeft: "3d 8h",
    wishCount: 67,
    location: "Tokyo",
  },
  {
    id: "5",
    title: "Designer Watch",
    brand: "DIOR",
    currentPrice: 1200000,
    size: "OS",
    imageUrl: "https://images.unsplash.com/photo-1605727450884-4b0e32a129af?w=600&q=80",
    timeLeft: "12h 45m",
    wishCount: 156,
    location: "Milan",
  },
  {
    id: "6",
    title: "Minimal Coat",
    brand: "C.P. COMPANY",
    currentPrice: 540000,
    size: "M",
    imageUrl: "https://images.unsplash.com/photo-1762605135012-56a59a059e60?w=600&q=80",
    timeLeft: "2d 3h",
    wishCount: 92,
    location: "London",
  },
  {
    id: "7",
    title: "Cargo Pants",
    brand: "CARHARTT",
    currentPrice: 120000,
    size: "32",
    imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80",
    timeLeft: "6h 20m",
    wishCount: 178,
    location: "Berlin",
  },
  {
    id: "8",
    title: "Graphic Tee",
    brand: "BAPE",
    currentPrice: 280000,
    size: "L",
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    timeLeft: "1d 14h",
    wishCount: 124,
    location: "Seoul",
  },
  {
    id: "9",
    title: "Denim Jacket",
    brand: "STONE ISLAND",
    currentPrice: 390000,
    size: "L",
    imageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&q=80",
    timeLeft: "5h 30m",
    wishCount: 201,
    location: "Seoul",
  },
  {
    id: "10",
    title: "Chelsea Boots",
    brand: "KAPITAL",
    currentPrice: 650000,
    size: "9",
    imageUrl: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80",
    timeLeft: "8h 15m",
    wishCount: 145,
    location: "Tokyo",
  },
];

const allCategories = ["All", "Outerwear", "Tops", "Bottoms", "Shoes", "Bags", "Accessories"];
const categoryList = ["Outerwear", "Tops", "Bottoms", "Shoes", "Bags", "Accessories"];

const generateMoreProducts = (startId: number, count: number) => {
  const brands = ["CHROME HEARTS", "STONE ISLAND", "SUPREME", "RICK OWENS", "BAPE", "KAPITAL", "CARHARTT", "PRADA", "MARGIELA", "DIOR"];
  return Array.from({ length: count }, (_, i) => ({
    id: `${startId + i}`,
    title: `Product ${startId + i}`,
    brand: brands[(startId + i) % brands.length],
    currentPrice: Math.floor(Math.random() * 1000000) + 100000,
    size: ["XS", "S", "M", "L", "XL"][(startId + i) % 5],
    imageUrl: `https://images.unsplash.com/photo-${1549298916 + i}?w=600&q=80`,
    timeLeft: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
    wishCount: Math.floor(Math.random() * 300),
    location: ["Seoul", "Tokyo", "New York", "Paris", "London"][(startId + i) % 5],
    category: categoryList[(startId + i) % categoryList.length],
  }));
};


export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allProducts, setAllProducts] = useState(generateMoreProducts(11, 10));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [ctaSlide, setCtaSlide] = useState(0);
  const [slideDir, setSlideDir] = useState(1);

  const goToSlide = (next: number) => {
    setSlideDir(next > ctaSlide ? 1 : -1);
    setCtaSlide(next);
  };
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const popularRef = useRef(null);
  const promoRef = useRef(null);
  const allProductsRef = useRef(null);

  const popularInView = useInView(popularRef, { once: true, amount: 0.1 });
  const promoInView = useInView(promoRef, { once: true, amount: 0.15 });
  const allProductsInView = useInView(allProductsRef, { once: true, amount: 0.1 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          setLoading(true);
          setTimeout(() => {
            setAllProducts((prev) => [...prev, ...generateMoreProducts(11 + page * 10, 10)]);
            setPage((prev) => prev + 1);
            setLoading(false);
            if (page >= 4) setHasMore(false);
          }, 800);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, page]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white"
    >
      {/* Banner */}
      <div className="relative w-full h-[270px] sm:h-[350px] md:h-[430px] lg:h-[490px] overflow-hidden bg-white mt-10">
        {/* 뒷배경 IGNOA 텍스트 */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <span
            className="font-black text-black leading-none tracking-tighter"
            style={{ fontSize: "clamp(100px, 22vw, 320px)", opacity: 0.07 }}
          >
            IGNOA
          </span>
        </div>
        {/* 누끼 이미지 */}
        <img
          src={bannerHero}
          alt=""
          className="absolute inset-0 w-full h-full object-contain object-[center_60%]"
        />
      </div>

      {/* Section 1: Popular Listings */}
      <div className="max-w-[1400px] mx-auto px-6 pt-4 pb-8">
        <motion.div
          ref={popularRef}
          initial={{ opacity: 0, y: 40 }}
          animate={popularInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-black">Popular Listings</h2>
            <p className="text-sm text-gray-500 mt-1">지금 가장 인기 있는 경매</p>
          </div>

          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {mockProducts.slice(0, 5).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={popularInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button
              variant="outline"
              className="px-10 h-11 border-black text-black hover:bg-black hover:text-white transition-all rounded-full font-medium"
            >
              See All
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Section 2: CTA 배너 슬라이더 */}
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
        <motion.div
          ref={promoRef}
          initial={{ opacity: 0, y: 40 }}
          animate={promoInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative rounded-2xl overflow-hidden h-[560px]"
        >
          <AnimatePresence mode="sync" custom={slideDir}>
            {ctaSlide === 0 && (
              <motion.div
                key="slide-0"
                custom={slideDir}
                initial={{ x: slideDir > 0 ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: slideDir > 0 ? "-100%" : "100%" }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-white grid grid-cols-1 md:grid-cols-[1fr_1fr]"
              >
                <div className="flex flex-col px-12 py-12 order-2 md:order-1 h-full">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-5">
                      IGNOA · Archive
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-black leading-[1.1] mb-5">
                      Avant-garde<br />Archive<br />Pieces
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      컬렉터들이 주목하는 아방가르드 아카이브 피스, 지금 경매에서 만나보세요.
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">아카이브 컬렉션</p>
                      <p className="text-6xl font-black text-black leading-none tracking-tight">36+</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors group w-fit">
                      컬렉션 보기
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
                <div className="relative overflow-hidden order-1 md:order-2 h-full bg-white">
                  <img src={bannerPuffer} alt="" className="w-full h-full object-contain object-[right_bottom]" />
                  <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white to-transparent hidden md:block" />
                </div>
              </motion.div>
            )}
            {ctaSlide === 1 && (
              <motion.div
                key="slide-1"
                custom={slideDir}
                initial={{ x: slideDir > 0 ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: slideDir > 0 ? "-100%" : "100%" }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-[#f0eeea] grid grid-cols-1 md:grid-cols-[1fr_1fr]"
              >
                <div className="flex flex-col px-12 py-12 order-2 md:order-1 h-full">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-5">
                      IGNOA · Fashion Auction
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-black leading-[1.1] mb-5">
                      Find Your<br />Perfect<br />Fashion Piece
                    </h2>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      희귀한 빈티지 아이템부터 최신 컬렉션까지, 매일 새로운 경매가 시작됩니다.
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-1">지금 진행 중인 경매</p>
                      <p className="text-6xl font-black text-black leading-none tracking-tight">120+</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-colors group w-fit">
                      경매 참여하기
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
                <div className="relative overflow-hidden order-1 md:order-2 h-full bg-[#f0eeea]">
                  <img src={bannerImage} alt="" className="w-full h-full object-contain object-[right_bottom]" />
                  <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#f0eeea] to-transparent hidden md:block" />
                </div>
              </motion.div>
            )}
            {ctaSlide === 1 && (
              <motion.div
                key="slide-1"
                custom={slideDir}
                initial={{ x: slideDir > 0 ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: slideDir > 0 ? "-100%" : "100%" }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                className="absolute inset-0 bg-[#0e0e0e] grid grid-cols-1 md:grid-cols-[1fr_1fr]"
              >
                <div className="flex flex-col px-12 py-12 order-2 md:order-1 h-full">
                  <div>
                    <p className="text-[11px] font-semibold tracking-[0.3em] text-white/40 uppercase mb-5">
                      IGNOA · New Arrivals
                    </p>
                    <h2 className="text-4xl md:text-5xl font-black text-white leading-[1.1] mb-5">
                      Discover<br />Rare<br />Streetwear
                    </h2>
                    <p className="text-sm text-white/50 leading-relaxed">
                      한정판 스트리트웨어부터 아카이브 피스까지, 지금 바로 입찰하세요.
                    </p>
                  </div>
                  <div className="mt-auto flex flex-col gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-white/30 uppercase tracking-widest mb-1">새로 등록된 상품</p>
                      <p className="text-6xl font-black text-white leading-none tracking-tight">48+</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-full hover:bg-gray-100 transition-colors group w-fit">
                      지금 둘러보기
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
                <div className="relative overflow-hidden order-1 md:order-2 h-full bg-[#0e0e0e]">
                  <img src={bannerStone} alt="" className="w-full h-full object-contain object-[right_bottom]" />
                  <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#0e0e0e] to-transparent hidden md:block" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 하단 네비게이션 dots */}
          {(() => {
            const isDark = ctaSlide === 2;
            const dotActive = isDark ? "bg-white" : "bg-black";
            const dotInactive = isDark ? "bg-white/30 hover:bg-white/60" : "bg-black/25 hover:bg-black/50";
            return (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
                {[0, 1, 2].map((i) => (
                  <button key={i} onClick={() => goToSlide(i)} className={`rounded-full transition-all duration-300 ${ctaSlide === i ? `w-8 h-1.5 ${dotActive}` : `w-4 h-1.5 ${dotInactive}`}`} />
                ))}
              </div>
            );
          })()}
        </motion.div>
      </div>

      {/* Section 4: All Products (Infinite Scroll) */}
      <div className="max-w-[1400px] mx-auto px-6 pb-20">
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

          {/* Category Filter */}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {(selectedCategory === "All" ? allProducts : allProducts.filter((p) => p.category === selectedCategory)).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.02, 0.3) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 border-2 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
            </div>
          )}

          {hasMore && <div ref={observerRef} className="h-20" />}

          {!hasMore && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-sm text-gray-400"
            >
              모든 상품을 확인했습니다
            </motion.p>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
