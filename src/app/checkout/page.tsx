"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { CreditCard, MapPin, Award, ArrowLeft, ShoppingBag, QrCode, Truck, DollarSign } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { CheckoutQrModal } from "@/components/CheckoutQrModal";
import { getLocalCart, clearCartUniversal, UniversalCartItem } from "@/lib/cartHelper";

interface CartResponse {
  cart: {
    items: any[];
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();

  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [redeemPoints, setRedeemPoints] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "card" | "cod" | "paypal">("qr");
  const [loading, setLoading] = useState(false);
  const [localItems, setLocalItems] = useState<UniversalCartItem[]>([]);

  // QR / Payment Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string>("MKCC-2026");

  useEffect(() => {
    const load = () => setLocalItems(getLocalCart());
    load();
    window.addEventListener("cart_updated", load);
    return () => window.removeEventListener("cart_updated", load);
  }, []);

  const { data: cartData, isLoading: isCartLoading } = useQuery<CartResponse>({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) return { cart: { items: [] } };
      return res.json();
    },
  });

  const backendItems = cartData?.cart?.items || [];
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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + price * item.qty;
  }, 0);

  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 40;
  const maxRedeemable = user ? Math.min(user.loyaltyPoints, subtotal * 10) : 0;
  const pointDiscount = Math.min(redeemPoints / 10, subtotal);
  const total = subtotal + shipping - pointDiscount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setLoading(true);

    try {
      // Create backend order
      const orderRes = await fetch("/api/payments/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: { name, street, city, state, zipCode, phone },
          redeemPoints,
          paymentMethod,
        }),
      });

      let createdOrderId = "MKCC-" + Math.floor(10000 + Math.random() * 90000);
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        if (orderData?.orderId) {
          createdOrderId = orderData.orderId;
        }
      }

      setConfirmedOrderId(createdOrderId);
      setLoading(false);

      // Open interactive QR / Order Confirmation modal
      setQrModalOpen(true);
    } catch (err: any) {
      // Fallback for offline or demo testing
      setConfirmedOrderId("MKCC-" + Math.floor(10000 + Math.random() * 90000));
      setLoading(false);
      setQrModalOpen(true);
    }
  };

  const handlePaymentComplete = async () => {
    clearCartUniversal();
    try {
      await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: confirmedOrderId,
          isMock: true,
        }),
      });
    } catch (e) {
      // ignore offline errors
    }
  };

  if (isCartLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <p className="animate-pulse">Loading checkout...</p>
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
          onClick={() => router.push("/cart")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 font-medium cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </button>

        <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12 bg-muted/20 rounded-xl border border-border">
            <p className="text-muted-foreground">Your cart is empty. Cannot checkout.</p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <MapPin className="h-5 w-5 text-primary" /> Shipping Address
                  </CardTitle>
                  <CardDescription>Enter the address where your handcrafted card should be delivered</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="ship-name">
                      Recipient's Name
                    </label>
                    <Input
                      id="ship-name"
                      placeholder="Suvetha Muki"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="ship-street">
                      Street Address
                    </label>
                    <Input
                      id="ship-street"
                      placeholder="123 Artisan Lane, Crafty Studio 4B"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="ship-city">
                        City
                      </label>
                      <Input
                        id="ship-city"
                        placeholder="Chennai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="ship-state">
                        State
                      </label>
                      <Input
                        id="ship-state"
                        placeholder="Tamil Nadu"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="ship-zip">
                        Zip Code
                      </label>
                      <Input
                        id="ship-zip"
                        placeholder="600001"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="ship-phone">
                      Contact Phone Number
                    </label>
                    <Input
                      id="ship-phone"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* PAYMENT METHOD SELECTION (from legacy muki_cards) */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <CreditCard className="h-5 w-5 text-primary" /> Payment Method
                  </CardTitle>
                  <CardDescription>Select your preferred payment mode</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("qr")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "qr"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <QrCode className="h-5 w-5 text-primary mb-2" />
                      <span className="text-xs font-bold block">QR Scanner (UPI)</span>
                      <span className="text-[10px] text-muted-foreground">GPay / PhonePe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("card")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "card"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <CreditCard className="h-5 w-5 text-primary mb-2" />
                      <span className="text-xs font-bold block">Credit / Debit</span>
                      <span className="text-[10px] text-muted-foreground">Razorpay Secure</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <Truck className="h-5 w-5 text-primary mb-2" />
                      <span className="text-xs font-bold block">Cash on Delivery</span>
                      <span className="text-[10px] text-muted-foreground">Pay on Receipt</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod("paypal")}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        paymentMethod === "paypal"
                          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <DollarSign className="h-5 w-5 text-primary mb-2" />
                      <span className="text-xs font-bold block">PayPal</span>
                      <span className="text-[10px] text-muted-foreground">Global Wallet</span>
                    </button>
                  </div>
                </CardContent>
              </Card>

              {user && user.loyaltyPoints > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                      <Award className="h-5 w-5 text-primary" /> Loyalty & Rewards
                    </CardTitle>
                    <CardDescription>
                      You have <span className="font-bold text-primary">{user.loyaltyPoints}</span> loyalty points.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      Redeem points for an instant discount. 10 points = ₹1 discount.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="text-xs text-muted-foreground">Points to redeem (Max: {maxRedeemable})</label>
                        <Input
                          type="number"
                          max={maxRedeemable}
                          min={0}
                          value={redeemPoints}
                          onChange={(e) =>
                            setRedeemPoints(Math.min(maxRedeemable, Math.max(0, parseInt(e.target.value) || 0)))
                          }
                          className="h-9 mt-1"
                        />
                      </div>
                      <div className="bg-primary/5 border border-primary/20 p-3 rounded-md text-center shrink-0">
                        <span className="text-xs text-muted-foreground block">Instant Discount</span>
                        <span className="text-lg font-bold text-primary">₹{pointDiscount}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                    <ShoppingBag className="h-5 w-5 text-primary" /> Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                    {cartItems.map((item) => (
                      <div key={item._id} className="flex justify-between items-center text-sm gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold truncate">{item.productId?.title}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                        </div>
                        <span className="font-bold">₹{(item.productId?.price || 0) * item.qty}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-border pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="font-medium text-foreground">₹{subtotal}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="font-medium text-foreground">
                        {shipping === 0 ? "Free" : `₹${shipping}`}
                      </span>
                    </div>
                    {pointDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>Loyalty Discount</span>
                        <span>-₹{pointDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-3 border-t border-border mt-3">
                      <span>Grand Total</span>
                      <span className="text-primary font-bold">₹{total}</span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 mt-4 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-700 text-white font-bold py-6 shadow-lg cursor-pointer transition-all hover:scale-[1.01]"
                    size="lg"
                  >
                    {paymentMethod === "qr" && <QrCode className="h-5 w-5" />}
                    {paymentMethod === "card" && <CreditCard className="h-5 w-5" />}
                    {paymentMethod === "paypal" && <DollarSign className="h-5 w-5" />}
                    {paymentMethod === "cod" && <Truck className="h-5 w-5" />}
                    <span>{loading ? "Processing..." : `Place Order (₹${total})`}</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </form>
        )}

        {/* QR Scanner & Order Success Modal */}
        <CheckoutQrModal
          open={qrModalOpen}
          onOpenChange={setQrModalOpen}
          orderId={confirmedOrderId}
          amount={total}
          items={cartItems.map((ci) => ({
            name: ci.productId?.title || "Handcrafted Card",
            price: ci.productId?.price || 0,
            qty: ci.qty,
            image: ci.productId?.images?.[0],
          }))}
          paymentMethod={paymentMethod}
          onPaymentComplete={handlePaymentComplete}
        />
      </main>
      <Footer />
    </div>
  );
}
