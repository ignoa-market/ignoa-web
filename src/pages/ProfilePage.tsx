import { useState, useEffect } from "react";
import { Mail, User, MapPin, Camera, Search, X } from "lucide-react";
import { ProductCard } from "@/components/common/ProductCard";
import { AddressModal } from "@/components/common/AddressModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { userApi } from "@/api/auth";
import type { ApiError } from "@/types/api";


export function ProfilePage() {
  const [activeTab, setActiveTab] = useState("products");
  const [isEditing, setIsEditing] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState<"followers" | "following" | null>(null);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [address, setAddress] = useState("");
  const [savedName, setSavedName] = useState("");
  const [savedAddr, setSavedAddr] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  const isDirty = userName !== savedName || address !== savedAddr;

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

  const myProducts: { id: string; title: string; currentPrice: number; imageUrl: string; timeLeft: string; wishCount: number }[] = [];
  const biddingProducts = myProducts;
  const wishlistProducts = myProducts;
  const followers: { id: string; name: string }[] = [];
  const following: { id: string; name: string }[] = [];

  const tabs = [
    { id: "products", label: "Selling",  count: myProducts.length },
    { id: "bidding",  label: "Bidding",  count: biddingProducts.length },
    { id: "wishlist", label: "Wishlist", count: wishlistProducts.length },
  ];

  const currentProducts =
    activeTab === "products" ? myProducts :
    activeTab === "bidding"  ? biddingProducts :
    wishlistProducts;

  const followList = showFollowModal === "followers" ? followers : following;

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
              {profileImage && (
                <button
                  type="button"
                  onClick={handleImageDelete}
                  className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black flex items-center justify-center hover:bg-gray-700 transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              )}
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
              <p className="text-4xl font-black text-black leading-none">{myProducts.length}</p>
            </div>
            <button onClick={() => setShowFollowModal("followers")} className="text-left hover:opacity-60 transition-opacity">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-1">Followers</p>
              <p className="text-4xl font-black text-black leading-none">{followers.length}</p>
            </button>
            <button onClick={() => setShowFollowModal("following")} className="text-left hover:opacity-60 transition-opacity">
              <p className="text-[11px] font-semibold tracking-[0.3em] text-gray-400 uppercase mb-1">Following</p>
              <p className="text-4xl font-black text-black leading-none">{following.length}</p>
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
