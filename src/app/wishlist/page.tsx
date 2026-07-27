"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowRight, ShoppingBag, Sparkles, Star } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  getLocalWishlist,
  toggleWishlistUniversal,
  UniversalWishlistItem,
} from "@/lib/wishlistHelper";
import { addToCartUniversal } from "@/lib/cartHelper";
import { useRouter } from "next/navigation";

export default function WishlistPage() {
  const router = useRouter();
  const [wishlistItems, setWishlistItems] = useState<UniversalWishlistItem[]>([]);

  useEffect(() => {
    const load = () => setWishlistItems(getLocalWishlist());
    load();
    window.addEventListener("wishlist_updated", load);
    return () => window.removeEventListener("wishlist_updated", load);
  }, []);

  const handleRemove = async (product: UniversalWishlistItem) => {
    const { items } = await toggleWishlistUniversal(product);
    setWishlistItems(items);
  };

  const handleAddToCart = async (product: UniversalWishlistItem) => {
    await addToCartUniversal(
      {
        _id: product._id,
        title: product.title,
        price: product.price,
        images: product.images,
        category: product.category,
      },
      1
    );
    alert("Moved to cart!");
    router.push("/cart");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <div>
            <Badge className="bg-rose-500/10 text-rose-500 border-none px-3 py-1 font-bold text-xs uppercase mb-2">
              <Sparkles className="h-3 w-3 mr-1" /> Artisan Wishlist
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Saved Greeting Cards</h1>
          </div>
          {wishlistItems.length > 0 && (
            <span className="text-sm font-semibold text-muted-foreground">
              {wishlistItems.length} {wishlistItems.length === 1 ? "Card" : "Cards"} Saved
            </span>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border/80 rounded-3xl bg-card max-w-lg mx-auto space-y-6 shadow-xs">
            <div className="mx-auto w-16 h-16 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 fill-rose-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">Your wishlist is empty</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Save your favorite handcrafted greeting card designs while browsing the studio catalogue!
              </p>
            </div>
            <Link href="/products" className="inline-block">
              <Button size="lg" className="font-bold px-8 shadow-md shadow-primary/20 cursor-pointer">
                Browse Catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <Card
                key={item._id}
                className="group overflow-hidden border border-border/80 hover:border-primary/50 rounded-2xl bg-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-muted/40 overflow-hidden relative">
                    <img
                      src={item.images?.[0] || "/product1.jpg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/product1.jpg";
                      }}
                    />
                    <Badge className="absolute top-3 left-3 bg-background/95 backdrop-blur-md text-foreground border border-border/80 font-bold text-[11px] uppercase tracking-wider shadow-xs">
                      {item.category}
                    </Badge>
                    <button
                      onClick={() => handleRemove(item)}
                      className="absolute top-3 right-3 bg-background/90 hover:bg-rose-500 hover:text-white text-rose-500 rounded-full p-2 shadow-md transition-colors cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <CardContent className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors truncate">
                        {item.title}
                      </h3>
                      <span className="font-black text-lg text-primary whitespace-nowrap">₹{item.price}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-border/60">
                      <span className="text-muted-foreground font-medium">300 GSM Textured Paper</span>
                      <span className="font-bold text-amber-500 flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-500" /> 4.9
                      </span>
                    </div>
                  </CardContent>
                </div>

                <div className="p-5 pt-0 flex gap-2">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    className="w-full font-bold h-10 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    size="sm"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Move to Cart</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
