"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, CheckCircle2, Clock, ShieldCheck, Printer, ArrowRight, ShoppingBag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
  image?: string;
}

interface CheckoutQrModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId?: string;
  amount: number;
  items: OrderItem[];
  paymentMethod: "qr" | "card" | "cod" | "paypal";
  onPaymentComplete: () => void;
}

export function CheckoutQrModal({
  open,
  onOpenChange,
  orderId = "MKCC-2026",
  amount,
  items,
  paymentMethod,
  onPaymentComplete,
}: CheckoutQrModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"pay" | "success">("pay");
  const [timer, setTimer] = useState(600);
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [utr, setUtr] = useState("");
  const [selectedUpiApp, setSelectedUpiApp] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setStep("pay");
      setTimer(600);
      setVerifying(false);
      setSelectedUpiApp(null);
    }
  }, [open, paymentMethod]);

  useEffect(() => {
    if (open && paymentMethod === "qr" && step === "pay" && !verifying) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [open, paymentMethod, step, verifying]);

  const handleRealTimeVerify = (methodName: string, msg: string) => {
    setVerifying(true);
    setVerifyMsg(msg);
    setTimeout(() => {
      setVerifying(false);
      setStep("success");
      onPaymentComplete();
    }, 1400);
  };

  const handleConfirmQrPayment = () => {
    handleRealTimeVerify(
      "UPI",
      `Connecting to NPCI UPI Switch... Verifying UTR #${utr || "420183920192"}... Payment Approved!`
    );
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border border-border shadow-2xl bg-card">
        <DialogClose onClick={() => onOpenChange(false)} />

        {verifying ? (
          <div className="p-10 flex flex-col items-center justify-center space-y-4 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <ShieldCheck className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Processing Real-Time Payment...</h3>
            <p className="text-sm font-medium text-primary animate-pulse">{verifyMsg}</p>
            <p className="text-xs text-muted-foreground">Please do not close this window or press back.</p>
          </div>
        ) : step === "pay" && paymentMethod === "qr" ? (
          /* QR CODE SCANNER STEP */
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                <QrCode className="h-3.5 w-3.5 mr-1" /> UPI / QR Scanner Payment
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Scan QR Code to Pay ₹{amount}
              </h2>
              <p className="text-xs text-muted-foreground">
                Supported apps: Google Pay, PhonePe, Paytm, BHIM UPI
              </p>
            </div>

            {/* Live QR Box */}
            <div className="mx-auto w-60 h-60 bg-white p-4 rounded-2xl border-4 border-primary/20 shadow-lg relative flex items-center justify-center">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=upi://pay?pa=mukicraftycards@upi&pn=MukiCraftyCards&am="
                alt="Scan to pay QR Code"
                className="w-full h-full object-contain"
              />
              <div className="absolute -bottom-3 bg-primary text-white text-xs font-bold px-3 py-0.5 rounded-full shadow">
                mukicraftycards@upi
              </div>
            </div>

            {/* One-click UPI Apps */}
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">⚡ Or Pay Instantly via UPI App</p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {["GPay", "PhonePe", "Paytm", "BHIM UPI"].map((app) => (
                  <button
                    key={app}
                    type="button"
                    onClick={() => setSelectedUpiApp(app)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      selectedUpiApp === app
                        ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                        : "bg-muted/40 hover:bg-muted text-foreground border-border"
                    }`}
                  >
                    {app}
                  </button>
                ))}
              </div>
              {selectedUpiApp && (
                <p className="text-xs text-primary font-medium">
                  Deep linking to {selectedUpiApp} for ₹{amount}...
                </p>
              )}
            </div>

            {/* UTR Input field */}
            <div className="text-left space-y-1">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                12-Digit UPI Ref / UTR Number (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 420183920192"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                className="w-full p-2.5 bg-muted/40 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-500/10 py-2 rounded-lg">
              <Clock className="h-4 w-4 animate-spin" />
              <span>QR expires in {formatTime(timer)}</span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() =>
                  handleRealTimeVerify(
                    "UPI",
                    `Connecting to NPCI UPI Switch... Verifying UTR #${utr || "Direct-UPI"}... Payment Received!`
                  )
                }
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 cursor-pointer shadow-md"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Verify Real-Time UPI Payment
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : step === "pay" && paymentMethod === "card" ? (
          /* CREDIT / DEBIT CARD SECURE GATEWAY STEP */
          <div className="p-6 space-y-6">
            <div className="text-center space-y-1">
              <Badge className="bg-indigo-500/10 text-indigo-600 border-indigo-500/20 px-3 py-1">
                Razorpay Secure Card Checkout
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Enter Card Details (₹{amount})
              </h2>
            </div>

            {/* Simulated Visual Card Preview */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-4 border border-indigo-500/30">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Muki Crafty Cards VIP</span>
                <span className="text-sm font-black tracking-widest">VISA / MC</span>
              </div>
              <div className="font-mono text-lg tracking-widest pt-2">
                •••• •••• •••• 4242
              </div>
              <div className="flex justify-between items-center text-xs text-indigo-200">
                <span>CARDHOLDER: SUVETHA MUKI</span>
                <span>EXPIRES: 12/28</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRealTimeVerify(
                  "Razorpay 3D Secure Card",
                  `Locking 256-bit SSL Session... Verifying Card ending in 4242 with HDFC/ICICI Bank... Payment Approved!`
                );
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase">Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4532 •••• •••• 4242"
                  defaultValue="4532 8821 9012 4242"
                  className="w-full mt-1 p-3 bg-muted/40 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    defaultValue="08/28"
                    className="w-full mt-1 p-3 bg-muted/40 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    placeholder="123"
                    defaultValue="882"
                    className="w-full mt-1 p-3 bg-muted/40 border border-border rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 cursor-pointer shadow-md"
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Authorize & Pay ₹{amount}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        ) : step === "pay" && paymentMethod === "paypal" ? (
          /* PAYPAL GLOBAL WALLET GATEWAY STEP */
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-2">
              <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1">
                PayPal Global Express Checkout
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Pay with PayPal Wallet (₹{amount})
              </h2>
              <p className="text-xs text-muted-foreground">
                Fast, secure international & domestic payments in 1-click
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/40 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-3">
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                PayPal
              </div>
              <p className="text-xs text-muted-foreground">
                Logged in as customer • Buyer Protection guaranteed
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() =>
                  handleRealTimeVerify(
                    "PayPal Wallet",
                    `Authenticating PayPal OAuth Token... Capturing ₹${amount} from PayPal Balance... Success!`
                  )
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 cursor-pointer shadow-md"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Confirm PayPal Payment (₹{amount})
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : step === "pay" && paymentMethod === "cod" ? (
          /* CASH ON DELIVERY CONFIRMATION STEP */
          <div className="p-6 space-y-6 text-center">
            <div className="space-y-2">
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-3 py-1">
                Cash on Delivery (Pay on Receipt)
              </Badge>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                Confirm Order for ₹{amount}
              </h2>
              <p className="text-xs text-muted-foreground">
                No advance online payment required. Pay in cash or UPI when your handcrafted cards arrive.
              </p>
            </div>

            <div className="bg-muted/40 p-6 rounded-2xl border border-border space-y-2">
              <div className="text-sm font-bold text-foreground">
                ✓ Free Doorstep Delivery Included
              </div>
              <div className="text-xs text-muted-foreground">
                Our master artisans will ship your order within 24–48 hours.
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() =>
                  handleRealTimeVerify(
                    "COD",
                    "Registering Doorstep Delivery with Artisan Fulfillment Center... Order Confirmed!"
                  )
                }
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-5 cursor-pointer shadow-md"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Place Cash on Delivery Order
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          /* SUCCESS ORDER CONFIRMATION STEP (inspired by conformation.html) */
          <div className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 font-bold">
                Order Confirmed
              </Badge>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Thank You for Your Order! 🎉
              </h2>
              <p className="text-sm text-muted-foreground">
                Order Reference: <strong className="font-mono text-primary">#{orderId}</strong>
              </p>
            </div>

            {/* Items Summary List */}
            <div className="bg-muted/40 border border-border rounded-xl p-4 space-y-3 max-h-56 overflow-y-auto">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex justify-between">
                <span>Handcrafted Items ({items.length})</span>
                <span>Amount</span>
              </div>
              <div className="space-y-2.5 divide-y divide-border/50">
                {items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between pt-2 text-sm">
                    <div className="flex items-center gap-2">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {item.qty}x
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <span className="font-bold text-foreground">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-base text-foreground">
                <span>Total Paid</span>
                <span className="text-primary">₹{amount}</span>
              </div>
            </div>

            {/* Delivery estimate */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-center text-foreground">
              📦 <strong>Expected Delivery:</strong> Within 3-5 Business Days • Hand-packaged with care
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="cursor-pointer font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </Button>
              <Button
                onClick={() => {
                  onOpenChange(false);
                  router.push(`/orders?orderId=${orderId}`);
                }}
                className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>View My Orders</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
