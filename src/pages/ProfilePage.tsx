import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router";
import { User, Camera, Search, CheckCircle2, Pencil } from "lucide-react";
import { ProductCard } from "@/components/common/ProductCard";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import { AddressModal } from "@/components/common/AddressModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { userApi } from "@/api/auth";
import { itemApi, wishApi } from "@/api/item";
import { wishStore } from "@/store/wishStore";
import type { ApiError, ItemStatus, ItemSummary, PurchaseSummary, WishSummary } from "@/types/api";
import { MAX_AUCTION_EXTENSION_COUNT } from "@/constants/auction";
import { useModalBehavior } from "@/hooks/useModalBehavior";
import {
  ACTION_MODAL_ACTION_CLASS,
  ACTION_MODAL_CANCEL_CLASS,
  ACTION_MODAL_CONTENT_CLASS,
  ACTION_MODAL_FOOTER_CLASS,
  ACTION_MODAL_TITLE_CLASS,
} from "@/constants/actionModal";

// 서버 검증(UpdateUserRequest)과 같은 값
const BIO_MAX_LENGTH = 100;

const TAB_IDS = ["products", "sold", "bidding", "won", "purchased", "wishlist"] as const;

// 팔린 상품. 유찰(NO_BID_CLOSED)은 팔린 게 아니라 판매중 탭에 종료 표시로 남긴다
const SOLD_STATUSES: ItemStatus[] = ["BID_CLOSED", "BUY_NOW_CLOSED"];
const IN_PROGRESS_STATUSES: ItemStatus[] = ["ACTIVE", "BUY_NOW_PENDING"];
type TabId = (typeof TAB_IDS)[number];

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabId = TAB_IDS.includes(tabParam as TabId) ? (tabParam as TabId) : "products";
  const setActiveTab = (tab: TabId) => setSearchParams({ tab }, { replace: true });
  const [isEditing, setIsEditing] = useState(false);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedAddr, setSavedAddr] = useState("");
  const [bio, setBio] = useState("");
  const [savedBio, setSavedBio] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null);
  const [nicknameError, setNicknameError] = useState("");

  const [myItems, setMyItems] = useState<ItemSummary[]>([]);
  const [biddingItems, setBiddingItems] = useState<ItemSummary[]>([]);
  const [purchases, setPurchases] = useState<PurchaseSummary[]>([]);
  const [wishItems, setWishItems] = useState<WishSummary[]>([]);
  const [tabLoading, setTabLoading] = useState(true);

  const fetchWishes = useCallback(
    () => wishApi.getWishes(0, 20).then((res) => setWishItems(res.content)),
    []
  );

  useEffect(() => {
    return wishStore.subscribe((id, state, source) => {
      const mirror = (prev: ItemSummary[]) =>
        prev.map((item) =>
          item.item_id === id
            ? { ...item, is_wished: state.wished, wish_count: state.count }
            : item
        );
      setMyItems(mirror);
      setBiddingItems(mirror);
      setPurchases((prev) =>
        prev.map((purchase) =>
          purchase.item.item_id === id
            ? { ...purchase, item: { ...purchase.item, is_wished: state.wished, wish_count: state.count } }
            : purchase
        )
      );

      if (source === "toggle" && !state.wished) {
        setWishItems((prev) => prev.filter((item) => item.item_id !== id));
        return;
      }
      if ((source === "commit" || source === "rollback") && state.wished) {
        fetchWishes().catch(() => {});
      }
    });
  }, [fetchWishes]);

  const isNicknameDirty = userName !== savedName;
  const isDirty = isNicknameDirty || address !== savedAddr || bio !== savedBio;
  const canSave = isDirty && (!isNicknameDirty || isNicknameAvailable === true);

  useEffect(() => {
    userApi.getMe().then((res) => {
      setEmail(res.email);
      setUserName(res.nickname);
      setSavedName(res.nickname);
      setAddress(res.address);
      setSavedAddr(res.address);
      setBio(res.bio ?? "");
      setSavedBio(res.bio ?? "");
      setProfileImage(res.profile_image_url);
    }).catch(() => {
      toast.error("유저 정보를 불러오지 못했습니다");
    });
  }, []);

  useEffect(() => {
    Promise.all([
      userApi.getMyItems().then(setMyItems),
      userApi.getMyBids().then(setBiddingItems),
      userApi.getMyPurchases().then(setPurchases),
      fetchWishes(),
    ])
      .catch(() => toast.error("목록을 불러오지 못했습니다"))
      .finally(() => setTabLoading(false));
  }, [fetchWishes]);

  const checkNickname = async () => {
    if (!userName.trim()) { setNicknameError("닉네임을 입력해주세요"); return; }
    setIsNicknameChecking(true);
    try {
      await userApi.checkNicknameDuplicate(userName);
      setIsNicknameAvailable(true);
      setNicknameError("");
      toast.success("사용 가능한 닉네임입니다");
    } catch (err) {
      const error = err as ApiError;
      setIsNicknameAvailable(false);
      setNicknameError(error.message ?? "이미 사용중인 닉네임입니다");
    } finally {
      setIsNicknameChecking(false);
    }
  };

  const closeEdit = () => {
    setUserName(savedName);
    setAddress(savedAddr);
    setBio(savedBio);
    setIsNicknameAvailable(null);
    setNicknameError("");
    setIsEditing(false);
  };

  // 주소 검색 창이 열려 있으면 Esc가 프로필 모달까지 닫지 않게 한다
  const editModalRef = useModalBehavior<HTMLDivElement>(isEditing, () => {
    if (!showAddressModal) closeEdit();
  });

  const handleSaveProfile = async () => {
    try {
      // 바뀌지 않은 닉네임을 보내면 서버가 내 닉네임을 중복으로 판단하므로 바뀐 항목만 보낸다
      const res = await userApi.updateProfile({
        nickname: isNicknameDirty ? userName : undefined,
        address: address !== savedAddr ? address : undefined,
        bio: bio !== savedBio ? bio.trim() : undefined,
      });
      setSavedName(res.nickname);
      setSavedAddr(res.address);
      setBio(res.bio ?? "");
      setSavedBio(res.bio ?? "");
      setIsEditing(false);
      toast.success("프로필이 업데이트되었습니다!");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "프로필 업데이트에 실패했습니다");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await userApi.updateProfileImage(file);
      setProfileImage(res.profile_image_url);
      toast.success("프로필 사진이 변경되었습니다!");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "프로필 사진 변경에 실패했습니다");
    }
  };

  const handleImageDelete = async () => {
    try {
      await userApi.deleteProfileImage();
      setProfileImage(null);
      toast.success("프로필 사진이 삭제되었습니다");
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "프로필 사진 삭제에 실패했습니다");
    }
  };

  const handleExtendAuction = useCallback(async (itemId: number) => {
    try {
      const result = await itemApi.extendAuction(itemId);
      setMyItems((items) => items.map((item) =>
        item.item_id === itemId
          ? { ...item, end_at: result.end_at, extension_count: result.extension_count }
          : item
      ));
      const remainingCount = Math.max(0, MAX_AUCTION_EXTENSION_COUNT - result.extension_count);
      toast.success(remainingCount > 0
        ? `경매 마감이 1일 연장되었습니다. 앞으로 ${remainingCount}회 더 연장할 수 있습니다.`
        : "경매 마감이 1일 연장되었습니다. 연장 가능 횟수를 모두 사용했습니다."
      );
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message ?? "경매 마감 연장에 실패했습니다.");
    }
  }, []);

  type ProfileCard = {
    id: string;
    brand?: string;
    title: string;
    currentPrice: number;
    imageUrl: string;
    wishCount: number;
    viewCount?: number;
    isWished?: boolean;
    status?: ItemStatus;
    isEnded?: boolean;
    endAt?: string;
    extensionCount?: number;
  };

  const itemToCard = (item: ItemSummary): ProfileCard => ({
    id: String(item.item_id),
    brand: item.brand,
    title: item.title,
    currentPrice: item.current_price,
    imageUrl: item.media_url,
    isWished: item.is_wished,
    wishCount: item.wish_count,
    status: item.status,
    isEnded: new Date(item.end_at) < new Date(),
    endAt: item.end_at,
    extensionCount: item.extension_count,
  });

  const wishToCard = (w: WishSummary): ProfileCard => ({
    id: String(w.item_id),
    title: w.title,
    currentPrice: w.current_price,
    imageUrl: w.media_url,
    wishCount: w.wish_count,
    isWished: true,
    status: w.item_status,
    isEnded: new Date(w.end_at) < new Date(),
  });


  const sellingItems = myItems.filter((item) => !SOLD_STATUSES.includes(item.status));
  const soldItems = myItems.filter((item) => SOLD_STATUSES.includes(item.status));
  const activeBidItems = biddingItems.filter((item) => IN_PROGRESS_STATUSES.includes(item.status));
  const wonItems = purchases.filter((p) => p.trade_status !== "PAID").map((p) => p.item);
  const purchasedItems = purchases.filter((p) => p.trade_status === "PAID").map((p) => p.item);

  const tabs: { id: TabId; label: string; items: ProfileCard[] }[] = [
    { id: "products",  label: "판매중",   items: sellingItems.map(itemToCard) },
    { id: "sold",      label: "판매완료", items: soldItems.map(itemToCard) },
    { id: "bidding",   label: "입찰중",   items: activeBidItems.map(itemToCard) },
    { id: "won",       label: "낙찰",     items: wonItems.map(itemToCard) },
    { id: "purchased", label: "구매완료", items: purchasedItems.map(itemToCard) },
    { id: "wishlist",  label: "찜목록",   items: wishItems.map(wishToCard) },
  ];

  const tabById = (id: TabId) => tabs.find((tab) => tab.id === id)!;

  const currentCards: ProfileCard[] = tabById(activeTab).items;

  const browseAction = { label: "경매 둘러보기", to: "/app" };
  const emptyStates: Record<TabId, { message: string; action?: { label: string; to: string } }> = {
    products: { message: "판매 중인 상품이 없어요", action: { label: "상품 등록하기", to: "/app/register-product" } },
    sold: { message: "아직 판매된 상품이 없어요" },
    bidding: { message: "진행 중인 입찰이 없어요", action: browseAction },
    won: { message: "결제를 기다리는 낙찰이 없어요" },
    purchased: { message: "구매를 완료한 상품이 없어요" },
    wishlist: { message: "찜한 상품이 없어요", action: browseAction },
  };
  const emptyState = emptyStates[activeTab];


  return (
    <div className="min-h-screen bg-white pt-[170px] pb-28">
      {/* Profile Hero */}
      <div className="max-w-[1120px] mx-auto px-8" style={{ zoom: 0.9 }}>
        <div className="flex items-center justify-between py-8">

          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-5">
            <div className="relative flex-shrink-0">
              {/* 사진 변경은 프로필 수정 모달의 카메라 버튼이 이 입력을 연다 */}
              <input type="file" id="profileImageInput" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden relative">
                {profileImage ? (
                  <ImageWithFallback
                    src={profileImage}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={() => setProfileImage(null)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black text-black leading-tight">{savedName}</h1>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-black"
                  title="프로필 수정"
                  aria-label="프로필 수정"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-1">{email}</p>
              {savedBio && (
                <p className="mt-3 max-w-md whitespace-pre-line break-words text-sm text-gray-600">{savedBio}</p>
              )}
            </div>
          </div>

        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 mt-16 mb-8 border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-10 px-1 pb-5 text-sm font-medium text-black transition-all duration-200 border-b-2 -mb-px cursor-pointer touch-manipulation hover:-translate-y-0.5 active:translate-y-0 ${
                activeTab === tab.id ? "border-black" : "border-transparent"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-stone-400">{tab.items.length}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            {tabLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : currentCards.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5">
                {currentCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                  >
                    <ProductCard
                      product={card}
                      editHref={
                        activeTab === "products" && card.status === "ACTIVE" && !card.isEnded
                          ? `/app/products/${card.id}/edit`
                          : undefined
                      }
                      editCancelTo="/app/profile?tab=products"
                      onExtendAuction={
                        activeTab === "products" && card.status === "ACTIVE" && !card.isEnded
                          ? handleExtendAuction
                          : undefined
                      }
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-24 text-center">
                {/* 빈 화면도 탭과 같은 13px 글씨로, 다음 행동은 밑줄 글자 링크로 둔다 */}
                <p className="text-[13px] font-normal text-gray-400">{emptyState.message}</p>
                {emptyState.action && (
                  <Link
                    to={emptyState.action.to}
                    className="text-[13px] font-normal text-black underline underline-offset-4 transition-colors hover:text-gray-500"
                  >
                    {emptyState.action.label}
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Profile Edit Modal: 다른 확인 모달과 같은 크기·버튼, 입력칸은 상품 등록·수정 화면과 같은 스타일. 이메일은 제목 아래, 사진·닉네임·소개·지역 순서 */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
            onClick={closeEdit}
          >
            <motion.div
              ref={editModalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="profile-edit-title"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
              className={`${ACTION_MODAL_CONTENT_CLASS} max-h-[90vh] overflow-y-auto`}
              style={{ zoom: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="profile-edit-title" className={ACTION_MODAL_TITLE_CLASS}>프로필 수정</h2>

              {/* 사진은 가운데, 카메라 버튼으로 변경 */}
              <div className="mt-2 mb-6 flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                    {profileImage ? (
                      <ImageWithFallback src={profileImage} alt="" className="h-full w-full object-cover" onError={() => setProfileImage(null)} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-7 w-7 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById("profileImageInput")?.click()}
                    aria-label="사진 변경"
                    className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-black text-white outline-none transition-colors hover:bg-gray-800 focus-visible:bg-gray-800"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleImageDelete}
                    className="text-[12px] font-normal text-gray-400 outline-none transition-colors hover:text-black focus-visible:text-black"
                  >
                    사진 삭제
                  </button>
                )}
              </div>

              {/* 계정 정보(이메일) → 닉네임 → 주소 → 자기소개 */}
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block text-sm font-semibold text-black">이메일</Label>
                  <div className="flex h-11 items-center rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">{email}</div>
                </div>

                <div>
                  <Label htmlFor="userName" className="mb-2 block text-sm font-semibold text-black">닉네임</Label>
                  <div className="relative">
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        setIsNicknameAvailable(null);
                        setNicknameError("");
                      }}
                      className={`h-11 rounded-xl border bg-white pr-20 text-sm focus-visible:ring-0 focus-visible:border-black ${
                        nicknameError ? "border-red-400" :
                        isNicknameAvailable ? "border-green-400" :
                        "border-gray-300"
                      }`}
                    />
                    {isNicknameDirty && (
                      isNicknameAvailable ? (
                        <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
                      ) : (
                        <button
                          type="button"
                          onClick={checkNickname}
                          disabled={isNicknameChecking || !userName.trim()}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-black transition-colors hover:bg-gray-100 disabled:text-gray-300"
                        >
                          {isNicknameChecking ? "확인 중" : "중복확인"}
                        </button>
                      )
                    )}
                  </div>
                  {nicknameError && <p className="mt-1.5 text-xs text-red-500">{nicknameError}</p>}
                  {isNicknameAvailable && !nicknameError && (
                    <p className="mt-1.5 text-xs text-green-600">사용 가능한 닉네임입니다</p>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block text-sm font-semibold text-black">주소</Label>
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="group flex h-11 w-full items-center justify-between rounded-xl border border-gray-300 bg-white px-3 text-sm transition-colors hover:border-black"
                  >
                    <span className={`truncate ${address ? "text-black" : "text-gray-400"}`}>
                      {address || "주소를 검색해주세요"}
                    </span>
                    <Search className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-black" />
                  </button>
                </div>

                <div>
                  <Label htmlFor="bio" className="mb-2 block text-sm font-semibold text-black">자기소개</Label>
                  <div className="relative">
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      maxLength={BIO_MAX_LENGTH}
                      rows={3}
                      placeholder="나를 소개해 주세요"
                      className="block w-full resize-none rounded-xl border border-gray-300 bg-white px-3 pt-2.5 pb-7 text-sm placeholder:text-gray-400 focus:border-black focus:outline-none"
                    />
                    <span className="pointer-events-none absolute bottom-2.5 right-3 text-xs text-gray-400">
                      {bio.length}/{BIO_MAX_LENGTH}
                    </span>
                  </div>
                </div>
              </div>

              <div className={ACTION_MODAL_FOOTER_CLASS}>
                <button type="button" onClick={closeEdit} className={ACTION_MODAL_CANCEL_CLASS}>
                  취소
                </button>
                <button type="button" onClick={handleSaveProfile} disabled={!canSave} className={ACTION_MODAL_ACTION_CLASS}>
                  저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Address Modal */}
      <AnimatePresence>
        {showAddressModal && (
          <AddressModal
            onSelect={(addr) => setAddress(addr)}
            onClose={() => setShowAddressModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
