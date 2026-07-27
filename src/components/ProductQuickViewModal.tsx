"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ShoppingBag, Heart, Check, ShieldCheck, FileText, User, Star, ArrowRight, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { addToCartUniversal } from "@/lib/cartHelper";
import { toggleWishlistUniversal, isInWishlistUniversal } from "@/lib/wishlistHelper";

export interface QuickViewProduct {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock?: number;
  ratingAvg?: number;
  isPersonalizable?: boolean;
}

interface ProductQuickViewModalProps {
  product: QuickViewProduct | null;
  onClose: () => void;
  onAddToCart?: (product: QuickViewProduct) => void;
}

export function ProductQuickViewModal({ product, onClose, onAddToCart }: ProductQuickViewModalProps) {
  const [customNote, setCustomNote] = useState("Happy Celebration! With Love ❤️");
  const [added, setAdded] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  React.useEffect(() => {
    if (product) {
      setWishlisted(isInWishlistUniversal(product._id));
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = async () => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      await addToCartUniversal({
        _id: product._id,
        title: product.title,
        price: product.price,
        images: product.images,
        category: product.category,
        stock: product.stock || 50,
      });
    }
    setAdded(true);
  };

  const handleWishlist = async () => {
    const res = await toggleWishlistUniversal(product);
    setWishlisted(res.wishlisted);
  };

  const studioUrl = `/custom-card?id=${product._id}&title=${encodeURIComponent(product.title)}&price=${product.price}&image=${encodeURIComponent(product.images?.[0] || "/product1.jpg")}`;

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl md:max-w-6xl w-[96vw] p-0 border border-primary/25 shadow-2xl bg-card rounded-3xl overflow-hidden">
        <DialogClose
          onClick={onClose}
          className="absolute right-5 top-5 z-50 bg-background/90 hover:bg-muted p-2 rounded-full shadow-md border border-border/80 transition-transform hover:scale-105 cursor-pointer"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[480px]">
          {/* Left Column - Big Size Artisan Image Display (6 cols on lg) */}
          <div className="lg:col-span-6 bg-muted/30 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/80 relative group">
            <div className="aspect-[4/3] sm:aspect-square w-full max-h-[380px] rounded-2xl overflow-hidden bg-background border border-border/80 shadow-md relative flex items-center justify-center">
              <img
                src={product.images?.[0] || "/product1.jpg"}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/product1.jpg";
                }}
              />
              <Badge className="absolute top-4 left-4 bg-primary/95 backdrop-blur-md text-primary-foreground border-none font-extrabold tracking-wide uppercase text-[11px] px-3.5 py-1.5 shadow-md">
                {product.category}
              </Badge>
            </div>

            {/* Handcrafted Specifications Banner */}
            <div className="mt-4 bg-background/95 backdrop-blur-md rounded-2xl p-3.5 border border-border/80 shadow-sm space-y-1.5 text-xs">
              <div className="font-extrabold text-foreground flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>Handcrafted Artisan Quality Assurance</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-0.5">
                <div><strong className="text-foreground">Paper:</strong> 300 GSM Textured</div>
                <div><strong className="text-foreground">Finish:</strong> Foil & Watercolor</div>
                <div><strong className="text-foreground">Envelope:</strong> Included Free</div>
                <div><strong className="text-foreground">Size:</strong> 5" × 7" Standard</div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Info & Artisan Craftsmanship (6 cols on lg) */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                    <User className="h-3.5 w-3.5 text-primary" />
                    <span>Artisan: Suvetha Muki</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                    {product.title}
                  </h2>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-3xl font-black text-primary block">₹{product.price}</span>
                  <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold mt-1">
                    Ready to Ship
                  </Badge>
                </div>
              </div>

              {/* Rating & Stock bar */}
              <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground border-y border-border/70 py-2.5">
                <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                  <Star className="h-4 w-4 fill-amber-500" />
                  {product.ratingAvg && product.ratingAvg > 0 ? product.ratingAvg.toFixed(1) : "4.9"} (24 Artisan Reviews)
                </span>
                <span>•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Hand-Illustrated Art</span>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                {product.description || "A celebratory handcrafted card featuring layered watercolor textures, gold-embossed greeting seals, and luxury 300 GSM cardstock made by artisan Suvetha Muki."}
              </p>

              {/* Inscription Note Preview Box - Multi-line textarea so text is NEVER cut off */}
              <div className="bg-muted/40 rounded-2xl p-4 border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-extrabold text-foreground">
                  <span className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span>Live Inscription Preview</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">Inside Note</span>
                </div>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Write a custom inside note..."
                  className="w-full text-xs font-serif italic bg-background border border-border/80 text-foreground rounded-xl p-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <span>💡</span> You can also add custom photos & stamps in our Canvas Studio!
                </p>
              </div>
            </div>

            {/* Action Buttons - Fully Responsive Grid with ZERO text wrapping */}
            <div className="space-y-3 pt-3 border-t border-border/80">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAddToCart}
                  className="flex-1 cursor-pointer font-extrabold h-12 px-6 whitespace-nowrap flex items-center justify-center gap-2 text-sm shadow-md transition-all"
                  variant={added ? "secondary" : "default"}
                >
                  {added ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-4 w-4 shrink-0" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleWishlist}
                  variant="outline"
                  className={`flex-1 sm:flex-none cursor-pointer font-bold h-12 px-6 whitespace-nowrap flex items-center justify-center gap-2 text-sm transition-all ${
                    wishlisted
                      ? "text-rose-500 border-rose-500/50 bg-rose-500/10 hover:bg-rose-500/20"
                      : "hover:border-primary/50 text-foreground"
                  }`}
                >
                  <Heart className={`h-4 w-4 shrink-0 ${wishlisted ? "fill-rose-500" : ""}`} />
                  <span>{wishlisted ? "Saved in Wishlist" : "Wishlist"}</span>
                </Button>
              </div>

              {added && (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>✨ Card added to your bag!</span>
                  <Link href="/cart" onClick={onClose} className="underline hover:text-primary flex items-center gap-1">
                    <span>Go to Cart</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )}

              <Link href={studioUrl} className="block w-full" onClick={onClose}>
                <Button className="w-full h-12 bg-gradient-to-r from-pink-500 via-primary to-indigo-600 hover:opacity-95 text-white font-extrabold shadow-lg shadow-primary/25 cursor-pointer flex items-center justify-center gap-2 text-sm transition-all whitespace-nowrap">
                  <Sparkles className="h-4 w-4 shrink-0 animate-pulse" />
                  <span>Customize in Canvas Studio</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
