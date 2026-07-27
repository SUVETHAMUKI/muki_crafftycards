"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, Sparkles, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";

interface AuthSlidingFormProps {
  initialMode?: "login" | "register";
}

export function AuthSlidingForm({ initialMode = "login" }: AuthSlidingFormProps) {
  const router = useRouter();
  const { setUser } = useAuthStore();

  const [isRegistering, setIsRegistering] = useState(initialMode === "register");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      setUser(data.user);
      router.push("/products");
      router.refresh();
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);

    try {
      const cleanUsername = (regName || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "_")
        .padEnd(3, "0")
        .slice(0, 15) + "_" + Math.floor(100 + Math.random() * 900);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          username: cleanUsername,
          email: regEmail,
          phone: regPhone || undefined,
          password: regPassword,
          role: "customer",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      setRegSuccess(true);
      setTimeout(() => {
        setIsRegistering(false);
        setLoginEmail(regEmail);
        setRegSuccess(false);
      }, 1500);
    } catch (err: any) {
      setRegError(err.message);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-pink-50/40 via-purple-50/30 to-indigo-50/40 dark:from-muted/20 dark:to-muted/40">
      <Header />

      {/* CSS for official muki_cards sliding toggle animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        .sliding-container {
          position: relative;
          width: 880px;
          max-width: 95vw;
          min-height: 640px;
          background: var(--card);
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          transition: all 0.5s ease-in-out;
        }

        .form-panel {
          position: absolute;
          top: 0;
          height: 100%;
          width: 50%;
          transition: all 0.6s ease-in-out;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 40px;
        }

        /* When LOGIN mode is active (isRegistering = false) */
        .login-panel {
          left: 0;
          opacity: 1;
          z-index: 2;
        }
        .register-panel {
          left: 0;
          opacity: 0;
          z-index: 1;
        }

        /* When REGISTER mode is active (isRegistering = true) */
        .sliding-container.active .login-panel {
          transform: translateX(100%);
          opacity: 0;
          z-index: 1;
        }
        .sliding-container.active .register-panel {
          transform: translateX(100%);
          opacity: 1;
          z-index: 5;
        }

        /* Animated Curved Toggle Overlay */
        .toggle-overlay-box {
          position: absolute;
          top: 0;
          left: 50%;
          width: 50%;
          height: 100%;
          overflow: hidden;
          transition: transform 0.6s ease-in-out;
          z-index: 10;
          border-radius: 0 30px 30px 0;
        }
        .sliding-container.active .toggle-overlay-box {
          transform: translateX(-100%);
          border-radius: 30px 0 0 30px;
        }

        .toggle-overlay {
          background: linear-gradient(135deg, #df1f7e, #9333ea, #4f46e5);
          color: #ffffff;
          position: relative;
          left: -100%;
          height: 100%;
          width: 200%;
          transform: translateX(0);
          transition: transform 0.6s ease-in-out;
        }

        .sliding-container.active .toggle-overlay {
          transform: translateX(50%);
        }

        .toggle-panel-content {
          position: absolute;
          width: 50%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 30px;
          text-align: center;
          top: 0;
          transition: transform 0.6s ease-in-out;
        }

        .toggle-left-content {
          transform: translateX(-20%);
          left: 0;
        }

        .sliding-container.active .toggle-left-content {
          transform: translateX(0);
        }

        .toggle-right-content {
          right: 0;
          transform: translateX(0);
        }

        .sliding-container.active .toggle-right-content {
          transform: translateX(20%);
        }

        @media screen and (max-width: 768px) {
          .sliding-container {
            min-height: 820px;
            width: 95vw;
          }
          .form-panel {
            width: 100% !important;
            height: 60% !important;
            padding: 24px !important;
            bottom: 0;
            top: auto;
          }
          .toggle-overlay-box {
            width: 100% !important;
            height: 40% !important;
            left: 0 !important;
            top: 0 !important;
            border-radius: 30px 30px 0 0 !important;
          }
          .sliding-container.active .toggle-overlay-box {
            transform: translateY(150%) !important;
            border-radius: 0 0 30px 30px !important;
          }
        }

        .rainbow-btn {
          position: relative;
          background: #df1f7e;
          color: #fff;
          font-weight: 700;
          transition: all 0.3s ease;
          border-radius: 12px;
        }
        .rainbow-btn::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          background: linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7, #5c7cfa, #339af0, #22b8cf, #20c997, #51cf66, #94d82d, #fcc419, #ff922b);
          background-size: 400%;
          z-index: -1;
          filter: blur(8px);
          opacity: 0;
          border-radius: 14px;
          transition: all 0.3s ease;
        }
        .rainbow-btn:hover::before {
          opacity: 1;
        }
        .rainbow-btn:hover {
          transform: translateY(-2px);
        }
      ` }} />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className={`sliding-container border border-border/80 ${isRegistering ? "active" : ""}`}>
          
          {/* LOGIN FORM PANEL (Left by default) */}
          <div className="form-panel login-panel bg-card text-foreground">
            <form onSubmit={handleLoginSubmit} className="space-y-4 max-w-sm mx-auto w-full">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight">Welcome Back</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Log in to Muki Crafty Cards to order and personalize
                </p>
              </div>

              {loginError && (
                <div className="bg-destructive/15 text-destructive text-xs p-3 rounded-xl border border-destructive/20 font-medium">
                  {loginError}
                </div>
              )}

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-10 pr-4 py-3 bg-muted/40 border border-border/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-muted-foreground">
                  <input type="checkbox" className="rounded border-border text-primary" defaultChecked />
                  <span>Remember me</span>
                </label>
                <Link href="#" className="text-primary hover:underline font-semibold">
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="rainbow-btn w-full py-3.5 px-6 shadow-md cursor-pointer font-bold text-sm"
              >
                {loginLoading ? "Authenticating..." : "Login to Account"}
              </button>
            </form>
          </div>

          {/* REGISTRATION FORM PANEL (Sliding right to left) */}
          <div className="form-panel register-panel bg-card text-foreground">
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-w-sm mx-auto w-full">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-extrabold tracking-tight">Create Account</h1>
                <p className="text-xs text-muted-foreground mt-1">
                  Join Muki Crafty Cards to earn 100 welcome loyalty points
                </p>
              </div>

              {regError && (
                <div className="bg-destructive/15 text-destructive text-xs p-3 rounded-xl border border-destructive/20 font-medium">
                  {regError}
                </div>
              )}

              {regSuccess && (
                <div className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs p-3 rounded-xl border border-emerald-500/20 font-bold flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>Successfully registered! Redirecting to login...</span>
                </div>
              )}

              <div className="space-y-2.5">
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Phone Number (optional)"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Create Password"
                    className="w-full pl-10 pr-4 py-2.5 bg-muted/40 border border-border/80 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className="rainbow-btn w-full py-3.5 px-6 shadow-md cursor-pointer font-bold text-sm mt-1"
              >
                {regLoading ? "Creating Account..." : "Register Account"}
              </button>

              <p className="text-[11px] text-center text-muted-foreground pt-1">
                By registering, you agree to our Terms of Craftsmanship & Privacy.
              </p>
            </form>
          </div>

          {/* ANIMATED CURVED TOGGLE OVERLAY PANEL */}
          <div className="toggle-overlay-box">
            <div className="toggle-overlay">
              
              {/* Left Content (Visible when registering -> prompt to switch to Login) */}
              <div className="toggle-panel-content toggle-left-content">
                <img
                  src="/logo.png"
                  alt="Muki Crafty Cards Logo"
                  className="w-24 h-24 object-contain mx-auto mb-3 drop-shadow-lg transform hover:rotate-6 transition-transform duration-500"
                />
                <h2 className="text-3xl font-black tracking-tight mb-2">Welcome Back!</h2>
                <p className="text-sm text-white/90 font-light max-w-xs mb-6">
                  Already have an account with us? Sign in with your email to access your saved wishlist and cart.
                </p>
                <button
                  type="button"
                  onClick={() => setIsRegistering(false)}
                  className="px-8 py-3 bg-transparent hover:bg-white/10 text-white border-2 border-white font-extrabold rounded-full transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                >
                  Sign In / Login
                </button>
              </div>

              {/* Right Content (Visible when logging in -> prompt to switch to Register) */}
              <div className="toggle-panel-content toggle-right-content">
                <img
                  src="/logo.png"
                  alt="Muki Crafty Cards Logo"
                  className="w-24 h-24 object-contain mx-auto mb-3 drop-shadow-lg transform hover:rotate-6 transition-transform duration-500"
                />
                <h2 className="text-3xl font-black tracking-tight mb-2">Hello, Welcome!</h2>
                <p className="text-sm text-white/90 font-light max-w-xs mb-6">
                  Don&apos;t have an account yet? Register now to claim 100 free artisan loyalty points and MUKI20 discounts!
                </p>
                <button
                  type="button"
                  onClick={() => setIsRegistering(true)}
                  className="px-8 py-3 bg-transparent hover:bg-white/10 text-white border-2 border-white font-extrabold rounded-full transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg"
                >
                  Register Account
                </button>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
