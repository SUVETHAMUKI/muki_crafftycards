"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, Image as ImageIcon, Sparkles, Tag, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/Dialog";
import {
  getLocalCart,
  removeCartItemUniversal,
  updateCartQtyUniversal,
  UniversalCartItem,
} from "@/lib/cartHelper";

export default function CartPage() {
  const router = useRouter();
  const [viewingCustomImage, setViewingCustomImage] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<UniversalCartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Load from localStorage immediately and listen for changes
  useEffect(() => {
    const load = () => setLocalItems(getLocalCart());
    load();
    window.addEventListener("cart_updated", load);
    return () => window.removeEventListener("cart_updated", load);
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) return { cart: { items: [] } };
      return res.json();
    },
    enabled: typeof window !== "undefined",
  });

  // Merge backend items with localItems without duplication
  const backendItems = data?.cart?.items || [];
  const mergedMap = new Map<string, UniversalCartItem>();
  
  backendItems.forEach((it: any) => {
    if (it.productId) {
      mergedMap.set(it.productId._id, {
        _id: it._id,
        productId: it.productId,
        qty: it.qty,
        personalization: it.personalization,
      });
    }
  });

  localItems.forEach((it) => {
    if (it.productId && !mergedMap.has(it.productId._id)) {
      mergedMap.set(it.productId._id, it);
    }
  });

  const cartItems = Array.from(mergedMap.values());

  const handleQtyChange = (itemId: string, currentQty: number, change: number, stock: number) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    if (newQty > stock) {
      alert(`Only ${stock} items left in stock.`);
      return;
    }
    const updated = updateCartQtyUniversal(itemId, newQty);
    setLocalItems(updated);
  };

  const handleRemove = (itemId: string) => {
    const updated = removeCartItemUniversal(itemId);
    setLocalItems(updated);
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + price * item.qty;
  }, 0);

  const discountAmount = discountApplied ? Math.round(subtotal * 0.2) : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const shipping = discountedSubtotal > 500 || discountedSubtotal === 0 ? 0 : 40;
  const total = discountedSubtotal + shipping;

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === "MUKI20") {
      setDiscountApplied(true);
      alert("MUKI20 Coupon Applied! You got 20% OFF your entire order.");
    } else {
      alert("Invalid coupon code. Try MUKI20 for 20% discount!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between border-b border-border pb-6 mb-8">
          <div>
            <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-bold text-xs uppercase mb-2">
              <Sparkles className="h-3 w-3 mr-1" /> Artisan Shopping Bag
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Your Shopping Cart</h1>
          </div>
          {cartItems.length > 0 && (
            <span className="text-sm font-semibold text-muted-foreground">
              {cartItems.length} {cartItems.length === 1 ? "Item" : "Items"} in Cart
            </span>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-border/80 rounded-3xl bg-card max-w-lg mx-auto space-y-6 shadow-xs">
            <div className="mx-auto w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">Your cart is empty</h2>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                Explore our handcrafted greeting card collection and celebration specials!
              </p>
            </div>
            <Link href="/products" className="inline-block">
              <Button size="lg" className="font-bold px-8 shadow-md shadow-primary/20 cursor-pointer">
                Browse Catalogue
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Cart Items */}
            <div className="lg:col-span-8 space-y-4">
              {cartItems.map((item) => {
                if (!item.productId) return null;
                const product = item.productId;
                return (
                  <Card key={item._id} className="overflow-hidden border border-border/80 hover:border-primary/40 rounded-2xl bg-card shadow-xs transition-all">
                    <CardContent className="p-5 flex flex-col sm:flex-row gap-5 items-center justify-between">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-24 h-24 bg-muted/40 rounded-xl overflow-hidden border border-border/80 flex-shrink-0 relative">
                          <img
                            src={item.personalization?.customImage || product.images?.[0] || "/product1.jpg"}
                            alt={product.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/product1.jpg";
                            }}
                          />
                        </div>
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <Badge className="bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider">
                            {product.category}
                          </Badge>
                          <h3 className="font-extrabold text-base sm:text-lg text-foreground line-clamp-1">{product.title}</h3>
                          <p className="font-black text-primary text-base">₹{product.price} each</p>

                          {item.personalization && (
                            <div className="flex items-center gap-2 pt-1">
                              <span className="text-[11px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Customized Design
                              </span>
                              <button
                                onClick={() => setViewingCustomImage(item.personalization?.customImage || null)}
                                className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <ImageIcon className="h-3.5 w-3.5" /> Preview
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-border/60">
                        <div className="flex items-center border border-border rounded-xl bg-background overflow-hidden shadow-xs">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none border-r border-border hover:bg-muted"
                            onClick={() => handleQtyChange(item._id, item.qty, -1, product.stock || 50)}
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <span className="px-4 text-sm font-black">{item.qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-none border-l border-border hover:bg-muted"
                            onClick={() => handleQtyChange(item._id, item.qty, 1, product.stock || 50)}
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-extrabold text-foreground">₹{product.price * item.qty}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 px-2 mt-1 cursor-pointer"
                            onClick={() => handleRemove(item._id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-4 border border-border/80 bg-card p-6 rounded-3xl space-y-6 shadow-md lg:sticky lg:top-24">
              <div className="border-b border-border/80 pb-4">
                <h2 className="font-black text-xl text-foreground">Order Summary</h2>
                <p className="text-xs text-muted-foreground mt-0.5">300 GSM Luxury Handcrafted Paper</p>
              </div>

              {/* Coupon Code Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Tag className="h-3.5 w-3.5 text-primary" /> Promo Discount Code
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter MUKI20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="h-10 text-xs font-bold uppercase bg-background"
                  />
                  <Button
                    onClick={applyCoupon}
                    size="sm"
                    className="h-10 px-4 font-bold cursor-pointer"
                    variant="outline"
                  >
                    Apply
                  </Button>
                </div>
                {discountApplied && (
                  <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> 20% OFF coupon active!
                  </p>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold text-foreground">₹{subtotal}</span>
                </div>

                {discountApplied && (
                  <div className="flex justify-between text-emerald-500 font-semibold">
                    <span>MUKI20 Discount (20%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between text-muted-foreground">
                  <span>Standard Shipping</span>
                  <span className="font-semibold text-foreground">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                {shipping > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-muted-foreground">
                    <span className="font-bold text-primary">Free Shipping:</span> Add ₹{500 - discountedSubtotal} more to qualify for free shipping!
                  </div>
                )}

                <div className="flex justify-between text-lg font-black pt-4 border-t border-border mt-3">
                  <span>Total Amount</span>
                  <span className="text-primary text-xl">₹{total}</span>
                </div>
              </div>

              <Link href="/checkout" className="block pt-2">
                <Button
                  className="w-full h-13 font-extrabold text-base bg-gradient-to-r from-pink-500 via-primary to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-primary/25 cursor-pointer flex items-center justify-center gap-2"
                  size="lg"
                >
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Dialog open={!!viewingCustomImage} onOpenChange={(open) => !open && setViewingCustomImage(null)}>
        {viewingCustomImage && (
          <DialogContent className="max-w-md rounded-3xl p-6">
            <DialogClose onClick={() => setViewingCustomImage(null)} />
            <DialogHeader>
              <DialogTitle className="font-extrabold">Your Customized Design</DialogTitle>
            </DialogHeader>
            <div className="aspect-square bg-muted/40 rounded-2xl overflow-hidden border border-border mt-4">
              <img src={viewingCustomImage} alt="Custom design preview" className="w-full h-full object-contain" />
            </div>
          </DialogContent>
        )}
      </Dialog>
      <Footer />
    </div>
  );
}
