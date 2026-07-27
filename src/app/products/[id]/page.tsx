"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { Heart, ShoppingCart, ArrowLeft, Star, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/Dialog";
import { addToCartUniversal } from "@/lib/cartHelper";
import { toggleWishlistUniversal, isInWishlistUniversal } from "@/lib/wishlistHelper";

const CanvasEditor = dynamic(() => import("@/components/studio/CanvasEditor"), { ssr: false });

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  tags: string[];
  stock: number;
  ratingAvg: number;
  reviewCount: number;
  isPersonalizable: boolean;
  artisanId: {
    _id: string;
    name: string;
    username: string;
  };
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [activeTab, setActiveTab] = useState<"details" | "personalize" | "reviews">("details");
  const [personalizationData, setPersonalizationData] = useState<{ image: string; json: string } | null>(null);
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewImage, setReviewImage] = useState<string | null>(null);
  const [viewingReviewImage, setViewingReviewImage] = useState<string | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await fetch(`/api/reviews?productId=${id}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return res.json() as Promise<{ reviews: any[] }>;
    },
    enabled: typeof window !== "undefined" && !!id,
  });
  const reviews = reviewsData?.reviews || [];

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: id,
          rating,
          comment,
          images: reviewImage ? [reviewImage] : [],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit review");
      alert("Review submitted successfully!");
      setComment("");
      setRating(5);
      setReviewImage(null);
      refetchReviews();
      queryClient.invalidateQueries({ queryKey: ["product", id] });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error("Failed to fetch product details");
      const json = await res.json();
      return json.product as Product;
    },
    enabled: typeof window !== "undefined" && !!id,
  });

  const handleCanvasSave = (imageDataUrl: string, jsonState: string) => {
    setPersonalizationData({ image: imageDataUrl, json: jsonState });
    setActiveTab("details");
    alert("Personalized design saved! You can now add the card to your cart.");
  };

  const handleAddToCart = async () => {
    if (!data) return;
    await addToCartUniversal(
      {
        _id: data._id,
        title: data.title,
        price: data.price,
        images: data.images,
        category: data.category,
        stock: data.stock || 50,
      },
      1,
      personalizationData
        ? {
            customImage: personalizationData.image,
            canvasJson: personalizationData.json,
          }
        : undefined
    );
    alert("Card added to cart successfully!");
    router.push("/cart");
  };

  const handleAddToWishlist = async () => {
    if (!data) return;
    const res = await toggleWishlistUniversal({
      _id: data._id,
      title: data.title,
      price: data.price,
      images: data.images,
      category: data.category,
    });
    alert(res.wishlisted ? "Added to Wishlist ❤️" : "Removed from Wishlist");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 animate-pulse space-y-6">
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-1/4 bg-muted rounded" />
              <div className="h-24 w-full bg-muted rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          <p className="text-destructive font-semibold">Product details not found or failed to load.</p>
          <Button onClick={() => router.push("/products")} className="mt-4">
            Back to catalogue
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.push("/products")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to catalogue
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 space-y-4">
            <div className="aspect-square bg-muted border border-border rounded-xl overflow-hidden shadow-sm relative">
              <img
                src={personalizationData?.image || data.images[0] || "https://placehold.co/600?text=Card+Template"}
                alt={data.title}
                className="object-cover w-full h-full"
              />
              {personalizationData && (
                <div className="absolute bottom-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow">
                  <CheckCircle className="h-3.5 w-3.5" /> Customized Preview
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="border-b border-border pb-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Category: <span className="capitalize font-medium">{data.category}</span> | Designed by{" "}
                    <span className="font-semibold text-primary">{data.artisanId.name}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">₹{data.price}</div>
                  <div className="text-xs text-muted-foreground mt-1">Inclusive of all taxes</div>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4">
                {data.ratingAvg > 0 ? (
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4.5 w-4.5 ${
                            i < Math.round(data.ratingAvg) ? "fill-amber-500 text-amber-500" : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-semibold ml-1">
                      {data.ratingAvg.toFixed(1)} ({data.reviewCount} reviews)
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No reviews yet</span>
                )}
                <Badge variant={data.stock > 0 ? "success" : "destructive"}>
                  {data.stock > 0 ? `${data.stock} available` : "Out of Stock"}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2 border-b border-border pb-px">
              <button
                onClick={() => setActiveTab("details")}
                className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "details"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Description
              </button>
              {data.isPersonalizable && (
                <button
                  onClick={() => setActiveTab("personalize")}
                  className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                    activeTab === "personalize"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Personalize Studio
                </button>
              )}
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Reviews ({data.reviewCount})
              </button>
            </div>

            {activeTab === "details" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-semibold">About this card</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line font-light">
                    {data.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {data.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={data.stock <= 0}
                    className="flex-1 flex items-center justify-center gap-2"
                    size="lg"
                  >
                    <ShoppingCart className="h-5 w-5" /> Add to Cart
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={handleAddToWishlist}
                  >
                    <Heart className="h-5 w-5" /> Add to Wishlist
                  </Button>
                </div>
              </div>
            )}

            {activeTab === "personalize" && data.isPersonalizable && (
              <div className="pt-2 w-full">
                <CanvasEditor templateUrl={data.images[0]} onSave={handleCanvasSave} />
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-sm">Write a Customer Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground block">Rating</label>
                        <div className="flex gap-1 text-amber-500">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setRating(val)}
                              className="cursor-pointer hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`h-6 w-6 ${val <= rating ? "fill-amber-500 text-amber-500" : "text-border"}`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground block">Comment</label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="What did you like or dislike about this card?"
                          className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground block">Upload Photo (Optional)</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setReviewImage(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="text-xs block w-full text-muted-foreground file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:opacity-90 file:cursor-pointer"
                        />
                        {reviewImage && (
                          <div className="relative w-16 h-16 border border-border rounded-md overflow-hidden mt-2">
                            <img src={reviewImage} alt="Review upload preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => setReviewImage(null)}
                              className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 hover:bg-black/80 rounded-full text-white text-[10px] cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        )}
                      </div>
                      <Button type="submit" size="sm" disabled={submittingReview}>
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <h3 className="font-semibold text-sm border-b border-border pb-2">Customer Reviews</h3>
                  {reviews.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No reviews yet for this card template. Be the first to share your thoughts!
                    </p>
                  ) : (
                    <div className="space-y-4 divide-y divide-border/50">
                      {reviews.map((rev: any) => (
                        <div key={rev._id} className="pt-4 first:pt-0 space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-semibold">{rev.userId?.name || "Customer"}</span>
                            <span className="text-muted-foreground">
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, idx) => (
                              <Star
                                key={idx}
                                className={`h-3.5 w-3.5 ${
                                  idx < rev.rating ? "fill-amber-500 text-amber-500" : "text-border"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground">{rev.comment}</p>
                          {rev.images && rev.images.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {rev.images.map((imgUrl: string, idx: number) => (
                                <div key={idx} className="w-16 h-16 bg-muted border border-border rounded-md overflow-hidden">
                                  <img
                                    src={imgUrl}
                                    alt="Review attached image"
                                    className="w-full h-full object-cover cursor-zoom-in"
                                    onClick={() => setViewingReviewImage(imgUrl)}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <Dialog open={!!viewingReviewImage} onOpenChange={(open) => !open && setViewingReviewImage(null)}>
        {viewingReviewImage && (
          <DialogContent className="max-w-md">
            <DialogClose onClick={() => setViewingReviewImage(null)} />
            <DialogHeader>
              <DialogTitle>Customer Review Photo</DialogTitle>
            </DialogHeader>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden border border-border mt-4">
              <img src={viewingReviewImage} alt="Review photo zoom" className="w-full h-full object-contain" />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
