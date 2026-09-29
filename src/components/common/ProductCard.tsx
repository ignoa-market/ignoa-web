import { Heart, Eye } from "lucide-react";
import { Link } from "react-router";
import { memo, useState } from "react";
import type { MouseEvent } from "react";
import { motion } from "motion/react";
import { useWishToggle } from "@/hooks/useWishToggle";
import { ImageWithFallback } from "@/components/common/ImageWithFallback";
import type { ItemStatus } from "@/types/api";
import { MAX_AUCTION_EXTENSION_COUNT } from "@/constants/auction";
import {
  ACTION_MODAL_ACTION_CLASS,
  ACTION_MODAL_CANCEL_CLASS,
  ACTION_MODAL_FOOTER_CLASS,
  ACTION_MODAL_TITLE_CLASS,
} from "@/constants/actionModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    brand?: string;
    currentPrice: number;
    size?: string;
    imageUrl: string;
    wishCount?: number;
    viewCount?: number;
    isWished?: boolean;
    status?: ItemStatus;
    isEnded?: boolean;
    endAt?: string;
    extensionCount?: number;
  };
  onExtendAuction?: (itemId: number) => Promise<void>;
  compactTypography?: boolean;
  imageLoading?: "eager" | "lazy";
}

function resolveOverlay(status?: ItemStatus, isEnded?: boolean): "SOLD" | "ENDED" | null {
  if (status === "BID_CLOSED" || status === "BUY_NOW_CLOSED") return "SOLD";
  if (status === "NO_BID_CLOSED") return "ENDED";
  if (isEnded) return "ENDED";
  return null;
}

export const ProductCard = memo(function ProductCard({
  product,
  onExtendAuction,
  compactTypography = false,
  imageLoading = "lazy",
}: ProductCardProps) {
  const { id, title, brand, currentPrice, size, imageUrl, viewCount } = product;
  const overlay = resolveOverlay(product.status, product.isEnded);
  const numericId = Number(id);
  const { wished, wishCount, toggle: handleWishToggle } = useWishToggle(
    numericId,
    product.isWished ?? false,
    product.wishCount ?? 0
  );
  const [isExtending, setIsExtending] = useState(false);
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const remainingExtensionCount = product.extensionCount === undefined
    ? null
    : Math.max(0, MAX_AUCTION_EXTENSION_COUNT - product.extensionCount);
  const isExtensionLimitReached = remainingExtensionCount === 0;
  const extendedEndAt = product.endAt
    ? new Date(new Date(product.endAt).getTime() + 24 * 60 * 60 * 1000)
    : null;
  const formatEndAt = (value: string | Date) => new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));

  const openExtendDialog = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onExtendAuction || isExtending || isExtensionLimitReached) return;

    setIsExtendDialogOpen(true);
  };

  const handleExtendAuction = async () => {
    if (!onExtendAuction || isExtending) return;

    setIsExtending(true);
    try {
      await onExtendAuction(numericId);
    } finally {
      setIsExtending(false);
      setIsExtendDialogOpen(false);
    }
  };

  return (
    <>
      <Link to={`/app/products/${id}`} className="group relative block cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-lg mb-2.5">
        <ImageWithFallback
          src={imageUrl}
          alt={title}
          loading={imageLoading}
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {overlay && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
            <span className="text-2xl text-white drop-shadow-md" style={{ fontWeight: 750 }}>{overlay}</span>
          </div>
        )}
        <motion.button
          onClick={handleWishToggle}
          whileTap={{ scale: 0.82 }}
          className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-sm hover:bg-white transition-colors z-10"
        >
          <motion.span
            key={String(wished)}
            initial={{ scale: 0.55 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 450, damping: 14 }}
            className="flex items-center leading-none"
          >
            <Heart
              className={`w-3 h-3 ${
                wished ? "fill-rose-400 text-rose-400" : "text-gray-400"
              }`}
            />
          </motion.span>
          <span className={`${compactTypography ? "text-[11px]" : "text-xs"} font-medium leading-none text-gray-600`}>{wishCount}</span>
        </motion.button>
      </div>

      {/* Info */}
      <div className="space-y-0.5 px-0.5">
        {(compactTypography || brand || size || onExtendAuction) && (
          <div className={`flex items-center gap-2 ${compactTypography ? "min-h-7" : ""}`}>
            {brand && (
              <p className={`${compactTypography ? "text-xs" : "text-[13px]"} truncate font-bold uppercase tracking-wide text-black`}>
                {brand}
              </p>
            )}
            {size && (
              <span className={`${compactTypography ? "text-[10px]" : "text-[11px]"} ml-auto flex-shrink-0 font-medium text-gray-400`}>{size}</span>
            )}
            {onExtendAuction && (
              <button
                type="button"
                onClick={openExtendDialog}
                disabled={isExtending || isExtensionLimitReached}
                className="ml-auto h-7 flex-shrink-0 rounded-full border border-gray-200 bg-white px-3 text-[11px] font-semibold text-gray-500 transition-colors hover:border-gray-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isExtending ? "연장 중" : isExtensionLimitReached ? "연장 완료" : "연장"}
              </button>
            )}
          </div>
        )}

        <h3 className={`${compactTypography ? "text-xs" : "text-[13px]"} line-clamp-1 text-gray-500`}>{title}</h3>

        <p className={`${compactTypography ? "text-sm" : "text-base"} pt-0.5 font-bold text-black`}>
          {currentPrice.toLocaleString()}원
        </p>

        <div className="flex items-center gap-2.5 text-gray-400 pt-0.5">
          {viewCount !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span className={compactTypography ? "text-[10px]" : "text-[11px]"}>{viewCount}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Heart className={`w-3 h-3 ${wished ? "fill-rose-400 text-rose-400" : "text-gray-400"}`} />
            <span className={compactTypography ? "text-[10px]" : "text-[11px]"}>{wishCount}</span>
          </div>
        </div>

      </div>
      </Link>

      <AlertDialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <AlertDialogContent
          className="gap-0 rounded-2xl px-7 pb-6 pt-7 sm:max-w-sm"
          style={{ fontFamily: "Pretendard, sans-serif" }}
        >
          <AlertDialogHeader className="gap-0 text-left">
            <AlertDialogTitle className={ACTION_MODAL_TITLE_CLASS}>마감 연장</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-[13px] font-normal leading-5 text-gray-500">
                <p className="mb-5">마감 시간이 1일 연장됩니다.</p>
                {product.endAt && extendedEndAt && (
                  <div className="space-y-2.5 border-y border-gray-100 py-4 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span>현재 마감</span>
                      <span className="text-gray-700">{formatEndAt(product.endAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>변경 마감</span>
                      <span className="font-medium text-black">{formatEndAt(extendedEndAt)}</span>
                    </div>
                  </div>
                )}
                {remainingExtensionCount !== null && remainingExtensionCount > 0 && (
                  <p className="mt-4 text-xs text-gray-500">
                    현재 {remainingExtensionCount}회 연장할 수 있으며, 이번 연장 후 {remainingExtensionCount - 1}회 남습니다.
                  </p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={ACTION_MODAL_FOOTER_CLASS}>
            <AlertDialogCancel className={ACTION_MODAL_CANCEL_CLASS} disabled={isExtending}>취소</AlertDialogCancel>
            <AlertDialogAction
              className={ACTION_MODAL_ACTION_CLASS}
              onClick={handleExtendAuction}
              disabled={isExtending}
            >
              {isExtending ? "연장 중..." : "1일 연장"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
