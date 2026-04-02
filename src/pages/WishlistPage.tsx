import { ProductCard } from "@/components/common/ProductCard";

const mockWishlistProducts = [
  {
    id: "301",
    title: "Nike Air Force 1 White",
    brand: "NIKE",
    currentPrice: 89,
    size: "10",
    imageUrl: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=800&q=80",
    timeLeft: "5h 20m",
    wishCount: 45,
    location: "Seoul",
  },
];

export function WishlistPage() {
  return (
    <div className="min-h-screen bg-white pt-[60px] sm:pt-[64px]">
      <div className="max-w-[1400px] mx-auto px-6 py-8 sm:py-12">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black mb-2">Wishlist</h1>
          <p className="text-gray-600">Items you've saved</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
          {mockWishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
