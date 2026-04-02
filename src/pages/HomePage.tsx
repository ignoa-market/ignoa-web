import { useState, useRef, useEffect } from "react";
import { ProductCard } from "@/components/common/ProductCard";
import { Link } from "react-router";
import { motion, useInView } from "motion/react";

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

// Generate more products for infinite scroll
const generateMoreProducts = (startId: number, count: number) => {
  const brands = ["CHROME HEARTS", "STONE ISLAND", "SUPREME", "RICK OWENS", "BAPE", "KAPITAL", "CARHARTT", "PRADA", "MARGIELA", "DIOR"];
  const products = [];
  for (let i = 0; i < count; i++) {
    products.push({
      id: `${startId + i}`,
      title: `Product ${startId + i}`,
      brand: brands[Math.floor(Math.random() * brands.length)],
      currentPrice: Math.floor(Math.random() * 1000000) + 100000,
      size: ["XS", "S", "M", "L", "XL"][Math.floor(Math.random() * 5)],
      imageUrl: `https://images.unsplash.com/photo-${1549298916 + i}?w=600&q=80`,
      timeLeft: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      wishCount: Math.floor(Math.random() * 300),
      location: ["Seoul", "Tokyo", "New York", "Paris", "London"][Math.floor(Math.random() * 5)],
    });
  }
  return products;
};

const popularBrands = [
  "CHROME HEARTS",
  "STONE ISLAND",
  "SUPREME",
  "RICK OWENS",
  "XLIM",
  "BAPE",
  "KAPITAL",
  "PLASTICPRODUCT",
  "CARHARTT",
  "PRADA",
];

const categories = [
  "전체",
  "아우터",
  "상의",
  "하의",
  "신발",
  "가방",
  "액세서리",
  "시계",
];

export function HomePage() {
  const [displayedProducts, setDisplayedProducts] = useState(mockProducts.slice(5)); // First 5 reserved for popular
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  // Refs for scroll animations
  const popularRef = useRef(null);
  const endingSoonRef = useRef(null);
  const allProductsRef = useRef(null);

  const popularInView = useInView(popularRef, { once: true, amount: 0.1 });
  const endingSoonInView = useInView(endingSoonRef, { once: true, amount: 0.1 });
  const allProductsInView = useInView(allProductsRef, { once: true, amount: 0.1 });

  // Parallax effect for banner
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore]);

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      const newProducts = generateMoreProducts(11 + (page - 1) * 10, 10);
      setDisplayedProducts((prev) => [...prev, ...newProducts]);
      setPage((prev) => prev + 1);
      setLoading(false);
      if (page >= 5) setHasMore(false); // Limit to 5 pages for demo
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white"
    >
      {/* Banner with Parallax */}
      <div className="relative w-full h-[280px] sm:h-[360px] md:h-[440px] lg:h-[520px] overflow-hidden bg-gray-100">
        <motion.img
          src="https://images.unsplash.com/photo-1653550148829-d99f843e2706?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwZmFzaGlvbiUyMGJhbm5lciUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzUxMTY5MjF8MA&ixlib=rb-4.1.0&q=80&w=1920"
          alt="Banner"
          className="w-full h-full object-cover"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30" />
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-16">
        {/* Popular Products - 1 Row Only */}
        <motion.div
          ref={popularRef}
          initial={{ opacity: 0, y: 40 }}
          animate={popularInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={popularInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-lg md:text-xl font-bold text-black mb-1">Popular Listings</h2>
            <p className="text-xs text-gray-600">인기 상품</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {mockProducts.slice(0, 5).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={popularInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ending Soon Products - 1 Row Only */}
        <motion.div
          ref={endingSoonRef}
          initial={{ opacity: 0, y: 40 }}
          animate={endingSoonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={endingSoonInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-lg md:text-xl font-bold text-black mb-1">Ending Soon</h2>
            <p className="text-xs text-gray-600">마감 임박 상품</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {mockProducts.slice(5, 10).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={endingSoonInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease: "easeOut" }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Products - Infinite Scroll */}
        <motion.div
          ref={allProductsRef}
          initial={{ opacity: 0, y: 40 }}
          animate={allProductsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={allProductsInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6"
          >
            <h2 className="text-lg md:text-xl font-bold text-black mb-1">All Products</h2>
            <p className="text-xs text-gray-600">전체 상품</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-center items-center py-12"
            >
              <div className="relative">
                <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 w-12 h-12 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>
            </motion.div>
          )}

          {/* Observer Target */}
          {hasMore && <div ref={observerRef} className="h-20" />}

          {/* End Message */}
          {!hasMore && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center py-12 text-sm text-gray-500"
            >
              모든 상품을 확인했습니다
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
