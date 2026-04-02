import { useState } from "react";
import { useNavigate } from "react-router";
import { Upload, X, Calendar, Clock, Image as ImageIcon, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const categories = [
  "아우터",
  "상의",
  "하의",
  "신발",
  "가방",
  "액세서리",
  "시계",
  "모자",
  "기타"
];

const conditions = [
  { value: "new", label: "새 상품 (미사용)" },
  { value: "like-new", label: "거의 새것 (사용감 없음)" },
  { value: "excellent", label: "최상 (미세한 사용감)" },
  { value: "good", label: "좋음 (눈에 띄는 사용감)" },
  { value: "fair", label: "보통 (많은 사용감)" }
];

export function ProductRegistrationPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [size, setSize] = useState("");
  const [description, setDescription] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [location, setLocation] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [quickDuration, setQuickDuration] = useState<string>("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages((prev) => [...prev, e.target!.result as string]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("상품이 등록되었습니다!");
    navigate("/");
  };

  const handleSaveDraft = () => {
    toast.success("임시저장되었습니다.");
  };

  const handleQuickDuration = (days: number) => {
    const now = new Date();
    now.setDate(now.getDate() + days);

    // Set to 21:00 (9 PM) for the selected date
    const endDateTime = new Date(now);
    endDateTime.setHours(21, 0, 0, 0);

    const dateStr = endDateTime.toISOString().split('T')[0];
    const timeStr = "21:00";

    setEndDate(dateStr);
    setEndTime(timeStr);
    setQuickDuration(days.toString());
  };

  const handleCustomDateTime = () => {
    setQuickDuration("custom");
  };

  const getEndDateTime = () => {
    if (!endDate || !endTime) return null;
    return new Date(endDate + 'T' + endTime);
  };

  const getRemainingTime = () => {
    const endDateTime = getEndDateTime();
    if (!endDateTime) return null;

    const now = new Date();
    const diff = endDateTime.getTime() - now.getTime();

    if (diff <= 0) return "마감 시간이 현재보다 과거입니다";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `약 ${days}일 ${hours}시간 후`;
    } else {
      return `약 ${hours}시간 후`;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 pb-24">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">상품 등록</h1>
          <p className="text-gray-600">경매에 올릴 상품 정보를 입력해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Label className="text-lg font-semibold text-black flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-black" />
                  상품 이미지
                </Label>
                <p className="text-sm text-gray-500 mt-1">최대 10장까지 업로드 가능</p>
              </div>
              {images.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span className="font-medium text-gray-700">{images.length}/10</span>
                </div>
              )}
            </div>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`mt-4 border-2 border-dashed rounded-lg p-8 sm:p-12 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-black bg-gray-50 scale-[1.02]"
                  : images.length > 0
                  ? "border-gray-300 bg-gray-50 hover:border-black"
                  : "border-gray-300 bg-gray-50 hover:border-black"
              }`}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <div className={`transition-all ${isDragging ? "scale-110" : ""}`}>
                <Upload className="w-12 h-12 sm:w-14 sm:h-14 text-black mx-auto mb-4" />
                <p className="text-black font-semibold mb-2 text-base sm:text-lg">
                  {images.length > 0 ? "더 많은 사진 추가하기" : "사진을 드래그하거나 클릭하세요"}
                </p>
                <p className="text-sm text-gray-500">
                  JPG, PNG, GIF 또는 동영상 (최대 50MB)
                </p>
              </div>
              <input
                id="file-input"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>

            {/* Enhanced Thumbnail Preview */}
            {images.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  업로드된 이미지 ({images.length}개)
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-black transition-all"
                    >
                      {idx === 0 && (
                        <div className="absolute top-2 left-2 z-10 bg-black text-white text-xs font-bold px-2 py-1 rounded">
                          대표
                        </div>
                      )}
                      <img
                        src={img}
                        alt={`상품 이미지 ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(idx);
                          }}
                          className="opacity-0 group-hover:opacity-100 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all transform hover:scale-110"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Basic Information Section */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 space-y-5">
            <h3 className="text-lg font-semibold text-black mb-4">기본 정보</h3>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-black mb-2 block">
                상품 제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="예) Rick Owens Vintage Leather Jacket"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 text-base focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                {title.length}/50자
              </p>
            </div>

            {/* Brand */}
            <div>
              <Label htmlFor="brand" className="text-sm font-semibold text-black mb-2 block">
                브랜드 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="brand"
                placeholder="예) Rick Owens"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="h-12 text-base focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                required
              />
            </div>

            {/* Category and Condition Grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Category */}
              <div>
                <Label htmlFor="category" className="text-sm font-semibold text-black mb-2 block">
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-black border-gray-300">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="text-base">
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Condition */}
              <div>
                <Label htmlFor="condition" className="text-sm font-semibold text-black mb-2 block">
                  상태 <span className="text-red-500">*</span>
                </Label>
                <Select value={condition} onValueChange={setCondition} required>
                  <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-black border-gray-300">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {conditions.map((cond) => (
                      <SelectItem key={cond.value} value={cond.value} className="text-base">
                        {cond.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Size and Location Grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Size */}
              <div>
                <Label htmlFor="size" className="text-sm font-semibold text-black mb-2 block">
                  사이즈
                </Label>
                <Input
                  id="size"
                  placeholder="예) M, L, 270 등"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="h-12 text-base focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                />
              </div>

              {/* Location */}
              <div>
                <Label htmlFor="location" className="text-sm font-semibold text-black mb-2 block">
                  지역
                </Label>
                <Input
                  id="location"
                  placeholder="예) 서울 강남구"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-12 text-base focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200">
            <Label htmlFor="description" className="text-lg font-semibold text-black mb-2 block">
              상품 설명 <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-4">
              상품의 상태, 구매 시기, 사용감 등을 자세히 작성해주세요
            </p>
            <Textarea
              id="description"
              placeholder={`릭오웬스 정품 빈티지 레더 자켓입니다.\n\n상세 정보:\n- 사이즈: Large\n- 색상: 블랙\n- 소재: 100% 램스킨 가죽\n- 상태: 최상, 미세한 사용감만 있음\n- 연도: 2018 컬렉션\n\n실측:\n- 어깨: 46cm\n- 가슴: 56cm\n- 총장: 66cm\n- 소매: 64cm\n\n비흡연, 반려동물 없는 환경에서 보관했습니다.`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[250px] text-base focus-visible:ring-2 focus-visible:ring-black border-gray-300 resize-none"
              required
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                {description.length}/1000자
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Info className="w-3 h-3" />
                <span>자세한 설명일수록 입찰 확률이 높아집니다</span>
              </div>
            </div>
          </div>

          {/* Auction Settings Section */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 space-y-5">
            <h3 className="text-lg font-semibold text-black mb-4">경매 설정</h3>

            {/* Price Grid */}
            <div className="grid sm:grid-cols-2 gap-5">
              {/* Start Price */}
              <div>
                <Label htmlFor="startPrice" className="text-sm font-semibold text-black mb-2 block">
                  시작가 <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-base">
                    ₩
                  </span>
                  <Input
                    id="startPrice"
                    type="text"
                    placeholder="500,000"
                    value={startPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setStartPrice(value ? parseInt(value).toLocaleString() : "");
                    }}
                    className="pl-9 h-12 text-base font-semibold focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  입찰 시작 금액
                </p>
              </div>

              {/* Buy Now Price */}
              <div>
                <Label htmlFor="buyNowPrice" className="text-sm font-semibold text-black mb-2 block">
                  즉시 구매가
                </Label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-base">
                    ₩
                  </span>
                  <Input
                    id="buyNowPrice"
                    type="text"
                    placeholder="1,200,000"
                    value={buyNowPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setBuyNowPrice(value ? parseInt(value).toLocaleString() : "");
                    }}
                    className="pl-9 h-12 text-base font-semibold focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  즉시 구매 가능 금액 (선택)
                </p>
              </div>
            </div>

            {/* End Date & Time */}
            <div>
              <Label className="text-sm font-semibold text-black mb-3 block">
                경매 마감 시간 <span className="text-red-500">*</span>
              </Label>

              {/* Quick Selection Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleQuickDuration(1)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    quickDuration === "1"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  1일 후
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDuration(3)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    quickDuration === "3"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  3일 후
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDuration(7)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    quickDuration === "7"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  7일 후
                </button>
                <button
                  type="button"
                  onClick={handleCustomDateTime}
                  className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    quickDuration === "custom"
                      ? "border-black bg-black text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                  }`}
                >
                  직접 선택
                </button>
              </div>

              {/* Date & Time Inputs - Only show when custom is selected */}
              {quickDuration === "custom" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="pl-11 h-12 text-base focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">종료 날짜</p>
                  </div>
                  <div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                      <Input
                        id="endTime"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="pl-11 h-12 text-base focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">종료 시각</p>
                  </div>
                </div>
              )}

              {/* Preview of selected date */}
              {endDate && endTime && (
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-black">
                          경매 마감 시간
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(endDate + 'T' + endTime).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            weekday: 'short'
                          })}
                        </p>
                      </div>
                    </div>
                    {getRemainingTime() && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500 mb-1">남은 시간</p>
                        <p className="text-sm font-semibold text-black">
                          {getRemainingTime()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons - Mobile */}
          <div className="md:hidden flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="flex-1 h-12 border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              임시저장
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 bg-black hover:bg-gray-800 text-white font-semibold shadow-sm rounded-lg"
            >
              등록하기
            </Button>
          </div>
        </form>
      </div>

      {/* Sticky Bottom Bar - Desktop */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-[800px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>모든 필수 항목을 입력해주세요</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              className="border-gray-300 hover:bg-gray-50 rounded-lg"
            >
              임시저장
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-black hover:bg-gray-800 text-white px-8 h-11 font-semibold shadow-sm rounded-lg"
            >
              등록하기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
