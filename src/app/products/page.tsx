"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Eye, ExternalLink, Sparkles, Star, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProductQuickViewModal, QuickViewProduct } from "@/components/ProductQuickViewModal";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  stock: number;
  ratingAvg: number;
  reviewCount: number;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Quick view modal state
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["products", search, category, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      params.append("sort", sort);
      params.append("page", page.toString());
      params.append("limit", "24");

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json() as Promise<{ products: Product[]; total: number; page: number; pages: number }>;
    },
    enabled: typeof window !== "undefined",
  });

  // Exact original filter categories from muki_cards/product.html
  const legacyCategories = [
    { label: "All Cards", value: "" },
    { label: "Love Cards", value: "Love Cards" },
    { label: "Gift Cards", value: "Gift Cards" },
    { label: "Mini Cards", value: "Mini Cards" },
    { label: "Offer Cards", value: "Offer Cards" },
    { label: "Vintage Cards", value: "Vintage Cards" },
    { label: "Oil Painting Cards", value: "Oil Painting Cards" },
    { label: "Book Marks", value: "Book Marks" },
    { label: "Mini Frames", value: "Mini Frames" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header & Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border/80 pb-6">
          <div className="space-y-2">
            <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-bold tracking-wider uppercase text-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" /> Muki Artisan Studio Catalogue
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Handcrafted Celebration Cards
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-light">
              Explore our legacy and new handcrafted collections made with luxury 300 GSM paper.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative flex-1 sm:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search card names or styles..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 h-11 bg-card border-border/80 text-sm font-medium shadow-xs"
              />
            </div>
            <Select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-52 h-11 bg-card border-border/80 text-sm font-semibold shadow-xs"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated Cards</option>
            </Select>
          </div>
        </div>

        {/* ORIGINAL FILTER PILLS (Exact muki_cards categories) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar">
          {legacyCategories.map((cat) => {
            const isSelected = category === cat.value;
            return (
              <Button
                key={cat.label}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCategory(cat.value);
                  setPage(1);
                }}
                className={`rounded-full whitespace-nowrap cursor-pointer px-5 py-2.5 h-10 text-xs font-bold transition-all shadow-xs ${
                  isSelected
                    ? "bg-gradient-to-r from-pink-500 via-primary to-indigo-600 text-white border-transparent shadow-md shadow-primary/20 scale-105"
                    : "bg-card hover:bg-muted border-border/80 hover:border-primary/40 text-foreground"
                }`}
              >
                <span>{cat.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Main Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-muted/40 rounded-2xl h-96 border border-border" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 text-destructive bg-destructive/5 rounded-2xl border border-destructive/20">
            <p className="text-lg font-bold">Error loading cards catalogue.</p>
            <p className="text-sm mt-1">Please check your database connection or refresh the page.</p>
          </div>
        ) : !data || data.products.length === 0 ? (
          <div className="text-center py-20 bg-muted/30 rounded-2xl border border-border">
            <Tag className="h-12 w-12 text-muted-foreground/60 mx-auto mb-3" />
            <p className="text-lg font-bold text-foreground">No cards found in this category.</p>
            <p className="text-sm text-muted-foreground mt-1">Try selecting "All Cards" or resetting your search keywords.</p>
            <Button
              variant="outline"
              className="mt-5 font-bold px-6"
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {data.products.map((product) => (
                <Card
                  key={product._id}
                  className="group overflow-hidden border border-border/80 hover:border-primary/50 rounded-2xl bg-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="aspect-square bg-muted/40 overflow-hidden relative cursor-pointer"
                      onClick={() => setQuickViewProduct(product)}
                    >
                      <img
                        src={product.images?.[0] || "/product1.jpg"}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/product1.jpg";
                        }}
                      />
                      <Badge className="absolute top-3 left-3 bg-background/95 backdrop-blur-md text-foreground border border-border/80 font-bold text-[11px] uppercase tracking-wider shadow-xs">
                        {product.category}
                      </Badge>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="bg-white text-black text-xs font-extrabold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                          <Eye className="h-4 w-4 text-primary" /> Quick View
                        </span>
                      </div>
                    </div>

                    <CardContent className="p-5 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-extrabold text-base text-foreground group-hover:text-primary transition-colors truncate">
                          {product.title}
                        </h3>
                        <span className="font-black text-lg text-primary whitespace-nowrap">₹{product.price}</span>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between text-xs pt-3 border-t border-border/60">
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {product.stock > 0 ? "Ready to Ship" : "Made to Order"}
                        </span>
                        {product.ratingAvg > 0 ? (
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            {product.ratingAvg.toFixed(1)}
                          </span>
                        ) : (
                          <span className="font-bold text-amber-500 flex items-center gap-1">
                            <Star className="h-3.5 w-3.5 fill-amber-500" />
                            4.9
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </div>

                  <div className="p-5 pt-0 flex gap-2.5">
                    <Button
                      onClick={() => setQuickViewProduct(product)}
                      className="w-full cursor-pointer text-xs font-bold h-10 flex items-center justify-center gap-1.5 shadow-xs"
                      size="sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Quick View</span>
                    </Button>
                    <Link href={`/products/${product._id}`} className="flex-none">
                      <Button variant="outline" size="sm" className="px-3 h-10 hover:border-primary/40" title="View Full Page">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="font-bold"
                >
                  Previous
                </Button>
                <span className="text-sm font-semibold text-muted-foreground px-3">
                  Page {data.page} of {data.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  className="font-bold"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* RICH QUICK VIEW MODAL */}
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
}
