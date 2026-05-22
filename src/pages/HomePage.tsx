import { useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/common/ProductCard";
import { motion, AnimatePresence, useInView } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import bannerImage from "@/assets/banner-fashion.jpg";
import bannerPuffer from "@/assets/banner-puffer.jpg";
import stussyFront from "@/assets/product-stussy-front.png";
import ignotaTeal from "@/assets/product-ignota-teal.jpg";
import bapeTee from "@/assets/product-bape-tee.webp";
import channelOrange from "@/assets/product-channel-orange.jpg";
import vinylBlue from "@/assets/product-vinyl-blue.jpg";

const mockProducts = [
  {
    id: "1",
    title: "PLUTO x PROJEXT",
    brand: "CHROME HEARTS",
    currentPrice: 350000,
    size: "M",
    imageUrl: stussyFront,
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
    imageUrl: ignotaTeal,
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
    imageUrl: bapeTee,
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
    imageUrl: channelOrange,
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
    imageUrl: vinylBlue,
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

const bannerSlides = [
  {
    image: bannerPuffer,
    label: "CURATED COLLECTION",
    title: "Avant-garde Archive Pieces",
    subtitle: "컬렉터들이 주목하는 아방가르드 아카이브 피스, 지금 경매에서 만나보세요.",
  },
  {
    image: bannerImage,
    label: "FASHION AUCTION",
    title: "Find Your Perfect Fashion Piece",
    subtitle: "희귀한 빈티지 아이템부터 최신 컬렉션까지, 매일 새로운 경매가 시작됩니다.",
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
      {/* Section 1: Main Banner Slider */}
      <motion.div
        ref={promoRef}
        initial={{ opacity: 0 }}
        animate={promoInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6 }}
        className="relative w-full overflow-hidden h-[420px] md:h-[500px] mb-20"
      >
        <AnimatePresence mode="sync" custom={slideDir}>
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
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-32 pb-9">
                  <div className="flex items-center gap-2 mb-4">
                    {bannerSlides.map((_, j) => (
                      <button
                        key={j}
                        onClick={() => goToSlide(j)}
                        className={`block rounded-full transition-all duration-300 ${
                          ctaSlide === j ? "w-7 h-[5px] bg-white" : "w-[5px] h-[5px] bg-white/40 hover:bg-white/70"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-semibold tracking-[0.25em] text-white/60 uppercase mb-2">
                    {slide.label}
                  </p>
                  <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-2">
                    {slide.title}
                  </h2>
                  <p className="text-sm text-white/70">{slide.subtitle}</p>
                </div>
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* 좌우 네비게이션 버튼 */}
        <button
          onClick={() => goToSlide(ctaSlide === 0 ? bannerSlides.length - 1 : ctaSlide - 1)}
          className="absolute left-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all z-10"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => goToSlide(ctaSlide === bannerSlides.length - 1 ? 0 : ctaSlide + 1)}
          className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all z-10"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </button>
      </motion.div>

      {/* Section 2: Popular Listings */}
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

        </motion.div>
      </div>

      {/* Section 2: Popular Brands */}
      <div className="bg-[#f4f4f2] py-14 px-6 mt-20">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-gray-400 uppercase mb-2">Popular Brands</p>
          <h2 className="text-2xl font-black text-black mb-10">인기 브랜드</h2>
          <div className="overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-0 whitespace-nowrap">
              {["Chrome Hearts", "PLASTICPRODUCT", "Bape", "Rick Owens", "XLIM", "Supreme", "RRL", "Comme des Garcons", "Stone Island", "Kapital"].map((brand, i) => (
                <div key={brand} className="flex items-center">
                  {i !== 0 && <span className="mx-5 text-gray-300 text-sm">·</span>}
                  <button className="text-gray-400 hover:text-black transition-colors text-sm font-medium">
                    {brand}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: All Products (Infinite Scroll) */}
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
