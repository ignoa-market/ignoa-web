import { useState } from "react";
import { Package, Star, Mail, Phone, User, MapPin, Camera } from "lucide-react";
import { ProductCard } from "@/components/common/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

const mockMyProducts = [
  {
    id: "1",
    title: "MacBook Pro 16인치 M1 2021 실버",
    category: "전자기기",
    currentPrice: 1250000,
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80",
    timeLeft: "2시간 남음",
    wishCount: 24,
    bidderCount: 8,
  },
  {
    id: "2",
    title: "아이패드 에어 5세대 256GB 퍼플",
    category: "전자기기",
    currentPrice: 580000,
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80",
    timeLeft: "45분 남음",
    wishCount: 32,
    bidderCount: 12,
  },
  {
    id: "101",
    title: "소니 WH-1000XM4 헤드폰",
    category: "전자기기",
    currentPrice: 185000,
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzb255JTIwaGVhZHBob25lc3xlbnwxfHx8fDE3NzQ5NTQ1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timeLeft: "경매 종료",
    wishCount: 15,
    bidderCount: 6,
    soldStatus: "판매완료",
  },
  {
    id: "102",
    title: "캐논 EOS M50 미러리스",
    category: "전자기기",
    currentPrice: 420000,
    imageUrl: "https://images.unsplash.com/photo-1613235577937-9ac3eed992fc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW5vbiUyMGNhbWVyYXxlbnwxfHx8fDE3NzQ5NTQ1NzR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timeLeft: "경매 종료",
    wishCount: 28,
    bidderCount: 9,
    soldStatus: "판매완료",
  },
  {
    id: "103",
    title: "LED 스탠드 무드등",
    category: "가구/인테리어",
    currentPrice: 35000,
    imageUrl: "https://images.unsplash.com/photo-1766411503488-f90eef1124bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNrJTIwbGFtcCUyMG1vZGVybnxlbnwxfHx8fDE3NzQ5MTExMDN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timeLeft: "경매 종료",
    wishCount: 8,
    bidderCount: 3,
    soldStatus: "유찰",
  },
];

// 입찰 참여중인 상품 데이터
const mockBiddingProducts = [
  {
    id: "201",
    title: "백팩 여행용 40L",
    category: "패션/잡화",
    currentPrice: 75000,
    imageUrl: "https://images.unsplash.com/photo-1570630358718-4fb324824b3d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFjayUyMHRyYXZlbHxlbnwxfHx8fDE3NzQ5NTQyMDR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timeLeft: "3시간 15분",
    wishCount: 12,
    bidderCount: 5,
    myBid: 75000,
    isWinning: true,
  },
  {
    id: "202",
    title: "게이밍 마우스 RGB",
    category: "전자기기",
    currentPrice: 65000,
    imageUrl: "https://images.unsplash.com/photo-1628832307345-7404b47f1751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjBtb3VzZXxlbnwxfHx8fDE3NzQ5MzI1ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timeLeft: "1시간 40분",
    wishCount: 18,
    bidderCount: 7,
    myBid: 60000,
    isWinning: false,
  },
];

// 찜한 상품 데이터
const mockWishlistProducts = [
  {
    id: "301",
    title: "Nike 에어포스 1 화이트",
    category: "패션/잡화",
    currentPrice: 89000,
    imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80",
    timeLeft: "5시간 20분",
    wishCount: 45,
    bidderCount: 15,
  },
];

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState("products");
  const [userName, setUserName] = useState("짜응잉");
  const [address, setAddress] = useState("대전광역시 유성구 동서대로 125");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // Read-only info
  const email = "user@hanbat.ac.kr";
  const phone = "010-1234-5678";

  const handleSaveProfile = () => {
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
    { id: "products", label: "상품", count: 5 },
    { id: "wishlist", label: "찜", count: 1 },
    { id: "bidding", label: "입찰", count: 2 },
  ];

  const renderContent = () => {
    if (activeTab === "products") {
      return (
        <div>
          {/* Filter Bar */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">전체 <span className="font-semibold text-gray-900">5</span>개</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockMyProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "wishlist") {
      return (
        <div>
          {/* Filter Bar */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">전체 <span className="font-semibold text-gray-900">1</span>개</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockWishlistProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "bidding") {
      return (
        <div>
          {/* Filter Bar */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">전체 <span className="font-semibold text-gray-900">2</span>개</p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mockBiddingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Card - Toss Style */}
        <div className="max-w-[1000px] mx-auto mb-8">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
            {/* Profile Icon */}
            <div className="relative w-24 h-24 mx-auto mb-5 group">
              <input
                type="file"
                id="profileImageInput"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label
                htmlFor="profileImageInput"
                className="cursor-pointer block w-full h-full rounded-full bg-gray-100 overflow-hidden relative"
              >
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-11 h-11 text-gray-500" />
                  </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </label>
            </div>

            {/* User Name */}
            <h2 className="text-2xl font-bold text-gray-900 mb-5 text-center">{userName}</h2>

            {/* Star Rating */}
            <div className="flex items-center justify-center gap-1 mb-10">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              ))}
            </div>

            {/* User Info Edit Form - Horizontal Layout */}
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Left Column - Editable Fields */}
                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <Label htmlFor="userName" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      이름
                    </Label>
                    <Input
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="h-11 border-gray-300 focus-visible:ring-[#6BCF7F] rounded-xl"
                      placeholder="이름을 입력하세요"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      주소
                    </Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="h-11 border-gray-300 focus-visible:ring-[#6BCF7F] rounded-xl"
                      placeholder="주소를 입력하세요"
                    />
                  </div>
                </div>

                {/* Right Column - Read-only Information */}
                <div className="space-y-6">
                  {/* Email - Read Only */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      이메일
                    </Label>
                    <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center">
                      <span className="text-gray-600 text-sm">{email}</span>
                    </div>
                  </div>

                  {/* Phone - Read Only */}
                  <div>
                    <Label className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      전화번호
                    </Label>
                    <div className="h-11 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl flex items-center">
                      <span className="text-gray-600 text-sm">{phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleSaveProfile}
                  className="bg-[#6BCF7F] hover:bg-[#5ABD6D] text-white px-12 h-12 font-semibold rounded-xl shadow-sm"
                >
                  프로필 저장
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-t-2xl border-b shadow-sm">
          <div className="flex items-center justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-8 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#6BCF7F] text-gray-900 font-semibold"
                    : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>{tab.label}</span>
                <span className={activeTab === tab.id ? "text-[#6BCF7F]" : "text-gray-400"}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-2xl p-6 shadow-sm overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
