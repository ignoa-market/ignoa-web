import { useState } from "react";
import { useParams } from "react-router";
import { Heart, MapPin, Eye, TrendingUp, Gavel, Share2, ShoppingCart, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "@/components/common/ProductCard";

const mockProduct = {
  id: "1",
  title: "빈티지 레더 자켓",
  brand: "RICK OWENS",
  currentPrice: 820000,
  startPrice: 500000,
  buyNowPrice: 1200000,
  images: [
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=1200&q=80",
    "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=1200&q=80",
    "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=1200&q=80",
  ],
  timeLeft: "1일 5시간",
  wishCount: 89,
  bidderCount: 15,
  location: "서울, 강남구",
  views: 542,
  size: "L",
  condition: "최상",
  postedAt: "1 week ago",
  description: `릭오웬스 정품 빈티지 레더 자켓, 최상 컨디션입니다.

상세 정보:
- 사이즈: Large
- 색상: 블랙
- 소재: 100% 램스킨 가죽
- 상태: 최상, 미세한 사용감만 있음
- 연도: 2018 컬렉션

실측:
- 어깨: 46cm
- 가슴: 56cm
- 총장: 66cm
- 소매: 64cm

비흡연, 반려동물 없는 환경에서 보관했습니다. 교환 불가.`,
  seller: {
    name: "Michael Chen",
    avatar: "",
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wished, setWished] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);

  const handleBid = () => {
    const amount = parseInt(bidAmount.replace(/,/g, ""));
    if (amount <= mockProduct.currentPrice) {
      toast.error("입찰가가 현재가보다 높아야 합니다.");
      return;
    }
    toast.success(`입찰 완료: ${amount.toLocaleString()}원`);
    setBidModalOpen(false);
    setBidAmount("");
  };

  const handleBuyNow = () => {
    toast.success("구매가 완료되었습니다!");
    setBuyNowModalOpen(false);
  };

  const handlePreviousImage = () => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : mockProduct.images.length - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev < mockProduct.images.length - 1 ? prev + 1 : 0
    );
  };

  return (
    <div className="min-h-screen bg-white pt-[60px] sm:pt-[64px]">
      <div className="max-w-[1400px] mx-auto px-6 py-8 sm:py-12">
        {/* Desktop: Two-column layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Image */}
          <div>
            <div className="bg-gray-100 overflow-hidden mb-4 aspect-square relative group">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={mockProduct.images[currentImageIndex]}
                  alt={mockProduct.title}
                  className="w-full h-full object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </AnimatePresence>

              {/* Previous Button */}
              <motion.button
                onClick={handlePreviousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </motion.button>

              {/* Next Button */}
              <motion.button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-black rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </motion.button>

              {/* Image Counter */}
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full font-medium z-10">
                {currentImageIndex + 1} / {mockProduct.images.length}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex gap-3">
              {mockProduct.images.map((img, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative aspect-square w-20 overflow-hidden border rounded-lg transition-all ${
                    currentImageIndex === idx
                      ? "border-black border-2"
                      : "border-gray-300"
                  }`}
                  aria-label={`Image ${idx + 1}`}
                  whileHover={{ scale: 1.05, borderColor: "#000" }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div>
            <p className="text-[10px] font-bold text-black uppercase tracking-wider mb-1">
              {mockProduct.brand}
            </p>
            <h1 className="text-xl sm:text-2xl font-bold text-black mb-4">
              {mockProduct.title}
            </h1>

            {/* Description Section - Moved below title */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-3">
                {mockProduct.description}
              </div>
              <div className="flex justify-end">
                <div className="text-xs text-gray-500">
                  {mockProduct.postedAt}
                </div>
              </div>
            </div>

            {/* Compact Price Display */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-xs text-gray-500 mb-2">현재 입찰가</div>
                <div className="text-2xl font-bold text-black">
                  {mockProduct.currentPrice.toLocaleString()}원
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-2">즉시 구매가</div>
                <div className="text-2xl font-bold text-black">
                  {mockProduct.buyNowPrice.toLocaleString()}원
                </div>
              </div>
            </div>

            {/* Details - Clean layout without borders */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-xs text-gray-500 mb-1">시작가</div>
                <div className="text-sm font-semibold text-black">{mockProduct.startPrice.toLocaleString()}원</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">남은 시간</div>
                <div className="text-sm font-semibold text-red-600">{mockProduct.timeLeft}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">입찰수</div>
                <div className="text-sm font-semibold text-black">{mockProduct.bidderCount}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setBidModalOpen(true)}
                  className="w-full bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold transition-all shadow-sm hover:shadow-md rounded-lg"
                >
                  입찰하기
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setBuyNowModalOpen(true)}
                  className="w-full bg-black hover:bg-gray-800 text-white h-12 text-sm font-semibold transition-all shadow-sm hover:shadow-md rounded-lg"
                >
                  즉시 구매
                </Button>
              </motion.div>
            </div>

            {/* Seller Info - Compact */}
            <div className="pt-6">
              <h3 className="text-base font-bold text-black mb-4">판매자 정보</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14">
                    <AvatarFallback className="bg-gray-200 text-black text-base font-semibold">
                      {mockProduct.seller.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-base font-bold text-black">{mockProduct.seller.name}</div>
                    <div className="text-sm text-gray-600">
                      {mockProduct.seller.sales} 팔로워
                    </div>
                  </div>
                </div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="bg-black text-white hover:bg-gray-800 text-sm h-10 px-6 font-medium transition-all shadow-sm hover:shadow-md rounded-lg"
                  >
                    팔로우
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Bid History Section */}
        <div className="mt-16 pt-12">
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
      <Dialog open={bidModalOpen} onOpenChange={setBidModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl text-black">입찰하기</DialogTitle>
            <DialogDescription className="text-gray-600">
              현재가보다 높은 금액을 입력하세요
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 p-5 mb-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">현재 최고 입찰가</div>
            <div className="text-4xl font-bold text-black">
              {mockProduct.currentPrice.toLocaleString()}원
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-black mb-3 block">
                입찰 금액
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-xl">
                  $
                </span>
                <Input
                  type="text"
                  placeholder="금액 입력"
                  value={bidAmount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setBidAmount(value ? parseInt(value).toLocaleString() : "");
                  }}
                  className="pl-10 h-14 text-xl font-semibold bg-white border-gray-300 text-black placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black"
                />
              </div>
              <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                <span className="font-medium">최소 입찰가:</span>
                <span className="font-semibold text-black">{(mockProduct.currentPrice + 50000).toLocaleString()}원</span>
              </p>
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setBidModalOpen(false)}
              className="flex-1 h-12 font-medium border-gray-300 bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all rounded-lg"
            >
              취소
            </Button>
            <Button
              onClick={handleBid}
              className="flex-1 h-12 bg-black hover:bg-gray-800 text-white font-semibold active:scale-[0.98] transition-all rounded-lg"
            >
              입찰하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Now Modal */}
      <Dialog open={buyNowModalOpen} onOpenChange={setBuyNowModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-2xl text-black">즉시 구매하기</DialogTitle>
            <DialogDescription className="text-gray-600">
              즉시 구매를 원하시면 아래 버튼을 클릭하세요
            </DialogDescription>
          </DialogHeader>

          <div className="bg-gray-50 p-5 mb-4 border border-gray-200">
            <div className="text-sm text-gray-600 mb-2">즉시 구매가</div>
            <div className="text-4xl font-bold text-black">
              {mockProduct.buyNowPrice.toLocaleString()}원
            </div>
          </div>

          <DialogFooter className="gap-3 sm:gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setBuyNowModalOpen(false)}
              className="flex-1 h-12 font-medium border-gray-300 bg-white text-black hover:bg-gray-100 active:scale-[0.98] transition-all rounded-lg"
            >
              취소
            </Button>
            <Button
              onClick={handleBuyNow}
              className="flex-1 h-12 bg-black hover:bg-gray-800 text-white font-semibold active:scale-[0.98] transition-all rounded-lg"
            >
              즉시 구매하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
