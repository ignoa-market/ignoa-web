import { useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/common/ProductCard";
import { motion, useInView } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import vinylFrankOceanBlonde from "@/assets/lp-frank-ocean-blonde.png";
import lpHyukohSunsetRollercoasterAAA from "@/assets/lp-hyukoh-sunset-rollercoaster-aaa.png";
import lpTeamBaby from "@/assets/lp-team-baby.png";
import lpWaveToEarth from "@/assets/lp-wave-to-earth.png";
import channelOrange from "@/assets/lp-frank-ocean-channel-orange.png";
import lpDanielCaesarNeverEnough from "@/assets/lp-daniel-caesar-never-enough.png";

const mockProducts = [
  {
    id: "3",
    title: "Blonde",
    brand: "FRANK OCEAN",
    currentPrice: 600000,
    size: "LP",
    imageUrl: vinylFrankOceanBlonde,
    timeLeft: "4h 12m",
    wishCount: 234,
    location: "Paris",
  },
  {
    id: "5",
    title: "Never Enough",
    brand: "DANIEL CAESAR",
    currentPrice: 200000,
    size: "LP",
    imageUrl: lpDanielCaesarNeverEnough,
    timeLeft: "12h 45m",
    wishCount: 156,
    location: "Milan",
  },
  {
    id: "1",
    title: "AAA",
    brand: "HYUKOH & SUNSET ROLLERCOASTER",
    currentPrice: 360000,
    size: "LP",
    imageUrl: lpHyukohSunsetRollercoasterAAA,
    timeLeft: "2h 34m",
    wishCount: 142,
    location: "Seoul",
  },
  {
    id: "2",
    title: "Team Baby",
    brand: "THE BLACK SKIRTS",
    currentPrice: 660000,
    size: "LP",
    imageUrl: lpTeamBaby,
    timeLeft: "1d 5h",
    wishCount: 89,
    location: "Los Angeles",
  },
  {
    id: "4",
    title: "channel ORANGE",
    brand: "FRANK OCEAN",
    currentPrice: 580000,
    size: "LP",
    imageUrl: channelOrange,
    timeLeft: "3d 8h",
    wishCount: 67,
    location: "Tokyo",
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

const artists = [
  "Frank Ocean",
  "Daniel Caesar",
  "Mac Miller",
  "Justin Bieber",
  "Tyler, The Creator",
  "Oasis",
  "Baek Yerin",
  "Hyukoh",
  "The Black Skirts",
  "Jannabi",
];

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


const AUCTION_END = new Date(Date.now() + 4 * 3600 * 1000 + 23 * 60 * 1000 + 11 * 1000);

function useCountdown(target: Date) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target.getTime() - Date.now()));

  useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(Math.max(0, target.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(id);
  }, [target]);

  const h = String(Math.floor(timeLeft / 3600000)).padStart(2, "0");
  const m = String(Math.floor((timeLeft % 3600000) / 60000)).padStart(2, "0");
  const s = String(Math.floor((timeLeft % 60000) / 1000)).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function HomePage() {
  const [allProducts, setAllProducts] = useState(generateMoreProducts(11, 10));
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState("Frank Ocean");
  const countdown = useCountdown(AUCTION_END);

  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);

  const popularRef = useRef(null);
  const interestsRef = useRef(null);
  const allProductsRef = useRef(null);

  const popularInView = useInView(popularRef, { once: true, amount: 0.1 });
  const interestsInView = useInView(interestsRef, { once: true, amount: 0.1 });
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
      {/* Top Banner: CTA 슬라이더 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-[1400px] mx-auto px-6 pt-6 pb-8"
      >
        <div className="relative rounded-2xl overflow-hidden h-[430px]">
          <div className="absolute inset-0 bg-white overflow-hidden grid grid-cols-1 md:grid-cols-[1fr_1fr]">
            {/* 좌측 텍스트 */}
            <div className="flex flex-col justify-start pt-10 pl-20 pr-12 h-full">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-black uppercase mb-4">
                IGNOA · Limited Auction
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-black leading-[1.1] tracking-tight mb-4">
                wave to earth<br />
                <span style={{ color: "#7070C8" }}>uncounted 0.00</span><br />
                <span className="text-black/80">Periwinkle LP</span>
              </h2>
              <p className="text-xs text-black/40 leading-relaxed mb-8 whitespace-nowrap">
                한정 페리윙클 컬러 바이닐. 국내 인디씬을 대표하는 wave to earth의 희귀 LP, 지금 입찰하세요.
              </p>
              <div className="flex items-end gap-8 mb-8">
                <div>
                  <p className="text-[10px] font-semibold text-black/40 uppercase tracking-widest mb-1">시작가</p>
                  <p className="text-2xl font-black text-black leading-none">₩ 180,000</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-black/40 uppercase tracking-widest mb-1">남은 시간</p>
                  <p className="text-2xl font-black text-black/40 leading-none tabular-nums">{countdown}</p>
                </div>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors group w-fit">
                지금 입찰하기
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

            {/* 우측 이미지 */}
            <div className="relative h-full">
              <img
                src={lpWaveToEarth}
                alt="Wave to Earth"
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 h-[493px] w-auto object-contain"
                style={{ top: "203px" }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section 1: Trending Now */}
      <div className="max-w-[1400px] mx-auto px-6 -mt-4 pb-8">
        <motion.div
          ref={popularRef}
          initial={{ opacity: 0, y: 40 }}
          animate={popularInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="p-6"
        >
          <div className="text-center mb-0">
            <h2 className="text-2xl md:text-3xl font-bold text-black">Trending Vinyl</h2>
            <p className="text-sm text-gray-500 mt-1">컬렉터들이 주목하는 LP</p>
          </div>

          <div className="grid grid-cols-5 gap-3 md:gap-4">
            {mockProducts.slice(0, 5).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={popularInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.05 * index, ease: "easeOut" }}
              >
                <ProductCard product={product} objectFit={index === 0 ? "contain" : "cover"} disableHover />
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>

      {/* Section 2: Recommend Listings */}
      <div className="max-w-[1400px] mx-auto px-6 pt-4 pb-8">
        <motion.div
          ref={interestsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={interestsInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col gap-6"
        >
          {/* 아티스트 카테고리 (여백과 나란히) */}
          <div className="flex gap-12">
            <div className="flex-shrink-0 w-[220px]">
              <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-2">Artist</p>
              <div className="flex flex-col">
                {artists.map((artist) => (
                  <button
                    key={artist}
                    onClick={() => setSelectedArtist(artist)}
                    className={`text-left font-black text-xl md:text-2xl leading-snug tracking-tight uppercase transition-all hover:opacity-100 whitespace-nowrap ${
                      selectedArtist === artist
                        ? "text-black underline underline-offset-4 opacity-100"
                        : "text-black opacity-30 hover:opacity-60"
                    }`}
                  >
                    {artist}
                  </button>
                ))}
              </div>
            </div>
            {/* 우측 여백 */}
            <div className="flex-1" />
          </div>

          {/* Recommend Listings 타이틀 + 상품 */}
          <div>
            <div className="text-center mb-8 mt-10">
              <h2 className="text-2xl md:text-3xl font-bold text-black">Recommend Listings</h2>
              <p className="text-sm text-gray-500 mt-1">관심사 기반으로 선별된 경매</p>
            </div>

            <div className="grid grid-cols-5 gap-3 md:gap-4">
              {mockProducts.slice(5, 10).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05 * index, ease: "easeOut" }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

          </div>
        </motion.div>
      </div>

      {/* Section 4: All Products (Infinite Scroll) */}
      <div className="max-w-[1400px] mx-auto px-6 pt-16 pb-20">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {allProducts.map((product, index) => (
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
