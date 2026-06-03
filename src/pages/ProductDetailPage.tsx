import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronDown, ChevronLeft, ChevronRight, Check, ShieldCheck, MessageCircle, Heart, Share2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { ChatPanel } from "@/components/common/ChatPanel";
import { itemApi, bidApi, wishApi } from "@/api/item";
import { wishStore } from "@/store/wishStore";
import type { ItemDetailResponse, BidSummary } from "@/types/api";

export function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [item, setItem] = useState<ItemDetailResponse | null>(null);
  const [bids, setBids] = useState<BidSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const [msgOpen, setMsgOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDir, setSlideDir] = useState(1);
  const [isSliding, setIsSliding] = useState(false);
  const [bidModalOpen, setBidModalOpen] = useState(false);
  const [bidStep, setBidStep] = useState<"input" | "confirm">("input");
  const [buyNowModalOpen, setBuyNowModalOpen] = useState(false);
  const [buyNowAgreed, setBuyNowAgreed] = useState(false);
  const [bidAmount, setBidAmount] = useState("");
  const [displayPrice, setDisplayPrice] = useState(0);
  const [priceAnimKey, setPriceAnimKey] = useState(0);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [countdown, setCountdown] = useState("");
  const endTimeRef = useRef<Date | null>(null);
  const [wished, setWished] = useState(false);
  const [wishCount, setWishCount] = useState(0);

  // 상품 상세 조회
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    itemApi
      .getItem(Number(id))
      .then((data) => {
        setItem(data);
        setDisplayPrice(data.current_price);
        endTimeRef.current = new Date(data.end_at);
        const initialWished = wishStore.isWished(data.item_id) || data.is_wished;
        setWished(initialWished);
        setWishCount(data.wish_count);
      })
      .catch(() => toast.error("상품 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id]);

  // 입찰 내역 조회
  useEffect(() => {
    if (!id) return;
    bidApi
      .getBids(Number(id))
      .then((res) => setBids(res.content))
      .catch(() => setBids([]));
  }, [id]);

  // 카운트다운 타이머
  useEffect(() => {
    const tick = () => {
      if (!endTimeRef.current) return;
      const diff = endTimeRef.current.getTime() - Date.now();
      if (diff <= 0) {
        setCountdown("마감");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hh = String(hours).padStart(2, "0");
      const mm = String(minutes).padStart(2, "0");
      const ss = String(seconds).padStart(2, "0");
      if (days > 0) setCountdown(`${days}일 ${hh}시간 ${mm}분 ${ss}초`);
      else if (hours > 0) setCountdown(`${hh}시간 ${mm}분 ${ss}초`);
      else setCountdown(`${mm}분 ${ss}초`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleWishToggle = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!item) return;
    const prevWished = wished;
    const prevCount = wishCount;
    setWished(!prevWished);
    setWishCount(prevWished ? prevCount - 1 : prevCount + 1);
    if (!prevWished) wishStore.add(item.item_id);
    else wishStore.remove(item.item_id);
    try {
      if (!prevWished) await wishApi.addWish(item.item_id);
      else await wishApi.removeWish(item.item_id);
    } catch {
      setWished(prevWished);
      setWishCount(prevCount);
      if (prevWished) wishStore.add(item.item_id);
      else wishStore.remove(item.item_id);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: item?.title ?? "", url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다.");
    }
  };

  const handleDeleteItem = async () => {
    if (!window.confirm("상품을 삭제하시겠습니까?\n삭제된 상품은 복구할 수 없습니다.")) return;
    try {
      await itemApi.deleteItem(Number(id));
      toast.success("상품이 삭제되었습니다.");
      navigate("/app");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? "상품 삭제에 실패했습니다.");
    }
  };

  const handleBidNext = () => {
    const amount = parseInt(bidAmount.replace(/,/g, ""));
    if (!bidAmount || isNaN(amount) || amount <= displayPrice) {
      toast.error("현재가보다 높은 금액을 입력하세요.");
      return;
    }
    setBidStep("confirm");
  };

  const handleBuyNow = async () => {
    try {
      await itemApi.buyNow(Number(id));
      toast.success("즉시 구매가 완료되었습니다!");
      setItem((prev) => prev ? { ...prev, status: "BUY_NOW_CLOSED" } : prev);
      setBuyNowModalOpen(false);
      setBuyNowAgreed(false);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? "즉시 구매에 실패했습니다.");
    }
  };

  const handleBidConfirm = async () => {
    const amount = parseInt(bidAmount.replace(/,/g, ""));
    try {
      await bidApi.placeBid(Number(id), amount);
      toast.success(`입찰 완료: ${amount.toLocaleString()}원`);
      setDisplayPrice(amount);
      setPriceAnimKey((k) => k + 1);
      setBidModalOpen(false);
      setBidStep("input");
      setBidAmount("");
      // 입찰 내역 갱신
      bidApi.getBids(Number(id)).then((res) => setBids(res.content));
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? "입찰에 실패했습니다.");
    }
  };

  // 입찰 내역을 차트용 데이터로 변환
  const chartData = [...bids].reverse().map((bid) => ({
    time: new Date(bid.created_at).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    price: bid.price,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400">상품을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const images = item.media_urls.map((m) => m.url);

  const goToImage = (idx: number) => {
    setSlideDir(idx > currentImageIndex ? 1 : -1);
    setCurrentImageIndex(idx);
    setIsSliding(true);
  };
  const prevImage = () => goToImage(currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1);
  const nextImage = () => goToImage(currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1);

  return (
    <div className="min-h-screen bg-white pt-[196px]">
      <div className="max-w-[1400px] mx-auto px-6 pt-0 pb-8 sm:pb-12">

        {/* 2-column layout */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* Column 1: Image */}
          <div
            className="group relative overflow-hidden w-full select-none mt-8"
            style={{ aspectRatio: "1/1" }}
          >
            <AnimatePresence mode="wait" custom={slideDir} initial={false}>
              <motion.img
                key={currentImageIndex}
                custom={slideDir}
                variants={{
                  enter: (d: number) => ({ x: d > 0 ? "40%" : "-40%", opacity: 0, scale: 0.96 }),
                  center: { x: 0, opacity: 1, scale: 1 },
                  exit: (d: number) => ({ x: d > 0 ? "-40%" : "40%", opacity: 0, scale: 0.96 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
                onAnimationComplete={() => setIsSliding(false)}
                src={images[currentImageIndex]}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {images.length > 1 && (
              <>
                {/* 화살표 버튼 */}
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
                >
                  <ChevronLeft className="w-4 h-4 text-stone-600" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white z-10"
                >
                  <ChevronRight className="w-4 h-4 text-stone-600" />
                </button>

                {/* 인디케이터 점 */}
                <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10 transition-opacity duration-150 ${isSliding ? "opacity-0" : "opacity-100"}`}>
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => goToImage(idx)}
                      className="p-1.5 -m-1.5"
                    >
                      <motion.span
                        animate={{ opacity: currentImageIndex === idx ? 1 : 0.35, scale: currentImageIndex === idx ? 1 : 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="block w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Column 2: Info + Actions */}
          <div className="flex flex-col relative">
            {item.brand && (
              <p className="text-sm font-semibold uppercase tracking-widest text-stone-600 mb-2 mt-8">
                {item.brand}
              </p>
            )}
            <div className="flex items-start justify-between gap-4 mb-5">
              <h1 className="text-2xl font-semibold text-stone-800 leading-tight -ml-[3px]">
                {item.title}
              </h1>
              <div className="flex items-center gap-2 flex-shrink-0 -mt-[13px]">
                {!item.is_seller && (
                  <motion.button
                    onClick={handleWishToggle}
                    whileTap={{ scale: 0.88 }}
                    className="flex items-center gap-1.5 px-3.5 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <motion.span
                      key={String(wished)}
                      initial={{ scale: 0.6 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 450, damping: 14 }}
                    >
                      <Heart className={`w-4 h-4 ${wished ? "fill-rose-400 text-rose-400" : "text-stone-500"}`} />
                    </motion.span>
                    <span className="text-sm text-stone-600 font-medium tabular-nums">{wishCount}</span>
                  </motion.button>
                )}
                <motion.button
                  onClick={handleShare}
                  whileTap={{ scale: 0.88 }}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
                >
                  <Share2 className="w-4 h-4 text-stone-500" />
                </motion.button>
              </div>
            </div>

            {/* Price */}
            <div className="mb-5">
              <div className={`flex ${item.buy_now_price ? "justify-around" : ""}`}>
                <div className="text-center">
                  <p className="text-xs text-stone-400 mb-1.5">현재가</p>
                  <div className="text-2xl font-semibold text-stone-800 leading-tight" style={{ perspective: "400px" }}>
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
                {item.buy_now_price && (
                  <div className="text-center">
                    <p className="text-xs text-stone-400 mb-1.5">즉시 구매가</p>
                    <p className="text-2xl font-semibold text-stone-800 leading-tight">
                      {item.buy_now_price.toLocaleString()}원
                    </p>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-t border-stone-100 mb-5" />

            {/* Description */}
            <p className="text-sm font-light text-stone-600 leading-relaxed whitespace-pre-line mb-5">
              {item.description}
            </p>

            {/* Timer */}
            <div className="flex items-center flex-nowrap gap-1.5 mb-5">
              <p className="text-xs text-stone-500 whitespace-nowrap">경매종료:{" "}<span className="text-stone-500 tabular-nums">{countdown}</span></p>
            </div>

            {/* Buttons */}
            {item.is_seller ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => navigate(`/app/products/${id}/edit`)}
                  disabled={item.status !== "ACTIVE"}
                  className="flex-1 bg-stone-800 hover:bg-stone-700 text-white h-11 text-sm font-medium rounded transition-colors disabled:opacity-40"
                >
                  상품 수정
                </Button>
                <Button
                  onClick={handleDeleteItem}
                  disabled={!(item.status === "NO_BID_CLOSED" || (item.status === "ACTIVE" && item.bid_count === 0))}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-500 h-11 text-sm font-medium rounded hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-40"
                >
                  상품 삭제
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate("/login");
                      return;
                    }
                    setBidModalOpen(true);
                  }}
                  disabled={item.status !== "ACTIVE"}
                  className="flex-1 bg-black hover:bg-stone-900 text-white h-11 text-sm font-medium rounded transition-colors disabled:opacity-50"
                >
                  {item.status !== "ACTIVE" ? "경매 종료" : "입찰하기"}
                </Button>
                {item.buy_now_price && (
                  <Button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate("/login");
                        return;
                      }
                      setBuyNowModalOpen(true);
                    }}
                    disabled={item.status !== "ACTIVE"}
                    variant="outline"
                    className="flex-1 border-stone-200 text-stone-600 h-11 text-sm font-medium rounded hover:bg-stone-50 hover:border-stone-300 transition-colors disabled:opacity-50"
                  >
                    즉시 구매
                  </Button>
                )}
              </div>
            )}

            <div className="w-full flex items-center justify-center gap-2 text-xs text-stone-700 bg-gray-100 px-4 h-11 rounded mt-4">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-sky-400" />
              <span>이그노아 안전결제로 걱정없이 거래하세요.</span>
            </div>
          </div>
        </div>

        {/* Seller Section */}
        <div className="mt-12 pb-10">
          <h2 className="text-lg font-semibold text-black mb-4">판매자 정보</h2>
          <div className="flex items-center gap-5">
            <Avatar className="w-16 h-16 transition-shadow duration-300 hover:shadow-lg cursor-pointer flex-shrink-0">
              <AvatarImage src={item.seller.profile_image_url ?? undefined} alt={item.seller.nickname} />
              <AvatarFallback className="bg-stone-100 text-stone-500 text-sm">
                {item.seller.nickname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <p className="text-base font-semibold text-stone-800">{item.seller.nickname}</p>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>매너 <span className="font-semibold text-stone-600">4.5</span></span>
                <span className="text-gray-200">·</span>
                <span>팔로워 <span className="text-stone-600 font-semibold">5</span></span>
                {item.seller.address && (
                  <>
                    <span className="text-gray-200">·</span>
                    <span>{item.seller.address}</span>
                  </>
                )}
              </div>
            </div>
            <div className="ml-6 flex items-center gap-3 self-center">
              <button
                onClick={() => !isAuthenticated && navigate("/login")}
                className="text-xs text-white bg-stone-800 hover:bg-stone-700 transition-colors px-4 h-8 rounded-full"
              >
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
          <h2 className="text-lg font-semibold text-black mb-8">
            입찰 이력 <span className="text-sm text-gray-400 font-normal">({bids.length}건)</span>
          </h2>

          <div className="grid lg:grid-cols-5 gap-8">
              {/* Chart */}
              <div className="lg:col-span-3 overflow-x-auto">
                <div className="min-w-[600px]">
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis
                        dataKey="time"
                        stroke="#9ca3af"
                        style={{ fontSize: "11px" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: "11px" }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "4px",
                          fontSize: "12px",
                          padding: "8px 12px",
                        }}
                        formatter={(value: number) => [`${value.toLocaleString()}원`, "입찰가"]}
                        labelStyle={{ fontWeight: "600", marginBottom: "4px", fontSize: "11px" }}
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

              {/* Recent Bids */}
              <div className="lg:col-span-2">
                <div className="overflow-y-auto max-h-[280px] space-y-3 pr-2">
                  {bids.map((bid, index) => (
                    <div
                      key={bid.bid_id}
                      className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-gray-400 font-medium w-8">
                          #{bids.length - index}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-black">
                            {bid.price.toLocaleString()}원
                          </div>
                          <div className="text-[11px] text-gray-500">
                            {bid.bidder_nickname} ·{" "}
                            {new Date(bid.created_at).toLocaleTimeString("ko-KR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                      {index === 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </div>

        {/* Policy Sections */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <button
              onClick={() => setShippingOpen(!shippingOpen)}
              className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-semibold text-black">배송정보</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  shippingOpen ? "rotate-180" : ""
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

          <div>
            <button
              onClick={() => setReturnOpen(!returnOpen)}
              className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="text-base font-semibold text-black">반품 및 환불 정책</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-600 transition-transform ${
                  returnOpen ? "rotate-180" : ""
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
                <p className="text-xs text-gray-600">외부(계좌) 거래 시, 이그노아 고객센터 이용이 불가합니다.</p>
              </div>
            )}
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
              onClick={() => {
                setBidModalOpen(false);
                setBidStep("input");
                setBidAmount("");
              }}
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
                      <p className="text-xs text-gray-400 mt-2.5">
                        최소 {(displayPrice + 1).toLocaleString()}원 이상
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleBidNext}
                        className="flex-1 h-11 bg-stone-800 hover:bg-stone-700 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        입찰하기
                      </button>
                      <button
                        onClick={() => {
                          setBidModalOpen(false);
                          setBidAmount("");
                        }}
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
                <p className="text-3xl font-semibold text-stone-800">
                  {item.buy_now_price?.toLocaleString()}원
                </p>
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
