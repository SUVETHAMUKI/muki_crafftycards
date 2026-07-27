"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, ShoppingBag, ArrowLeft, RefreshCw, Eye, Image as ImageIcon, Type, Palette, ShieldCheck, Check } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { addToCartUniversal } from "@/lib/cartHelper";

const CARD_SIZES = [
  { id: "5x7", label: "5\" x 7\" Standard Celebration", priceDelta: 0 },
  { id: "4x6", label: "4\" x 6\" Mini Note Card", priceDelta: -20 },
  { id: "6x8", label: "6\" x 8\" Grand Display", priceDelta: 40 },
  { id: "6x6", label: "6\" x 6\" Square Luxury", priceDelta: 30 },
];

const STAMP_OPTIONS = [
  { id: "none", label: "No Seal", icon: "✨" },
  { id: "gold_crown", label: "Gold Crown Seal", icon: "👑" },
  { id: "rose_ribbon", label: "Rose Gold Ribbon", icon: "🎀" },
  { id: "watercolor_heart", label: "Watercolor Heart", icon: "❤️" },
  { id: "artisan_signature", label: "Artisan Suvetha Signature", icon: "✍️" },
  { id: "vintage_stamp", label: "Vintage Postage Stamp", icon: "📮" },
];

function CustomCardStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("id") || "custom_studio_default";
  const initialTitle = searchParams.get("title") || "Artisan Custom Handcrafted Card";
  const initialPrice = parseFloat(searchParams.get("price") || "120");
  const initialImage = searchParams.get("image") || "/product1.jpg";

  // Studio customization state
  const [activeSide, setActiveSide] = useState<"front" | "inside">("inside");
  const [selectedSize, setSelectedSize] = useState(CARD_SIZES[0]);
  const [inscription, setInscription] = useState("Wishing you a lifetime of happiness, joy, and wonderful celebrations! ❤️");
  const [fontFamily, setFontFamily] = useState<"serif" | "script" | "sans" | "mono">("serif");
  const [fontColor, setFontColor] = useState("#1e1b4b");
  const [selectedStamp, setSelectedStamp] = useState(STAMP_OPTIONS[1]);
  const [customImageUrl, setCustomImageUrl] = useState(initialImage);
  const [added, setAdded] = useState(false);

  const calculatedPrice = Math.max(50, initialPrice + selectedSize.priceDelta);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImageUrl(url);
    }
  };

  const handleAddToCart = async () => {
    const customCanvasJson = JSON.stringify({
      side: activeSide,
      size: selectedSize.label,
      inscription,
      fontFamily,
      fontColor,
      stamp: selectedStamp.label,
      baseImage: customImageUrl,
    });

    await addToCartUniversal(
      {
        _id: productId,
        title: `${initialTitle} (${selectedSize.id})`,
        price: calculatedPrice,
        images: [customImageUrl],
        category: "Custom Studio Card",
      },
      1,
      {
        customImage: customImageUrl,
        canvasJson: customCanvasJson,
      }
    );

    setAdded(true);
    setTimeout(() => {
      router.push("/cart");
    }, 800);
  };

  const getFontClass = () => {
    switch (fontFamily) {
      case "script":
        return "font-serif italic tracking-wide";
      case "mono":
        return "font-mono tracking-tight";
      case "sans":
        return "font-sans font-semibold";
      default:
        return "font-serif font-bold";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/80 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-primary/10 text-primary border-none px-3 py-1 font-bold text-xs uppercase">
                <Sparkles className="h-3 w-3 mr-1 animate-pulse" /> Muki Canvas Studio v2.0
              </Badge>
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-semibold text-xs">
                300 GSM Luxury Textured
              </Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              {initialTitle} — Artisan Customizer
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Personalize paper dimensions, live inscription calligraphy, custom photo overlays, and gold foil seals.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs font-bold h-10 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Catalogue
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Live Interactive Preview Card (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={activeSide === "front" ? "default" : "outline"}
                  onClick={() => setActiveSide("front")}
                  className="font-bold text-xs h-9 px-4 cursor-pointer"
                >
                  Front Cover Design
                </Button>
                <Button
                  size="sm"
                  variant={activeSide === "inside" ? "default" : "outline"}
                  onClick={() => setActiveSide("inside")}
                  className="font-bold text-xs h-9 px-4 cursor-pointer"
                >
                  Inside Inscription Note
                </Button>
              </div>

              <span className="text-xs font-semibold text-muted-foreground">
                Size: <strong className="text-foreground">{selectedSize.label}</strong>
              </span>
            </div>

            {/* Canvas Preview Container */}
            <div className="aspect-[4/3] bg-gradient-to-br from-muted/60 via-card to-muted/80 rounded-3xl p-6 sm:p-10 border-2 border-border/80 shadow-2xl relative flex items-center justify-center overflow-hidden">
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                {selectedStamp.id !== "none" && (
                  <div className="bg-background/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-amber-500/30 shadow-md flex items-center gap-1.5 text-xs font-bold text-foreground animate-bounce">
                    <span className="text-base">{selectedStamp.icon}</span>
                    <span>{selectedStamp.label}</span>
                  </div>
                )}
              </div>

              {activeSide === "front" ? (
                <div className="w-full max-w-sm aspect-[4/5] bg-background rounded-2xl overflow-hidden border-8 border-white dark:border-zinc-800 shadow-2xl relative group flex flex-col justify-between">
                  <img
                    src={customImageUrl}
                    alt="Card Front"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/product1.jpg";
                    }}
                  />
                  <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md text-white text-center p-2 rounded-xl text-xs font-serif">
                    Artisan Handcrafted Card Cover
                  </div>
                </div>
              ) : (
                <div
                  className="w-full max-w-lg aspect-[5/4] bg-[#faf8f5] dark:bg-zinc-900 rounded-2xl p-8 sm:p-12 border-4 border-[#e7e2d8] dark:border-zinc-700 shadow-2xl flex flex-col justify-between relative"
                  style={{ color: fontColor }}
                >
                  <div className="flex justify-between items-start border-b border-black/10 dark:border-white/10 pb-3">
                    <span className="text-[11px] uppercase tracking-widest font-mono opacity-60">
                      Handcrafted Inscription Note
                    </span>
                    <span className="text-lg">{selectedStamp.icon}</span>
                  </div>

                  <div className="my-auto py-4 text-center">
                    <p className={`text-base sm:text-xl leading-relaxed whitespace-pre-wrap ${getFontClass()}`}>
                      {inscription || "Write your personal heartfelt message here..."}
                    </p>
                  </div>

                  <div className="flex justify-between items-end border-t border-black/10 dark:border-white/10 pt-3 text-[10px] opacity-60">
                    <span>Muki Crafty Cards Studio • Hand-Illustrated</span>
                    <span>100% Eco-Friendly Luxury GSM</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted/30 rounded-2xl p-4 border border-border/80 flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="h-4 w-4 text-emerald-500" /> All custom inscriptions are inspected for alignment & clarity before printing.
              </span>
              <span className="font-bold text-foreground">Free Envelope Included</span>
            </div>
          </div>

          {/* RIGHT: Customization Tools Sidebar (5 cols) */}
          <div className="lg:col-span-5 bg-card border border-border/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-md">
            <div className="border-b border-border/80 pb-4 flex items-center justify-between">
              <div>
                <h2 className="font-black text-xl text-foreground">Studio Personalization</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Customize specifications & wording</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-muted-foreground block uppercase">Total Price</span>
                <span className="text-2xl font-black text-primary">₹{calculatedPrice}</span>
              </div>
            </div>

            {/* 1. Size Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                1. Card Dimensions & GSM Paper
              </label>
              <div className="grid grid-cols-1 gap-2">
                {CARD_SIZES.map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border/80 hover:border-primary/40 bg-background text-foreground"
                      }`}
                    >
                      <span>{size.label}</span>
                      <span>{size.priceDelta >= 0 ? `+₹${size.priceDelta}` : `-₹${Math.abs(size.priceDelta)}`}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Inscription Editor */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>2. Inside Inscription Message</span>
                <span className="text-[11px] normal-case text-primary font-semibold">Live Calligraphy Preview</span>
              </label>
              <Textarea
                rows={4}
                value={inscription}
                onChange={(e) => {
                  setInscription(e.target.value);
                  setActiveSide("inside");
                }}
                placeholder="Enter your heartfelt message..."
                className="text-sm font-medium bg-background border-border/80 resize-none"
              />

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-1">Font Style</span>
                  <Select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as any)}
                    className="h-9 text-xs font-bold"
                  >
                    <option value="serif">Luxury Serif</option>
                    <option value="script">Elegant Script</option>
                    <option value="sans">Modern Sans</option>
                    <option value="mono">Artisan Mono</option>
                  </Select>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground block mb-1">Ink Color</span>
                  <div className="flex items-center gap-1.5 h-9">
                    {[
                      { color: "#1e1b4b", name: "Midnight Navy" },
                      { color: "#881337", name: "Burgundy Wine" },
                      { color: "#14532d", name: "Forest Green" },
                      { color: "#000000", name: "Classic Black" },
                    ].map((item) => (
                      <button
                        key={item.color}
                        type="button"
                        onClick={() => setFontColor(item.color)}
                        className={`h-7 w-7 rounded-full border-2 transition-transform cursor-pointer ${
                          fontColor === item.color ? "border-primary scale-110 shadow-sm" : "border-transparent"
                        }`}
                        style={{ backgroundColor: item.color }}
                        title={item.name}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Stamp & Seal Picker */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                3. Gold Foil & Artisan Seal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STAMP_OPTIONS.map((stamp) => {
                  const isSelected = selectedStamp.id === stamp.id;
                  return (
                    <button
                      key={stamp.id}
                      type="button"
                      onClick={() => setSelectedStamp(stamp)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-xs"
                          : "border-border/80 hover:border-primary/40 bg-background text-foreground"
                      }`}
                    >
                      <span className="text-base">{stamp.icon}</span>
                      <span className="truncate">{stamp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Custom Photo Upload */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                4. Custom Cover Photo (Optional)
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="h-10 text-xs bg-background cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={added}
                size="lg"
                className="w-full h-14 font-extrabold text-base bg-gradient-to-r from-pink-500 via-primary to-indigo-600 hover:opacity-95 text-white shadow-lg shadow-primary/30 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {added ? (
                  <>
                    <Check className="h-5 w-5" />
                    <span>Added to Cart! Redirecting...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-5 w-5" />
                    <span>Add Customized Card to Cart • ₹{calculatedPrice}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function CustomCardStudioPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold text-lg">Loading Artisan Studio...</div>}>
      <CustomCardStudioContent />
    </React.Suspense>
  );
}
