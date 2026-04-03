import { useState } from "react";
import { Mail, Phone, User, MapPin, Camera, Search, X } from "lucide-react";
import { ProductCard } from "@/components/common/ProductCard";
import { AddressModal } from "@/components/common/AddressModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const mockMyProducts = [
  { id: "1", title: "MacBook Pro 16인치 M1 2021 실버", currentPrice: 1250000, imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", timeLeft: "2시간 남음", wishCount: 24 },
  { id: "2", title: "아이패드 에어 5세대 256GB 퍼플", currentPrice: 580000, imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80", timeLeft: "45분 남음", wishCount: 32 },
  { id: "101", title: "소니 WH-1000XM4 헤드폰", currentPrice: 185000, imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1080&q=80", timeLeft: "경매 종료", wishCount: 15 },
  { id: "102", title: "캐논 EOS M50 미러리스", currentPrice: 420000, imageUrl: "https://images.unsplash.com/photo-1613235577937-9ac3eed992fc?w=1080&q=80", timeLeft: "경매 종료", wishCount: 28 },
];

const mockBiddingProducts = [
  { id: "201", title: "백팩 여행용 40L", currentPrice: 75000, imageUrl: "https://images.unsplash.com/photo-1570630358718-4fb324824b3d?w=1080&q=80", timeLeft: "3시간 15분", wishCount: 12 },
  { id: "202", title: "게이밍 마우스 RGB", currentPrice: 65000, imageUrl: "https://images.unsplash.com/photo-1628832307345-7404b47f1751?w=1080&q=80", timeLeft: "1시간 40분", wishCount: 18 },
  { id: "203", title: "빈티지 레더 재킷", currentPrice: 320000, imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80", timeLeft: "경매 종료", wishCount: 41 },
];

const mockWishlistProducts = [
  { id: "301", title: "Nike 에어포스 1 화이트", currentPrice: 89000, imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80", timeLeft: "5시간 20분", wishCount: 45 },
];

const mockFollowers = [
  { id: "f1", name: "패션피플" },
  { id: "f2", name: "빈티지러버" },
  { id: "f3", name: "스트릿웨어킹" },
  { id: "f4", name: "럭셔리헌터" },
  { id: "f5", name: "데님마니아" },
];

const mockFollowing = [
  { id: "g1", name: "릭오웬스팬" },
  { id: "g2", name: "아크테릭스매니아" },
  { id: "g3", name: "슈프림코리아" },
];

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState("products");
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState<"followers" | "following" | null>(null);

  const savedUserName = "짜응잉";
  const savedAddress = "대전광역시 유성구 동서대로 125";

  const [userName, setUserName] = useState(savedUserName);
  const [address, setAddress] = useState(savedAddress);
  const [savedName, setSavedName] = useState(savedUserName);
  const [savedAddr, setSavedAddr] = useState(savedAddress);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const email = "user@hanbat.ac.kr";
  const phone = "010-1234-5678";

  const isDirty = userName !== savedName || address !== savedAddr;

  const handleSaveProfile = () => {
    setSavedName(userName);
    setSavedAddr(address);
    setIsEditing(false);
    toast.success("프로필이 업데이트되었습니다!");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
        toast.success("프로필 사진이 변경되었습니다!");
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: "products", label: "Selling", count: mockMyProducts.length },
    { id: "bidding",  label: "Bidding", count: mockBiddingProducts.length },
    { id: "wishlist", label: "Wishlist", count: mockWishlistProducts.length },
  ];

  const currentProducts =
    activeTab === "products" ? mockMyProducts :
    activeTab === "bidding"  ? mockBiddingProducts :
    mockWishlistProducts;

  const followList = showFollowModal === "followers" ? mockFollowers : mockFollowing;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white pt-32 pb-28"
    >
      {/* Profile Hero */}
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-end justify-between pb-14">

          {/* Left: Avatar + Name */}
          <div className="flex items-end gap-10">
            <div className="relative group flex-shrink-0">
              <input type="file" id="profileImageInput" accept="image/*" onChange={handleImageChange} className="hidden" />
              <label htmlFor="profileImageInput" className="cursor-pointer block w-24 h-24 rounded-full bg-gray-100 overflow-hidden relative">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-300" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-4 h-4 text-white" />
                </div>
              </label>
            </div>

            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-3">Member</p>
              <h1 className="text-5xl font-black text-black tracking-tight leading-none">{savedName}</h1>
              <p className="text-sm text-gray-400 mt-3">{email}</p>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex items-end gap-14">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-1">Selling</p>
              <p className="text-4xl font-black text-black leading-none">{mockMyProducts.length}</p>
            </div>
            <button onClick={() => setShowFollowModal("followers")} className="text-left hover:opacity-60 transition-opacity">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-1">Followers</p>
              <p className="text-4xl font-black text-black leading-none">{mockFollowers.length}</p>
            </button>
            <button onClick={() => setShowFollowModal("following")} className="text-left hover:opacity-60 transition-opacity">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-1">Following</p>
              <p className="text-4xl font-black text-black leading-none">{mockFollowing.length}</p>
            </button>
            <button
              onClick={() => {
                if (isEditing) { setUserName(savedName); setAddress(savedAddr); }
                setIsEditing(!isEditing);
              }}
              className="h-10 px-6 rounded-full border border-gray-200 text-sm font-medium text-gray-600 hover:border-black hover:text-black transition-all"
            >
              {isEditing ? "취소" : "Edit Profile"}
            </button>
          </div>
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
                <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-6">Edit Profile</p>
                <div className="grid grid-cols-2 gap-5 max-w-2xl mb-6">
                  <div>
                    <Label htmlFor="userName" className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Name
                    </Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-11 border-gray-200 focus-visible:ring-1 focus-visible:ring-black focus-visible:border-black rounded-none"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" /> Address
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
                      <Mail className="w-3 h-3" /> Email
                    </Label>
                    <div className="h-11 px-3 bg-gray-50 border border-gray-200 flex items-center text-sm text-gray-400">
                      {email}
                    </div>
                  </div>
                  <div>
                    <Label className="text-[11px] font-semibold tracking-[0.2em] text-gray-400 uppercase mb-2 flex items-center gap-1.5">
                      <Phone className="w-3 h-3" /> Phone
                    </Label>
                    <div className="h-11 px-3 bg-gray-50 border border-gray-200 flex items-center text-sm text-gray-400">
                      {phone}
                    </div>
                  </div>
                </div>
                <button
                  onClick={isDirty ? handleSaveProfile : undefined}
                  className={`h-10 px-8 rounded-full text-sm font-semibold transition-all ${
                    isDirty
                      ? "bg-black text-white hover:bg-gray-800 cursor-pointer"
                      : "bg-white border border-gray-200 text-gray-300 cursor-default"
                  }`}
                >
                  Save
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-10 mt-14 mb-10 border-b border-gray-100">
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
            {currentProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {currentProducts.map((product, index) => {
                  const isEnded = product.timeLeft === "경매 종료";
                  return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative"
                  >
                    <div>
                      <ProductCard product={product} />
                    </div>
                    {isEnded && (
                      <div className="absolute top-0 left-0 right-0 aspect-square rounded-sm overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-black text-white drop-shadow-md">
                            {activeTab === "products" ? "SOLD" : "ENDED"}
                          </span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-300 uppercase">No items yet</p>
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
