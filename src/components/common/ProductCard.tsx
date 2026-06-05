import { Heart, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { motion } from "motion/react";
import { wishApi } from "@/api/item";
import { useAuth } from "@/context/AuthContext";
import { wishStore } from "@/store/wishStore";

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
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { id, title, brand, currentPrice, size, imageUrl, viewCount } = product;
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const numericId = Number(id);
  const [wished, setWished] = useState(
    () => wishStore.isWished(numericId) || (product.isWished ?? false)
  );
  const [wishCount, setWishCount] = useState(product.wishCount ?? 0);

  const handleWishToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const prevWished = wished;
    const prevCount = wishCount;
    setWished(!prevWished);
    setWishCount(prevWished ? prevCount - 1 : prevCount + 1);
    if (!prevWished) {
      wishStore.add(numericId);
    } else {
      wishStore.remove(numericId);
    }
    try {
      if (prevWished) {
        await wishApi.removeWish(numericId);
      } else {
        await wishApi.addWish(numericId);
      }
    } catch {
      setWished(prevWished);
      setWishCount(prevCount);
      if (prevWished) {
        wishStore.add(numericId);
      } else {
        wishStore.remove(numericId);
      }
    }
  };

  return (
    <Link to={`/app/products/${id}`} className="group block cursor-pointer">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100 rounded-sm mb-2.5">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
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
      <div className="space-y-0.5 px-0.5">
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
      </div>
    </Link>
  );
}
