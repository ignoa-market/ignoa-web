import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router";
import { Mail, User, MapPin, Camera, Search, X, CheckCircle2, Trash2 } from "lucide-react";
import { ProductCard } from "@/components/common/ProductCard";
import { AddressModal } from "@/components/common/AddressModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { userApi } from "@/api/auth";
import { wishApi } from "@/api/item";
import { wishStore } from "@/store/wishStore";
import type { ApiError, ItemStatus, ItemSummary, WishSummary } from "@/types/api";


const TAB_IDS = ["products", "bidding", "wishlist"] as const;
type TabId = (typeof TAB_IDS)[number];

export function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabId = TAB_IDS.includes(tabParam as TabId) ? (tabParam as TabId) : "products";
  const setActiveTab = (tab: TabId) => setSearchParams({ tab }, { replace: true });
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState<"followers" | "following" | null>(null);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedAddr, setSavedAddr] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [isNicknameChecking, setIsNicknameChecking] = useState(false);
  const [isNicknameAvailable, setIsNicknameAvailable] = useState<boolean | null>(null);
  const [nicknameError, setNicknameError] = useState("");

  const [myItems, setMyItems] = useState<ItemSummary[]>([]);
  const [biddingItems, setBiddingItems] = useState<ItemSummary[]>([]);
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
  const isDirty = isNicknameDirty || address !== savedAddr;
  const canSave = isDirty && (!isNicknameDirty || isNicknameAvailable === true);

  useEffect(() => {
    userApi.getMe().then((res) => {
      setEmail(res.email);
      setUserName(res.nickname);
      setSavedName(res.nickname);
      setAddress(res.address);
      setSavedAddr(res.address);
      setProfileImage(res.profile_image_url);
    }).catch(() => {
      toast.error("유저 정보를 불러오지 못했습니다");
    });
  }, []);

  useEffect(() => {
    Promise.all([
      userApi.getMyItems().then(setMyItems),
      userApi.getMyBids().then(setBiddingItems),
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

  const handleSaveProfile = async () => {
    try {
      const res = await userApi.updateProfile(userName, address);
      setSavedName(res.nickname);
      setSavedAddr(res.address);
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
  };

  const itemToCard = (item: ItemSummary): ProfileCard => ({
    id: String(item.item_id),
    brand: item.brand,
    title: item.title,
    currentPrice: item.current_price,
    imageUrl: item.media_url,
    isWished: item.is_wished,
    wishCount: item.wish_count,
    viewCount: item.view_count,
    status: item.status,
    isEnded: new Date(item.end_at) < new Date(),
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

  const followers: { id: string; name: string }[] = [];
  const following: { id: string; name: string }[] = [];

  const tabs: { id: TabId; label: string; count: number }[] = [
    { id: "products", label: "판매중", count: myItems.length },
    { id: "bidding",  label: "입찰중", count: biddingItems.length },
    { id: "wishlist", label: "찜목록", count: wishItems.length },
  ];

  const currentCards: ProfileCard[] =
    activeTab === "products" ? myItems.map(itemToCard) :
    activeTab === "bidding"  ? biddingItems.map(itemToCard) :
    wishItems.map(wishToCard);

  const followList = showFollowModal === "followers" ? followers : following;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white pt-[196px] pb-28"
    >
      {/* Profile Hero */}
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between py-8">

          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-5">
            <div className="relative group flex-shrink-0">
              <input type="file" id="profileImageInput" accept="image/*" onChange={handleImageChange} className="hidden" />
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden relative">
                {profileImage ? (
                  <img
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
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <label
                    htmlFor="profileImageInput"
                    className="cursor-pointer p-1.5 rounded-full hover:bg-white/20 transition-colors"
                    title="사진 변경"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </label>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleImageDelete}
                      className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
                      title="사진 삭제"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-black text-black leading-tight">{savedName}</h1>
              <p className="text-sm text-gray-400 mt-1">{email}</p>
              <div className="flex items-center gap-5 mt-3">
                <button onClick={() => setShowFollowModal("followers")} className="flex items-center gap-1.5 hover:opacity-60 transition-opacity">
                  <span className="text-sm text-gray-400">팔로워</span>
                  <span className="text-sm font-bold text-black">{followers.length}</span>
                </button>
                <button onClick={() => setShowFollowModal("following")} className="flex items-center gap-1.5 hover:opacity-60 transition-opacity">
                  <span className="text-sm text-gray-400">팔로잉</span>
                  <span className="text-sm font-bold text-black">{following.length}</span>
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-400">판매수</span>
                  <span className="text-sm font-bold text-black">0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <button
            onClick={() => {
              if (isEditing) {
                setUserName(savedName);
                setAddress(savedAddr);
                setIsNicknameAvailable(null);
                setNicknameError("");
              }
              setIsEditing(!isEditing);
            }}
            className="h-9 px-5 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-black hover:text-black transition-all"
          >
            {isEditing ? "취소" : "프로필 수정"}
          </button>
        </div>

        {/* Edit Form */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="py-10 border-b border-gray-100">
                <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-6">프로필 수정</p>
                <div className="grid grid-cols-2 gap-5 max-w-2xl mb-6">
                  <div>
                    <Label htmlFor="userName" className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> 닉네임
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="userName"
                          value={userName}
                          onChange={(e) => {
                            setUserName(e.target.value);
                            setIsNicknameAvailable(null);
                            setNicknameError("");
                          }}
                          className={`h-11 pr-8 border focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black rounded-none ${
                            nicknameError ? "border-red-400" :
                            isNicknameAvailable ? "border-green-400" :
                            "border-gray-200"
                          }`}
                        />
                        {isNicknameAvailable && (
                          <CheckCircle2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={checkNickname}
                        disabled={isNicknameChecking || !userName.trim() || !isNicknameDirty}
                        className="h-11 px-3 border border-gray-200 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isNicknameChecking ? "확인중..." : "중복확인"}
                      </button>
                    </div>
                    <AnimatePresence>
                      {nicknameError && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-xs mt-1.5">
                          {nicknameError}
                        </motion.p>
                      )}
                      {isNicknameAvailable && !nicknameError && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 text-xs mt-1.5">
                          ✓ 사용 가능한 닉네임입니다
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> 주소
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowAddressModal(true)}
                      className="w-full h-11 px-3 border border-gray-200 flex items-center justify-between text-sm hover:border-black transition-colors group rounded-none"
                    >
                      <span className={address ? "text-black" : "text-gray-400"}>
                        {address || "주소를 검색해주세요"}
                      </span>
                      <Search className="w-4 h-4 text-gray-400 group-hover:text-black transition-colors flex-shrink-0" />
                    </button>
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> 이메일
                    </Label>
                    <div className="h-11 px-3 bg-gray-50 border border-gray-200 flex items-center text-sm text-gray-400">
                      {email}
                    </div>
                  </div>
                </div>
                <button
                  onClick={canSave ? handleSaveProfile : undefined}
                  className={`h-10 px-8 rounded-full text-sm font-semibold transition-all ${
                    canSave
                      ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                      : "bg-white border border-gray-200 text-gray-300 cursor-default"
                  }`}
                >
                  저장
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-10 mt-16 mb-8 border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-5 text-[11px] font-semibold tracking-[0.25em] uppercase transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-400 hover:text-black"
              }`}
            >
              {tab.label}
              <span className="ml-2 font-normal">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {tabLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-100 rounded-sm animate-pulse" />
                ))}
              </div>
            ) : currentCards.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentCards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <ProductCard product={card} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-300 uppercase">등록된 상품이 없습니다</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Follow Modal */}
      <AnimatePresence>
        {showFollowModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            onClick={() => setShowFollowModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-white w-full max-w-sm mx-4 shadow-xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                <p className="text-[11px] font-semibold tracking-[0.3em] text-black uppercase">
                  {showFollowModal === "followers" ? "Followers" : "Following"}
                </p>
                <button
                  onClick={() => setShowFollowModal(null)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <ul className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {followList.map((user) => (
                  <li key={user.id} className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-medium text-black">{user.name}</span>
                  </li>
                ))}
              </ul>
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
    </motion.div>
  );
}
