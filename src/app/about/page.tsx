"use client";

import React from "react";
import Link from "next/link";
import { Users, Shield, Award, Heart, Crown, Rocket, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Suvetha Muki",
      role: "FOUNDER & LEAD DESIGNER",
      domain: "Artistic Direction & Hand-Illustration",
      icon: Crown,
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      description:
        "Lead designer specializing in floral watercolor concepts, typography layouts, and paper crafting. Every signature collection originates from Suvetha's physical brush sketches and custom calligraphy.",
      highlights: ["15+ Original Handcrafted Collections", "300 GSM Textured Foil Mastery", "Bespoke Anniversary & Love Cards"],
    },
    {
      name: "Jeyakodi",
      role: "HEAD MANAGER",
      domain: "Operations, Printing & Logistics",
      icon: Shield,
      badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
      description:
        "Manages printing production lines, packaging pipelines, and logistics operations. Ensures every card is inspected for tactile perfection, embossed seal integrity, and matching luxury envelope inclusion.",
      highlights: ["100% Eco-Friendly Cardstock QC", "3-5 Day Expedited Crafting Pipeline", "Zero-Damage Packaging Guarantee"],
    },
    {
      name: "Thangaraj P",
      role: "MARKETING MANAGER",
      domain: "Brand Outreach & Artisan Catalog",
      icon: Rocket,
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      description:
        "Oversees brand awareness, social media, and catalog campaigns for the artisan marketplace. Helps connect local independent illustrators with celebration seekers across India and beyond.",
      highlights: ["MUKI20 Community Offer Campaigns", "Artisan Studio Spotlight Creator", "Celebration Storyteller"],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-b from-muted/60 via-background to-background overflow-hidden border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
            <Badge className="px-3.5 py-1 text-xs bg-primary/10 text-primary border-primary/20 font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 animate-pulse" /> The Studio Behind the Art
            </Badge>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-indigo-600 bg-clip-text text-transparent">
              Handcrafted with Soul. Rebuilt for Modern Gifting.
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground font-light leading-relaxed">
              Muki Crafty Cards is a boutique artisan studio dedicated to creating tangible, keepsake greeting cards. 
              We blend traditional watercolor artistry with an AI-powered interactive customization studio.
            </p>
          </div>
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
          <div className="absolute -top-24 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        </section>

        {/* Statistics Bar */}
        <section className="border-y border-border bg-muted/20 py-10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-primary">15+</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Original Legacy Cards</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-foreground">300 GSM</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Premium Textured Paper</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-indigo-500">100%</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hand-Illustrated Art</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-emerald-500">5,000+</p>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Moments Celebrated</p>
            </div>
          </div>
        </section>

        {/* TEAM MEMBERS (REMOVED IMAGES, ELEGANT AI-GRADE PROFILES) */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20 uppercase tracking-widest font-bold">
              Leadership & Artisans
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground font-light text-base">
              The passionate minds behind every handcrafted card, design collection, and customer experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {teamMembers.map((member, index) => {
              const IconComponent = member.icon;
              return (
                <div
                  key={index}
                  className="bg-card border border-border/80 hover:border-primary/40 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Glowing subtle top accent */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-pink-500 via-primary to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="space-y-6">
                    {/* Header: Icon & Role Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <Badge variant="outline" className={`text-[11px] font-bold tracking-wider uppercase px-3 py-1 ${member.badgeColor}`}>
                        {member.role}
                      </Badge>
                    </div>

                    {/* Name & Domain */}
                    <div>
                      <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors tracking-tight">
                        {member.name}
                      </h3>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                        {member.domain}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground font-normal leading-relaxed">
                      {member.description}
                    </p>

                    {/* Highlight Bullets */}
                    <div className="pt-4 border-t border-border/60 space-y-2">
                      {member.highlights.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-foreground font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Decorative footer quote */}
                  <div className="mt-8 pt-4 border-t border-border/40 text-[11px] font-serif italic text-muted-foreground">
                    "Crafting memories that last a lifetime."
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mission & Values */}
        <section className="py-20 bg-muted/30 border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Our Core Values</h2>
              <p className="text-muted-foreground font-light">What drives us to preserve tactile craftsmanship in a digital age</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card border border-border/80 p-7 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-rose-500/10 text-rose-500 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Crafted With Love</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  We believe that a handwritten card holds unique emotional value. Each item is hand-illustrated and structured with attention to detail.
                </p>
              </div>

              <div className="bg-card border border-border/80 p-7 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Premium GSM Assurance</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  From luxury cardstock to golden foil accents and customized dimensions, we preserve the highest tactile quality for your greetings.
                </p>
              </div>

              <div className="bg-card border border-border/80 p-7 rounded-2xl space-y-3 shadow-xs hover:shadow-md transition-all">
                <div className="w-10 h-10 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Artisan Empowerment</h3>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  We support independent illustrators and creators, providing a modern marketplace for digital templates and physical layouts.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call To Action */}
        <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-center relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Send a Meaningful Greeting?
            </h2>
            <p className="text-base sm:text-lg text-white/90 font-light max-w-2xl mx-auto">
              Explore our catalogue of handcrafted cards or personalize your own in our Canvas Studio today.
            </p>
            <div className="pt-2">
              <Link href="/products">
                <Button
                  size="lg"
                  className="bg-white hover:bg-zinc-100 text-zinc-900 font-extrabold px-8 py-6 shadow-2xl cursor-pointer flex items-center gap-2 mx-auto transition-transform hover:scale-105"
                >
                  <span>Explore Handcrafted Catalogue</span>
                  <ArrowRight className="h-5 w-5 text-zinc-900" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
