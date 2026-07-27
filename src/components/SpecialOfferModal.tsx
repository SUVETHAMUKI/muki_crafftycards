"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Gift, Copy, Check, ChevronLeft, ChevronRight, Heart, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface SpecialOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OFFER_ITEMS = [
  {
    id: "offer-1",
    title: "Festive Cheer Handcrafted Card",
    type: "image",
    src: "/offer1.jpg",
    discount: "20% OFF",
    tag: "Holiday & Celebrations",
    description:
      "A celebratory handcrafted card featuring layered watercolor textures and gold-embossed greeting seals.",
  },
  {
    id: "offer-2",
    title: "Watercolor Artisan Video Preview",
    type: "video",
    src: "/offer2.mp4",
    discount: "25% OFF",
    tag: "Studio Spotlight",
    description:
      "Watch our local artisans sketch and blend custom floral templates in our Muki Crafty Cards studio.",
  },
  {
    id: "offer-3",
    title: "Exclusive Calligraphy Release",
    type: "image",
    src: "/offer3.png",
    discount: "15% OFF",
    tag: "Luxury Anniversary",
    description:
      "Custom calligraphy prints and golden foil signatures for luxury milestones and anniversaries.",
  },
  {
    id: "offer-4",
    title: "Handcrafted Love Box Series",
    type: "image",
    src: "/love card.jpg",
    discount: "20% OFF",
    tag: "Love & Romance",
    description:
      "An exclusive love-themed folding card with secret message pockets and handcrafted paper roses.",
  },
  {
    id: "offer-5",
    title: "Celebration Special Edition",
    type: "image",
    src: "/offers2.jpg",
    discount: "30% OFF",
    tag: "Limited Stock",
    description:
      "Our signature celebration card crafted on 300 GSM textured paper with handmade ribbon embellishment.",
  },
];

export function SpecialOfferModal({ open, onOpenChange }: SpecialOfferModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentOffer = OFFER_ITEMS[currentIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText("MUKI20");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const nextOffer = () => {
    setCurrentIndex((prev) => (prev + 1) % OFFER_ITEMS.length);
  };

  const prevOffer = () => {
    setCurrentIndex((prev) => (prev - 1 + OFFER_ITEMS.length) % OFFER_ITEMS.length);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden border-2 border-primary/30 shadow-2xl bg-card">
        <DialogClose
          onClick={() => onOpenChange(false)}
          className="absolute right-5 top-5 z-50 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
        />
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-white/30 text-xs px-2.5 py-0.5">
              <Gift className="h-3 w-3 mr-1 animate-bounce" /> Limited Time Offers
            </Badge>
            <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
              Muki Crafty Cards Specials
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Artisan Handcrafted Card Deals 🎉
          </h2>
          <p className="text-sm text-white/90 font-light mt-1">
            Handpicked designs from our original catalog — available with instant coupon discounts!
          </p>
        </div>

        {/* Carousel & Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Media Display */}
            <div className="relative aspect-4/3 rounded-xl overflow-hidden bg-muted border border-border shadow-md group">
              {currentOffer.type === "video" ? (
                <video
                  src={currentOffer.src}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={currentOffer.src}
                  alt={currentOffer.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              
              <Badge className="absolute top-3 left-3 bg-rose-600 text-white border-none font-bold shadow-md">
                {currentOffer.discount}
              </Badge>

              {/* Carousel Arrows */}
              <button
                onClick={prevOffer}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                aria-label="Previous offer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextOffer}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-full transition-colors cursor-pointer"
                aria-label="Next offer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Dots indicator */}
              <div className="absolute bottom-2 inset-x-0 flex justify-center gap-1.5">
                {OFFER_ITEMS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      index === currentIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Offer Details & Coupon */}
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  {currentOffer.tag}
                </span>
                <h3 className="text-xl font-bold text-foreground mt-1">
                  {currentOffer.title}
                </h3>
                <p className="text-sm text-muted-foreground font-light mt-2 leading-relaxed">
                  {currentOffer.description}
                </p>
              </div>

              {/* Coupon Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" /> Promo Code
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">20% Off Entire Order</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2 font-mono text-base font-bold text-foreground text-center tracking-widest select-all">
                    MUKI20
                  </div>
                  <Button
                    onClick={handleCopyCode}
                    variant={copied ? "default" : "outline"}
                    className="flex items-center gap-1.5 cursor-pointer font-semibold"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-white" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2">
                <Link href="/products" onClick={() => onOpenChange(false)}>
                  <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-5 shadow-lg shadow-pink-500/20 cursor-pointer">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Claim Discount & Shop Catalog
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info from legacy muki_cards */}
        <div className="bg-muted/40 px-6 py-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3 w-3 text-rose-500 fill-rose-500" /> Made by Suvetha Muki & Artisan Team
          </span>
          <span>100% Handcrafted • Free Shipping over ₹500</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
