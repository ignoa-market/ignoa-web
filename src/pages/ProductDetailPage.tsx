import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronDown, ChevronLeft, Check, Eye, ShieldCheck, MessageCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import stussyFront from "@/assets/product-stussy-front.png";
import stussyBack from "@/assets/product-stussy-back.png";
import avatarOleoleo from "@/assets/avatar-oleoleo.jpg";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "@/components/common/ProductCard";
import { ChatPanel } from "@/components/common/ChatPanel";

const mockProduct = {
  id: "1",
  title: "SURF SIZE ZIP HOODIE",
  brand: "STUSSY",
  currentPrice: 150000,
  startPrice: 130000,
  buyNowPrice: 200000,
  images: [stussyFront, stussyBack],
  timeLeft: "1일 5시간",
  wishCount: 89,
  bidderCount: 15,
  location: "서울, 강남구",
  views: 542,
  createdAt: "2026.04.07",
  size: "L",
  condition: "최상",
  postedAt: "1 week ago",
  description: `스투시 후드집업 판매합니다.\n\n사용감 있고, 모자 부분에 색빠짐 있습니다.\n사진 참고 부탁드려요.\n\n구매전 연락부탁드립니다!`,
  seller: {
    name: "oleoleo",
    avatar: avatarOleoleo,
    rating: 4.9,
    sales: 87,
  },
  myBid: 800000,
};

// Mock bid history data
const bidHistory = [
  { id: "bid-1", time: "09:00", price: 500000 },
  { id: "bid-2", time: "09:30", price: 550000 },
  { id: "bid-3", time: "10:15", price: 620000 },
  { id: "bid-4", time: "11:20", price: 680000 },
  { id: "bid-5", time: "12:00", price: 750000 },
  { id: "bid-6", time: "13:15", price: 800000 },
  { id: "bid-7", time: "14:30", price: 820000 },
];

// Detailed bid history for list
const detailedBidHistory = [
  { id: "detail-1", time: "14:30", price: 820000, bidder: "user***5" },
  { id: "detail-2", time: "13:15", price: 800000, bidder: "user***4" },
  { id: "detail-3", time: "12:00", price: 750000, bidder: "user***1" },
  { id: "detail-4", time: "11:20", price: 680000, bidder: "user***3" },
  { id: "detail-5", time: "10:15", price: 620000, bidder: "user***2" },
  { id: "detail-6", time: "09:30", price: 550000, bidder: "user***1" },
  { id: "detail-7", time: "09:00", price: 500000, bidder: "시작가" },
];

// Related products data - Use same format as home page
const relatedProducts = [
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

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [msgOpen, setMsgOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wished, setWished] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidStep, setBidStep] = useState<"input" | "confirm">("input");
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [displayPrice, setDisplayPrice] = useState(mockProduct.currentPrice);
  const [priceAnimKey, setPriceAnimKey] = useState(0);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [buyNowAgreed, setBuyNowAgreed] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [viewers, setViewers] = useState(12);
  const endTimeRef = useRef(new Date(Date.now() + (1 * 24 * 60 * 60 + 5 * 60 * 60) * 1000));

  useEffect(() => {
    const tick = () => {
      const diff = endTimeRef.current.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("마감");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) setCountdown(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
      else if (hours > 0) setCountdown(`${hours}시간 ${minutes}분 ${seconds}초`);
      else setCountdown(`${minutes}분 ${seconds}초`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fluctuate = () => {
      setViewers((prev) => Math.max(1, prev + Math.floor(Math.random() * 3) - 1));
    };
    const timer = setInterval(fluctuate, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleBidNext = () => {
    const amount = parseInt(bidAmount.replace(/,/g, ""));
    if (!bidAmount || isNaN(amount) || amount <= mockProduct.currentPrice) {
      toast.error("현재가보다 높은 금액을 입력하세요.");
      return;
    }
    setBidStep("confirm");
  };

  const handleBidConfirm = () => {
    const amount = parseInt(bidAmount.replace(/,/g, ""));
    toast.success(`입찰 완료: ${amount.toLocaleString()}원`);
    setDisplayPrice(amount);
    setPriceAnimKey((k) => k + 1);
    setBidModalOpen(false);
    setBidStep("input");
    setBidAmount("");
  };

  const handleBuyNow = () => {
    toast.success("구매가 완료되었습니다!");
    setBuyNowModalOpen(false);
    setBuyNowAgreed(false);
  };

  const handleDotClick = (idx: number) => {
    setCurrentImageIndex(idx);
  };

  return (
    <div className="min-h-screen bg-white pt-[30px] sm:pt-[32px]">
      <div className="max-w-[1400px] mx-auto px-6 pt-0 pb-8 sm:pb-12">
        {/* Back button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-0.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {/* 2-column layout: image | info+actions */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Column 1: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative overflow-hidden rounded-2xl w-full select-none"
            style={{ aspectRatio: "1/1" }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                src={mockProduct.images[currentImageIndex]}
                alt={mockProduct.title}
                className="absolute inset-0 w-full h-full object-contain p-8"
              />
            </AnimatePresence>

            {/* dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-row gap-1.5 z-10">
              {mockProduct.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleDotClick(idx)}
                  className="p-2 -m-2 flex items-center justify-center"
                >
                  <span className={`block rounded-full transition-all duration-300 ${
                    currentImageIndex === idx ? "w-8 h-1 bg-gray-400" : "w-5 h-1 bg-gray-300"
                  }`} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Column 2: Info + Actions */}
          <div className="sticky top-24 flex flex-col mt-[100px]">

            {/* Brand */}
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gray-400 mb-2">
              {mockProduct.brand}
            </p>

            {/* Title */}
            <h1 className="text-3xl font-semibold text-stone-800 leading-tight mb-5 -ml-[3px]">
              {mockProduct.title}
            </h1>

            {/* Price */}
            <div className="mb-2">
              <p className="text-sm text-gray-400 mb-1">현재가</p>
              <div className="text-2xl font-semibold text-stone-800 mb-3" style={{ perspective: "400px" }}>
                {(displayPrice.toLocaleString() + "원").split("").map((char, i, arr) => (
                  <motion.span
                    key={`${priceAnimKey}-${i}`}
                    initial={priceAnimKey === 0 ? false : { opacity: 0, rotateX: -90, y: -8 }}
                    animate={{ opacity: 1, rotateX: 0, y: 0 }}
                    transition={{
                      delay: (arr.length - 1 - i) * 0.08,
                      duration: 0.35,
                      ease: [0.23, 1, 0.32, 1],
                    }}
                    style={{ display: "inline-block", transformOrigin: "top center" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-line mb-5">
              {mockProduct.description}
            </p>

            {/* Timer + Views + Share */}
            <div className="flex items-center justify-between mb-5 w-full">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-sm text-rose-400 font-medium">
                  <span className="w-3.5 text-center text-sm">⏱</span>
                  {countdown}
                </div>
                <div className="flex items-center gap-1.5 text-[13px] text-gray-400 font-medium">
                  <Eye className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  {viewers}명 보는 중
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={() => setBidModalOpen(true)}
                className="flex-1 bg-stone-800 hover:bg-stone-700 text-white h-11 text-sm font-medium rounded transition-colors"
              >
                입찰하기
              </Button>
              <Button
                onClick={() => setBuyNowModalOpen(true)}
                variant="outline"
                className="flex-1 border-stone-200 text-stone-600 h-11 text-sm font-medium rounded hover:bg-stone-50 hover:border-stone-300 transition-colors"
              >
                즉시 구매
              </Button>
            </div>

            <div className="w-full flex items-center justify-center gap-2 text-xs text-stone-700 bg-gray-100 px-4 h-11 rounded-full mt-4">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-sky-400" />
              <span>이그노아 안전결제로 걱정없이 거래하세요.</span>
            </div>

          </div>
        </div>

        {/* Seller Section */}
        <div className="mt-12 pb-10">
          <h2 className="text-lg font-semibold text-black mb-4">판매자 정보</h2>
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 transition-shadow duration-300 hover:shadow-lg cursor-pointer">
              <AvatarImage src={mockProduct.seller.avatar} />
              <AvatarFallback className="bg-stone-100 text-stone-500 text-sm">
                {mockProduct.seller.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-stone-800">{mockProduct.seller.name}</p>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span>매너 {mockProduct.seller.rating}</span>
                <span>·</span>
                <span>거래 {mockProduct.seller.sales}회</span>
                <span>·</span>
                <span>서울, 강남구</span>
              </div>
            </div>
            <div className="ml-6 flex items-center gap-3 self-center">
              <button className="text-xs text-white bg-stone-800 hover:bg-stone-700 transition-colors px-4 h-8 rounded-full">
                팔로우
              </button>
              <button
                onClick={() => isAuthenticated ? setMsgOpen(true) : navigate("/login")}
                className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-stone-500"
                title="메시지 보내기"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bid History Section */}
        <div className="mt-2 pt-2">
          <h2 className="text-lg font-semibold text-black mb-8">입찰 이력</h2>

          <div className="grid lg:grid-cols-5 gap-8">
            {/* Left: Chart - Horizontal Scroll */}
            <div className="lg:col-span-3 overflow-x-auto">
              <div className="min-w-[600px]">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={bidHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="time"
                      stroke="#9ca3af"
                      style={{ fontSize: '11px' }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: '11px' }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '12px',
                        padding: '8px 12px'
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()}원`, '입찰가']}
                      labelStyle={{ fontWeight: '600', marginBottom: '4px', fontSize: '11px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#000"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 5 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Right: Recent Bids - Vertical Scroll */}
            <div className="lg:col-span-2">
              <div className="overflow-y-auto max-h-[280px] space-y-3 pr-2">
                {detailedBidHistory.map((bid, index) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-gray-400 font-medium w-8">
                        #{detailedBidHistory.length - index}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-black">
                          {bid.price.toLocaleString()}원
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {bid.bidder} · {bid.time}
                        </div>
                      </div>
                    </div>
                    {index === 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* IGNOA Policy Sections - Toggle */}
        <div className="mt-16">
          {/* Shipping Info */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setShippingOpen(!shippingOpen)}
              className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-semibold text-black">배송정보</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  shippingOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {shippingOpen && (
              <div className="pb-6 px-1 text-sm text-gray-700 leading-relaxed space-y-3">
                <ul className="list-disc list-inside space-y-2">
                  <li>상품은 판매자 측에서 직접 배송/택배로 2일 이내 배송이 시작됩니다.</li>
                  <li>배송 상태는 이그노아 앱에서 확인 가능하고, 그 외에는 판매자에게 연락하여 주시기 바랍니다.</li>
                  <li>판매자와 연락이 되지 않은 경우, 이그노아 고객센터로 문의해 주시면 확인 도와드리겠습니다.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Return & Refund Policy */}
          <div>
            <button
              onClick={() => setReturnOpen(!returnOpen)}
              className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-semibold text-black">반품 및 환불 정책</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  returnOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {returnOpen && (
              <div className="pb-6 px-1 text-sm text-gray-700 leading-relaxed space-y-4">
                <p className="font-medium">
                  판매자가 등록한 중고 상품은 일반 상품과 다르게 제한적인 반품 정책을 적용합니다.
                </p>
                <p>
                  중고 거래 특성상, 개인 간 거래이므로 반품이 원칙적으로 어렵습니다. 단, 이그노아 안전 결제를 이용하시면 아래 절차에 의해 반품 및 환불 진행을 도와드립니다.
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>받은 상품이 설명과 다른 경우</li>
                  <li>구매한 상품이 배송되지 않은 경우</li>
                </ul>
                <p className="text-xs text-gray-600">
                  외부(계좌) 거래 시, 이그노아 고객센터 이용이 불가합니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        <div className="mt-8 pt-12">
          <h2 className="text-lg font-semibold text-black mb-8">관련 상품</h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <AnimatePresence>
        {bidModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => { setBidModalOpen(false); setBidStep("input"); setBidAmount(""); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="relative bg-white w-full max-w-sm rounded-2xl p-8 overflow-hidden"
            >
              <AnimatePresence mode="wait" initial={false}>
                {bidStep === "input" ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <div className="mb-8">
                      <input
                        type="text"
                        placeholder="입찰 금액 입력"
                        value={bidAmount}
                        autoFocus
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          setBidAmount(value ? parseInt(value).toLocaleString() : "");
                        }}
                        className="w-full text-2xl font-semibold text-stone-800 border-0 border-b border-gray-200 pb-2 bg-transparent outline-none focus:border-stone-600 transition-colors placeholder:text-gray-200"
                      />
                      <p className="text-xs text-gray-400 mt-2.5">최소 {(mockProduct.currentPrice + 50000).toLocaleString()}원 이상</p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleBidNext}
                        className="flex-1 h-11 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        입찰하기
                      </button>
                      <button
                        onClick={() => { setBidModalOpen(false); setBidAmount(""); }}
                        className="flex-1 h-11 text-sm text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700 rounded-full transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
                  >
                    <p className="text-xs text-gray-400 mb-6">입찰 금액 확인</p>
                    <p className="text-3xl font-semibold text-stone-800 mb-2">{bidAmount}원</p>
                    <p className="text-sm text-gray-400 mb-10">이 금액으로 입찰하시겠습니까?</p>
                    <div className="flex gap-3">
                      <button
                        onClick={handleBidConfirm}
                        className="flex-1 h-11 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        확인
                      </button>
                      <button
                        onClick={() => setBidStep("input")}
                        className="flex-1 h-11 text-sm text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700 rounded-full transition-colors"
                      >
                        수정
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Buy Now Modal */}
      <AnimatePresence>
        {buyNowModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/30"
              onClick={() => { setBuyNowModalOpen(false); setBuyNowAgreed(false); }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className="relative bg-white w-full max-w-sm rounded-2xl p-8"
            >
              <div className="mb-8">
                <p className="text-xs text-gray-400 mb-1.5">즉시 구매가</p>
                <p className="text-3xl font-semibold text-stone-800">{mockProduct.buyNowPrice.toLocaleString()}원</p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mb-8">
                <button
                  onClick={() => setBuyNowAgreed(!buyNowAgreed)}
                  className={`w-5 h-5 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                    buyNowAgreed ? "bg-stone-800 border-stone-800" : "border-gray-300"
                  }`}
                >
                  {buyNowAgreed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </button>
                <span className="text-xs text-gray-400 leading-relaxed">
                  구매 후 취소 및 환불이 제한될 수 있음을 확인했습니다.
                </span>
              </label>

              <div className="flex gap-3">
                <button
                  onClick={handleBuyNow}
                  disabled={!buyNowAgreed}
                  className="flex-1 h-11 bg-stone-800 hover:bg-stone-700 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors"
                >
                  구매하기
                </button>
                <button
                  onClick={() => { setBuyNowModalOpen(false); setBuyNowAgreed(false); }}
                  className="flex-1 h-11 text-sm text-gray-500 border border-gray-200 hover:border-gray-400 hover:text-gray-700 rounded-full transition-colors"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {msgOpen && <ChatPanel onClose={() => setMsgOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {msgOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={() => setMsgOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
