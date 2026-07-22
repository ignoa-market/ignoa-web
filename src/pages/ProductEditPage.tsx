import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Upload, X, Clock3 } from "lucide-react";
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
import { itemApi } from "@/api/item";
import type { ItemCondition } from "@/types/api";

const categories = ["아우터", "상의", "하의", "신발", "가방", "액세서리", "시계", "모자", "기타"];
const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

const conditions: { value: ItemCondition; label: string }[] = [
  { value: "NEW", label: "새 상품 (미사용)" },
  { value: "LIKE_NEW", label: "거의 새것 (사용감 없음)" },
  { value: "GOOD", label: "좋음 (사용감 있음)" },
  { value: "FAIR", label: "보통 (많은 사용감)" },
];

export function ProductEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [extending, setExtending] = useState(false);

  // 기존 데이터
  const [existingImages, setExistingImages] = useState<{ item_media_id: number; url: string }[]>([]);
  const [deletedMediaIds, setDeletedMediaIds] = useState<number[]>([]);
  const [startPrice, setStartPrice] = useState(0);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [endAt, setEndAt] = useState("");
  const [extensionCount, setExtensionCount] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);

  // 수정 가능한 필드
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState<ItemCondition | "">("");
  const [description, setDescription] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");

  // 새로 추가할 이미지
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!id) return;
    itemApi
      .getItem(Number(id))
      .then((data) => {
        if (!data.is_seller) {
          toast.error("본인 상품만 수정할 수 있습니다.");
          navigate(`/app/products/${id}`, { replace: true });
          return;
        }
        setTitle(data.title);
        setBrand(data.brand ?? "");
        setCategory(data.category);
        setCondition(data.item_condition);
        setDescription(data.description);
        setBuyNowPrice(data.buy_now_price?.toLocaleString() ?? "");
        setStartPrice(data.start_price);
        setCurrentPrice(data.current_price);
        setEndAt(data.end_at.slice(0, 16));
        setIsActive(data.status === "ACTIVE" && new Date(data.end_at).getTime() > Date.now());
        setExistingImages(data.media_urls);
      })
      .catch(() => toast.error("상품 정보를 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter((file) => {
      if (SUPPORTED_IMAGE_TYPES.has(file.type)) return true;
      toast.error(`${file.name} — JPEG, PNG, GIF, WEBP 파일만 업로드할 수 있습니다.`);
      return false;
    });

    const previews = await Promise.all(
      validFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target!.result as string);
            reader.readAsDataURL(file);
          })
      )
    );

    setNewPreviews((prev) => [...prev, ...previews]);
    setNewFiles((prev) => [...prev, ...validFiles]);
  };

  const removeExistingImage = (id: number) => {
    setExistingImages((prev) => prev.filter((img) => img.item_media_id !== id));
    setDeletedMediaIds((prev) => [...prev, id]);
  };

  const removeNewImage = (index: number) => {
    setNewPreviews((prev) => prev.filter((_, i) => i !== index));
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const hasBid = currentPrice > startPrice;

  const handleExtendAuction = async () => {
    if (!id || extending || !isActive) return;
    if (!window.confirm("경매 마감을 1일 연장하시겠습니까?\n마감 연장은 최대 3회까지 가능합니다.")) return;

    setExtending(true);
    try {
      const result = await itemApi.extendAuction(Number(id));
      setEndAt(result.end_at.slice(0, 16));
      setExtensionCount(result.extension_count);
      toast.success("경매 마감이 1일 연장되었습니다.");
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? "경매 마감 연장에 실패했습니다.");
    } finally {
      setExtending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive) {
      toast.error("진행 중인 경매만 수정할 수 있습니다.");
      return;
    }
    if (!condition) {
      toast.error("상품 상태를 선택해주세요.");
      return;
    }

    const buyNowPriceNum = buyNowPrice
      ? parseInt(buyNowPrice.replace(/,/g, ""), 10)
      : undefined;

    if (!hasBid && buyNowPriceNum !== undefined && buyNowPriceNum <= currentPrice) {
      toast.error(`즉시 구매가는 현재 입찰가(${currentPrice.toLocaleString()}원)보다 높아야 합니다.`);
      return;
    }

    setSubmitting(true);
    try {
      await itemApi.updateItem(
        Number(id),
        {
          title,
          description,
          category,
          brand,
          item_condition: condition,
          buy_now_price: hasBid ? undefined : buyNowPriceNum,
          delete_media_ids: deletedMediaIds.length > 0 ? deletedMediaIds : undefined,
        },
        newFiles
      );
      toast.success("상품이 수정되었습니다!");
      navigate(`/app/products/${id}`);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error?.message ?? "상품 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-[196px] pb-24">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-5">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-1">상품 수정</h1>
          <p className="text-gray-600">수정할 항목만 변경해주세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이미지 */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200">
            <Label className="text-sm font-semibold text-black mb-4 block">
              상품 이미지
              <span className="text-xs text-gray-400 font-normal ml-2">
                {existingImages.length + newPreviews.length}장
              </span>
            </Label>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {/* 기존 이미지 */}
              {existingImages.map((img, idx) => (
                <div
                  key={img.item_media_id}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-gray-200 hover:border-red-300 transition-all"
                >
                  {idx === 0 && (
                    <div className="absolute top-1.5 left-1.5 z-10 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      대표
                    </div>
                  )}
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.item_media_id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* 새로 추가한 이미지 */}
              {newPreviews.map((img, idx) => (
                <div
                  key={`new-${idx}`}
                  className="relative group aspect-square rounded-lg overflow-hidden border-2 border-dashed border-stone-400"
                >
                  <div className="absolute top-1.5 left-1.5 z-10 bg-stone-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                    NEW
                  </div>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeNewImage(idx); }}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {/* 추가 버튼 */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("edit-file-input")?.click()}
                className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-black bg-gray-100 scale-[1.03]"
                    : "border-gray-300 bg-gray-50 hover:border-black hover:bg-gray-100"
                }`}
              >
                <Upload className="w-5 h-5 text-gray-400 mb-1" />
                <span className="text-[11px] text-gray-400 font-medium">추가</span>
                <input
                  id="edit-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 space-y-5">
            {/* 브랜드 · 카테고리 · 상태 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  브랜드 <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="예) Our Legacy"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="text-sm focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                  required
                />
              </div>
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  카테고리 <span className="text-red-500">*</span>
                </Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="text-sm focus:ring-2 focus:ring-black border-gray-300">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  상태 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={condition}
                  onValueChange={(v) => setCondition(v as ItemCondition)}
                  required
                >
                  <SelectTrigger className="text-sm focus:ring-2 focus:ring-black border-gray-300">
                    <SelectValue placeholder="선택" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom">
                    {conditions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 제목 */}
            <div>
              <Label className="text-sm font-semibold text-black mb-2 block">
                상품 제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="예) Rick Owens Vintage Leather Jacket"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 text-sm focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5 text-right">{title.length}/50</p>
            </div>

            {/* 설명 */}
            <div>
              <Label className="text-sm font-semibold text-black mb-2 block">
                상품 설명 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                placeholder="상품 상태, 구매 시기, 사용감 등을 작성해주세요."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[160px] text-sm focus-visible:ring-2 focus-visible:ring-black border-gray-300 resize-none"
                required
              />
              <p className="text-xs text-gray-400 mt-1.5 text-right">{description.length}/1000</p>
            </div>
          </div>

          {/* 가격 정보 */}
          <div className="bg-white rounded-lg p-6 sm:p-8 border border-gray-200 space-y-5">
            {/* 시작가 (읽기 전용) + 즉시구매가 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  시작가 <span className="text-xs text-gray-400 font-normal">(변경 불가)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₩</span>
                  <Input
                    value={startPrice.toLocaleString()}
                    readOnly
                    className="pl-8 h-11 text-sm font-semibold border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-black mb-2 block">
                  즉시 구매가
                  {hasBid ? (
                    <span className="text-xs text-red-500 font-normal ml-1">
                      (입찰 이후 변경 불가)
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 font-normal ml-1">
                      (현재 입찰가 {currentPrice.toLocaleString()}원보다 높게 설정해주세요)
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₩</span>
                  <Input
                    type="text"
                    placeholder="변경할 경우 입력"
                    value={buyNowPrice}
                    readOnly={hasBid}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9]/g, "");
                      setBuyNowPrice(v ? parseInt(v).toLocaleString() : "");
                    }}
                    className={`pl-8 h-11 text-sm ${
                      hasBid
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        : "focus-visible:ring-2 focus-visible:ring-black border-gray-300"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 마감 시간 */}
            <div>
              <Label className="text-sm font-semibold text-black mb-3 block">경매 마감</Label>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock3 className="w-4 h-4 text-gray-500" />
                  <span>
                    {endAt
                      ? new Date(endAt).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          weekday: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "마감 시간 확인 불가"}
                  </span>
                  {extensionCount !== null && (
                    <span className="text-xs text-gray-400">({extensionCount}/3회 연장)</span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExtendAuction}
                  disabled={!isActive || extending || extensionCount === 3}
                  className="shrink-0 border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                >
                  {extending ? "연장 중..." : "마감 1일 연장"}
                </Button>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                마감 시간은 직접 수정할 수 없으며, 진행 중인 경매에 한해 최대 3회 연장할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Mobile submit */}
          <div className="md:hidden pt-2 flex gap-3">
            <Button
              type="button"
              onClick={() => navigate(`/app/products/${id}`)}
              variant="outline"
              className="flex-1 h-12 font-semibold rounded-lg"
            >
              취소하기
            </Button>
            <Button
              type="submit"
              disabled={!isActive || submitting}
              className="flex-1 h-12 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg disabled:opacity-50"
            >
              {submitting ? "저장 중..." : "수정 완료"}
            </Button>
          </div>
        </form>
      </div>

      {/* Desktop sticky bottom */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="max-w-[800px] mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-400">변경된 항목만 반영됩니다</p>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate(`/app/products/${id}`)}
              variant="outline"
              className="px-6 h-11 font-semibold rounded-lg"
            >
              취소하기
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isActive || submitting}
              className="bg-black hover:bg-gray-800 text-white px-8 h-11 font-semibold rounded-lg disabled:opacity-50"
            >
              {submitting ? "저장 중..." : "수정 완료"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
