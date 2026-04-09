import { Heart } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    brand?: string;
    currentPrice: number;
    size?: string;
    imageUrl: string;
    timeLeft?: string;
    wishCount?: number;
    location?: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [wished, setWished] = useState(false);
  const { id, title, brand, currentPrice, size, imageUrl, wishCount } = product;

  return (
    <div className="group bg-white overflow-hidden transition-all relative cursor-pointer">
      <Link to={`/app/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-white mb-2 rounded-sm transition-shadow duration-300 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.08)]">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>

        <div className="space-y-1 transition-transform duration-300 group-hover:-translate-y-0.5">
          {brand && (
            <p className="text-[10px] font-bold text-black uppercase tracking-wide line-clamp-1">
              {brand}
            </p>
          )}
          <h3 className="text-xs text-gray-700 line-clamp-1 font-normal">
            {title}
          </h3>

          <div className="pt-0.5">
            <p className="text-sm font-bold text-black mb-1">
              {currentPrice.toLocaleString()}원
            </p>

            <div className="flex items-center gap-1 text-gray-500">
              <Heart className="w-3 h-3" />
              <span className="text-[10px]">{wishCount || 0}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
