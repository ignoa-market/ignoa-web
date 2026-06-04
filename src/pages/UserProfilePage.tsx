import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { User, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "@/components/common/ProductCard";

type ProfileCard = {
  id: string;
  brand?: string;
  title: string;
  currentPrice: number;
  imageUrl: string;
  wishCount: number;
  isEnded: boolean;
};

// TODO: API 연동 - GET /api/users/{userId}
const MOCK_USER = {
  userId: "1",
  nickname: "김민준",
  address: "서울 마포구",
  profileImageUrl: null as string | null,
  followerCount: 12,
  followingCount: 8,
  salesCount: 5,
};

// TODO: API 연동 - GET /api/users/{userId}/items
const MOCK_ITEMS: ProfileCard[] = [
  {
    id: "101",
    brand: "Nike",
    title: "Nike Air Force 1 Low '07",
    currentPrice: 89000,
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    wishCount: 14,
    isEnded: false,
  },
  {
    id: "102",
    brand: "Stüssy",
    title: "Stüssy 8 Ball Crewneck",
    currentPrice: 120000,
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    wishCount: 7,
    isEnded: true,
  },
];

export function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(MOCK_USER.followerCount);

  // TODO: userId로 실제 데이터 fetch
  const user = MOCK_USER;
  const items = MOCK_ITEMS;

  const handleFollow = () => {
    // TODO: API 연동 - POST/DELETE /api/users/{userId}/follow
    setIsFollowing((prev) => !prev);
    setFollowerCount((prev) => isFollowing ? prev - 1 : prev + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white pt-[196px] pb-28"
    >
      <div className="max-w-[1400px] mx-auto px-8">

        {/* Profile Hero */}
        <div className="flex items-center justify-between py-8">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
              {user.profileImageUrl ? (
                <img src={user.profileImageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            <div>
              <h1 className="text-4xl font-black text-black leading-tight">{user.nickname}</h1>
              {user.address && (
                <p className="text-sm text-gray-400 mt-1">{user.address}</p>
              )}
              <div className="flex items-center gap-5 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-400">팔로워</span>
                  <span className="text-sm font-bold text-black">{followerCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-400">팔로잉</span>
                  <span className="text-sm font-bold text-black">{user.followingCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm text-gray-400">판매수</span>
                  <span className="text-sm font-bold text-black">{user.salesCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleFollow}
              className={`h-9 px-5 rounded-full text-sm font-medium transition-all ${
                isFollowing
                  ? "border border-gray-200 text-gray-600 hover:border-black hover:text-black"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isFollowing ? "팔로잉" : "팔로우"}
            </button>
            <button
              onClick={() => navigate("/app/messages")}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 text-stone-500 hover:border-black hover:text-black transition-all"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab */}
        <div className="flex items-center gap-10 mt-8 mb-8 border-b border-gray-100">
          <div className="pb-5 text-[11px] font-semibold tracking-[0.25em] uppercase border-b-2 border-black text-black -mb-px">
            판매중 <span className="ml-2 font-normal">{items.length}</span>
          </div>
        </div>

        {/* Items Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {items.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative"
                  >
                    <ProductCard product={card} />
                    {card.isEnded && (
                      <div className="absolute top-0 left-0 right-0 aspect-square rounded-sm overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-white drop-shadow-md">SOLD</span>
                        </div>
                      </div>
                    )}
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
    </motion.div>
  );
}
