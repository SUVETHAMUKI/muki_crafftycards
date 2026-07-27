"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Heart, ShieldCheck, Gift, Eye, Tag } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SpecialOfferModal } from "@/components/SpecialOfferModal";
import { ProductQuickViewModal, QuickViewProduct } from "@/components/ProductQuickViewModal";

interface Product {
  _id: string;
  title: string;
  description?: string;
  price: number;
  images: string[];
  category: string;
  ratingAvg: number;
}

export default function Home() {
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<QuickViewProduct | null>(null);

  const { data: featuredData } = useQuery<{ products: Product[] }>({
    queryKey: ["featured-products"],
    queryFn: async () => {
      const res = await fetch("/api/products?limit=6");
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
  });

  const featured = featuredData?.products || [];

  const categoryShortcuts = [
    {
      name: "Birthday",
      image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=60",
    },
    {
      name: "Anniversary",
      image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&auto=format&fit=crop&q=60",
    },
    {
      name: "Holiday",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=400&auto=format&fit=crop&q=60",
    },
    {
      name: "Thank You",
      image: "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&auto=format&fit=crop&q=60",
    },
  ];

  // Love Cards series from legacy muki_cards
  const loveCardsSeries: QuickViewProduct[] = [
    {
      _id: "love-1",
      title: "Handcrafted Love Box Card",
      description: "An exclusive love-themed folding card with secret message pockets and handcrafted roses.",
      price: 299,
      images: ["/love card.jpg"],
      category: "Love",
      ratingAvg: 4.9,
      stock: 12,
      isPersonalizable: true,
    },
    {
      _id: "love-2",
      title: "Romantic Heart Accordion",
      description: "Textured watercolor paper fold with customizable photo slots and gold ink lettering.",
      price: 349,
      images: ["/love card2.jpg"],
      category: "Love",
      ratingAvg: 4.8,
      stock: 8,
      isPersonalizable: true,
    },
    {
      _id: "love-3",
      title: "Vintage Romance Pocket Card",
      description: "Antique style romantic greeting card with wax seal envelope and floral calligraphy.",
      price: 279,
      images: ["/love card3.jpg"],
      category: "Love",
      ratingAvg: 5.0,
      stock: 15,
      isPersonalizable: true,
    },
    {
      _id: "love-4",
      title: "Secret Love Message Scroll",
      description: "Handcrafted mini scroll inside an embossed love card case for anniversaries.",
      price: 399,
      images: ["/love card4.jpg"],
      category: "Love",
      ratingAvg: 4.7,
      stock: 10,
      isPersonalizable: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 space-y-20 pb-16">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-24 lg:py-36 min-h-[550px] flex items-center border-b border-border">
          <video
            className="absolute inset-0 w-full h-full object-cover z-0"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/logo.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/60 dark:bg-black/85 z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
            <div className="space-y-6 max-w-2xl text-left">
              <Badge className="px-3 py-1 text-xs bg-primary/20 text-primary border-primary/30" variant="outline">
                <Sparkles className="h-3 w-3 mr-1.5 text-primary fill-primary animate-pulse" /> Handcrafted Cards Rebuilt
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white">
                Beautiful Handcrafted Cards, Made with Love.
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed font-light">
                Discover a curated marketplace of beautiful card designs from local artisans. Customize text, fonts, and
                photos directly in our interactive Canvas Studio.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/products">
                  <Button
                    size="lg"
                    className="flex items-center gap-1.5 cursor-pointer bg-primary hover:bg-primary/95 text-primary-foreground border-none shadow-lg shadow-primary/20"
                  >
                    Explore Shop <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Button
                  onClick={() => setOfferModalOpen(true)}
                  variant="outline"
                  size="lg"
                  className="text-white border-white/40 hover:bg-white/10 cursor-pointer flex items-center gap-2"
                >
                  <Gift className="h-5 w-5 text-rose-400" />
                  <span>View Special Offers (MUKI20)</span>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block relative aspect-square max-w-lg justify-self-end w-full">
              <img
                src="/large-photo.jpg"
                alt="Beautiful greeting cards assortment"
                className="rounded-2xl shadow-2xl border border-white/10 object-cover w-full h-full transform hover:scale-101 transition-transform duration-500"
              />
            </div>
          </div>
        </section>

        {/* SHOP BY OCCASION */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Shop by Occasion</h2>
            <p className="text-muted-foreground font-light">
              Browse handcrafted greeting cards tailored for special events
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categoryShortcuts.map((cat) => (
              <Link key={cat.name} href={`/products?category=${cat.name}`}>
                <div className="group relative aspect-4/5 rounded-xl overflow-hidden border border-border bg-muted cursor-pointer shadow-sm hover:shadow-md transition-all">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-4">
                    <h3 className="font-semibold text-lg text-white group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* BRAND VALUES */}
        <section className="bg-muted/30 border-y border-border py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">100% Handcrafted</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Every card template is uniquely designed and styled by real independent creators.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-full flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Personalized Studio</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Add custom messages and photo layers directly onto card templates using our editor.
              </p>
            </div>
            <div className="flex flex-col items-center text-center space-y-3 p-4">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold">Secure Checkout</h3>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Safe test payments powered by Razorpay & instant UPI QR scanning. Zero raw card details stored.
              </p>
            </div>
          </div>
        </section>

        {/* SPECIAL OFFER CARDS (Interactive with modal) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20 px-3 py-1 mb-1">
              <Tag className="h-3.5 w-3.5 mr-1" /> Coupon Code: MUKI20
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight">Special Offer Cards</h2>
            <p className="text-muted-foreground font-light">
              Discover limited-edition seasonal cards and custom artisan discounts from our legacy collection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Offer 1 */}
            <div
              onClick={() => setOfferModalOpen(true)}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <img
                  src="/offer1.jpg"
                  alt="Celebratory handcrafted offer card"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 bg-rose-500 hover:bg-rose-600 border-none text-white font-bold shadow">
                  20% OFF
                </Badge>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                    <Eye className="h-3.5 w-3.5" /> View Special Offer
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  Festive Cheer Cards
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  A celebratory handcrafted card series for birthdays and family achievements.
                </p>
                <span className="inline-block text-primary text-xs font-semibold pt-1">
                  Click to claim discount MUKI20 →
                </span>
              </div>
            </div>

            {/* Offer 2 */}
            <div
              onClick={() => setOfferModalOpen(true)}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <video
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/offer2.mp4" type="video/mp4" />
                </video>
                <Badge className="absolute top-2 left-2 bg-rose-500 hover:bg-rose-600 border-none text-white font-bold shadow">
                  Artisan Video
                </Badge>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                    <Eye className="h-3.5 w-3.5" /> View Special Offer
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  Watercolor Masterpieces
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Watch our local design specialists sketch and blend customized templates in real-time.
                </p>
                <span className="inline-block text-primary text-xs font-semibold pt-1">
                  Click to claim discount MUKI20 →
                </span>
              </div>
            </div>

            {/* Offer 3 */}
            <div
              onClick={() => setOfferModalOpen(true)}
              className="bg-card border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group cursor-pointer"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                <img
                  src="/offer3.png"
                  alt="Artisan crafted designs"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 bg-rose-500 hover:bg-rose-600 border-none text-white font-bold shadow">
                  Exclusive Release
                </Badge>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                    <Eye className="h-3.5 w-3.5" /> View Special Offer
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                  Exclusive Calligraphy
                </h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Custom calligraphy prints and golden foil signatures for luxury anniversaries.
                </p>
                <span className="inline-block text-primary text-xs font-semibold pt-1">
                  Click to claim discount MUKI20 →
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* LOVE & ROMANTIC CARDS SERIES (From muki_cards) */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <Badge variant="outline" className="text-xs bg-rose-500/10 text-rose-500 border-rose-500/20 mb-2">
                <Heart className="h-3 w-3 mr-1 fill-rose-500" /> Signature Romantic Series
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight">Handcrafted Love Cards</h2>
              <p className="text-muted-foreground font-light mt-1">
                Bespoke romantic cards from our original muki_cards collection
              </p>
            </div>
            <Link href="/products?category=Love">
              <Button variant="outline" className="flex items-center gap-1">
                View All Love Cards <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loveCardsSeries.map((card) => (
              <Card
                key={card._id}
                className="group overflow-hidden border border-border hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-square bg-muted overflow-hidden relative cursor-pointer" onClick={() => setQuickViewProduct(card)}>
                    <img
                      src={card.images[0]}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <Badge className="absolute top-2 right-2 bg-background/90 text-foreground border border-border font-semibold text-xs">
                      {card.category}
                    </Badge>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                        <Eye className="h-3.5 w-3.5" /> Quick View
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                        {card.title}
                      </h3>
                      <span className="font-bold text-primary">₹{card.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {card.description}
                    </p>
                  </CardContent>
                </div>
                <div className="p-4 pt-0">
                  <Button
                    onClick={() => setQuickViewProduct(card)}
                    className="w-full cursor-pointer text-xs font-semibold"
                    size="sm"
                  >
                    Quick View & Personalize
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ARTISAN FAVORITES */}
        {featured.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Artisan Favorites</h2>
                <p className="text-muted-foreground font-light mt-1">Our most popular greeting card creations</p>
              </div>
              <Link href="/products">
                <Button variant="outline" className="flex items-center gap-1">
                  View All Cards <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((product) => (
                <Card
                  key={product._id}
                  className="group overflow-hidden border border-border hover:shadow-md transition-shadow"
                >
                  <div
                    className="aspect-square bg-muted overflow-hidden relative cursor-pointer"
                    onClick={() =>
                      setQuickViewProduct({
                        _id: product._id,
                        title: product.title,
                        description: product.description || "Handcrafted greeting card made with love.",
                        price: product.price,
                        images: product.images,
                        category: product.category,
                        ratingAvg: product.ratingAvg,
                        isPersonalizable: true,
                      })
                    }
                  >
                    <img
                      src={product.images[0] || "https://placehold.co/400"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-xs text-xs font-semibold px-2.5 py-1 rounded-full text-foreground border border-border capitalize">
                      {product.category}
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                        <Eye className="h-3.5 w-3.5" /> Quick View
                      </span>
                    </div>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                        {product.title}
                      </h3>
                      <span className="font-bold text-primary">₹{product.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-border/50">
                      <span className="text-muted-foreground">Rating</span>
                      <span className="font-semibold text-amber-500">
                        {product.ratingAvg > 0 ? `★ ${product.ratingAvg.toFixed(1)}` : "No ratings yet"}
                      </span>
                    </div>
                    <Button
                      onClick={() =>
                        setQuickViewProduct({
                          _id: product._id,
                          title: product.title,
                          description: product.description || "Handcrafted greeting card made with love.",
                          price: product.price,
                          images: product.images,
                          category: product.category,
                          ratingAvg: product.ratingAvg,
                          isPersonalizable: true,
                        })
                      }
                      className="w-full mt-2 cursor-pointer text-xs"
                      size="sm"
                    >
                      Quick View & Personalize
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* FLOATING SPECIAL OFFERS BUTTON */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setOfferModalOpen(true)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-4 py-3 rounded-full shadow-lg shadow-pink-500/30 flex items-center gap-2 transform hover:scale-105 transition-all duration-300 cursor-pointer border-2 border-white/20 animate-pulse"
        >
          <Gift className="h-5 w-5" />
          <span className="text-xs sm:text-sm">🎁 Special Deals (20% OFF)</span>
        </button>
      </div>

      {/* MODALS */}
      <SpecialOfferModal open={offerModalOpen} onOpenChange={setOfferModalOpen} />
      <ProductQuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer />
    </div>
  );
}
