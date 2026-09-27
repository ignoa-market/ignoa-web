import { Heart, Eye } from "lucide-react";
import { Link } from "react-router";
import { memo, useState } from "react";
import type { MouseEvent } from "react";
import { motion } from "motion/react";
import { useWishToggle } from "@/hooks/useWishToggle";
import type { ItemStatus } from "@/types/api";
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
  };
  onExtendAuction?: (itemId: number) => Promise<void>;
}

function resolveOverlay(status?: ItemStatus, isEnded?: boolean): "SOLD" | "ENDED" | null {
  if (status === "BID_CLOSED" || status === "BUY_NOW_CLOSED") return "SOLD";
  if (status === "NO_BID_CLOSED") return "ENDED";
  if (isEnded) return "ENDED";
  return null;
}

export const ProductCard = memo(function ProductCard({ product, onExtendAuction }: ProductCardProps) {
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

  const openExtendDialog = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onExtendAuction || isExtending) return;

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
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
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
          <span className="text-[11px] text-gray-600 font-medium leading-none">{wishCount}</span>
        </motion.button>
      </div>

      {/* Info */}
      <div className="relative space-y-0.5 px-0.5">
        {(brand || size) && (
          <div className="flex items-center justify-between gap-2">
            {brand && (
              <p className="text-[11px] font-bold text-black uppercase tracking-wide truncate">
                {brand}
              </p>
            )}
            {size && (
              <span className="text-[10px] font-medium text-gray-400 flex-shrink-0 ml-auto">{size}</span>
            )}
          </div>
        )}

        <h3 className="text-xs text-gray-500 line-clamp-1">{title}</h3>

        <p className="text-sm font-bold text-black pt-0.5">
          {currentPrice.toLocaleString()}원
        </p>

        <div className="flex items-center gap-2.5 text-gray-400 pt-0.5">
          {viewCount !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span className="text-[10px]">{viewCount}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Heart className={`w-3 h-3 ${wished ? "fill-rose-400 text-rose-400" : "text-gray-400"}`} />
            <span className="text-[10px]">{wishCount}</span>
          </div>
        </div>

        {onExtendAuction && (
          <button
            type="button"
            onClick={openExtendDialog}
            disabled={isExtending}
            className="absolute right-1 top-0 h-7 px-3 rounded-full border border-gray-200 bg-white text-[11px] font-semibold text-gray-500 transition-colors hover:border-gray-400 hover:text-black disabled:cursor-wait disabled:opacity-50"
          >
            {isExtending ? "연장 중" : "연장"}
          </button>
        )}
      </div>
      </Link>

      <AlertDialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <AlertDialogContent className="rounded-2xl p-8 sm:max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>경매 마감 연장</AlertDialogTitle>
            <AlertDialogDescription>
              경매 마감을 1일 연장하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full" disabled={isExtending}>취소</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full border border-gray-200 bg-white text-gray-500 hover:bg-black hover:text-white"
              onClick={handleExtendAuction}
              disabled={isExtending}
            >
              {isExtending ? "연장 중..." : "연장"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
});
