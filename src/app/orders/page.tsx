"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ShoppingBag, RefreshCw, CheckCircle, Package, Truck, Check, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface Order {
  _id: string;
  total: number;
  paymentStatus: string;
  orderStatus: "pending" | "processed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: {
    productId: {
      title: string;
      price: number;
    };
    qty: number;
    price: number;
  }[];
}

function OrdersPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading, checkAuth } = useAuthStore();
  const highlightedOrderId = searchParams.get("orderId") || "";
  const [selectedOrderId, setSelectedOrderId] = useState<string>(highlightedOrderId);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const { data: ordersData, isLoading: ordersLoading } = useQuery<{ orders: Order[] }>({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
    enabled: !!user,
  });

  const orders = ordersData?.orders || [];

  const { data: selectedOrderData, isLoading: selectedOrderLoading } = useQuery<{ order: Order }>({
    queryKey: ["order-details", selectedOrderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${selectedOrderId}`);
      if (!res.ok) throw new Error("Failed to fetch order details");
      return res.json();
    },
    enabled: !!selectedOrderId,
    refetchInterval: 10000,
  });

  const selectedOrder = selectedOrderData?.order;

  const getTrackingSteps = (status: string) => {
    const steps = [
      {
        key: "pending",
        label: "Order Placed",
        desc: "Your payment has been received and order created.",
        icon: ShoppingBag,
      },
      {
        key: "processed",
        label: "Processed",
        desc: "The artisan has printed and packaged your cards.",
        icon: Package,
      },
      {
        key: "shipped",
        label: "Shipped",
        desc: "Your package is in transit with our logistics partner.",
        icon: Truck,
      },
      {
        key: "delivered",
        label: "Delivered",
        desc: "The greeting cards have been delivered to your address.",
        icon: CheckCircle,
      },
    ];

    const statusIndex = steps.findIndex((step) => step.key === status);

    return steps.map((step, idx) => ({
      ...step,
      completed: status === "cancelled" ? false : idx <= statusIndex,
      active: status === "cancelled" ? false : idx === statusIndex,
    }));
  };

  if (authLoading || (ordersLoading && !selectedOrderId)) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <p className="animate-pulse">Loading order history...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-1/3 space-y-4">
            <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" /> Purchase History
            </h2>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground font-light">You haven't placed any orders yet.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {orders.map((ord) => (
                  <Card
                    key={ord._id}
                    className={`cursor-pointer border hover:border-primary/50 transition-colors ${
                      selectedOrderId === ord._id ? "border-primary bg-primary/5" : "border-border"
                    }`}
                    onClick={() => setSelectedOrderId(ord._id)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono">{ord._id.substring(0, 10)}...</span>
                        <span className="text-muted-foreground">{new Date(ord.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-bold">₹{ord.total}</span>
                        <Badge variant={ord.orderStatus === "delivered" ? "success" : "secondary"}>
                          {ord.orderStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            {selectedOrderId ? (
              selectedOrderLoading ? (
                <p className="animate-pulse">Loading live tracking details...</p>
              ) : selectedOrder ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader className="flex flex-row justify-between items-start border-b border-border pb-4">
                      <div>
                        <CardTitle className="text-lg font-semibold">Order Details</CardTitle>
                        <CardDescription className="font-mono text-xs">ID: {selectedOrder._id}</CardDescription>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold text-primary">₹{selectedOrder.total}</span>
                        <div className="text-xs text-muted-foreground mt-1 capitalize font-light">
                          Payment: {selectedOrder.paymentStatus}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Items Ordered</h4>
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-muted-foreground font-light">
                              {item.productId?.title || "Greeting Card"} x {item.qty}
                            </span>
                            <span className="font-medium">₹{item.price * item.qty}</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-border pt-4">
                        <h4 className="text-sm font-semibold mb-1">Shipping Destination</h4>
                        <p className="text-sm text-muted-foreground font-light">{selectedOrder.shippingAddress.name}</p>
                        <p className="text-xs text-muted-foreground font-light">
                          {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city},{" "}
                          {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.zipCode}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-semibold">Live Shipment Tracker</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <RefreshCw className="h-3 w-3 animate-spin" /> Auto-refreshing status every 10 seconds
                        </CardDescription>
                      </div>
                      {selectedOrder.orderStatus === "cancelled" && <Badge variant="destructive">Cancelled</Badge>}
                    </CardHeader>
                    <CardContent className="pt-4">
                      {selectedOrder.orderStatus === "cancelled" ? (
                        <div className="text-center py-6 text-destructive space-y-2">
                          <HelpCircle className="h-10 w-10 mx-auto" />
                          <p className="text-sm font-semibold">This order has been cancelled.</p>
                        </div>
                      ) : (
                        <div className="space-y-8 relative before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                          {getTrackingSteps(selectedOrder.orderStatus).map((step, idx) => {
                            const Icon = step.icon;
                            return (
                              <div key={idx} className="flex items-start gap-4 relative z-10">
                                <div
                                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                                    step.completed
                                      ? "bg-primary border-primary text-primary-foreground shadow"
                                      : "bg-background border-border text-muted-foreground"
                                  } ${step.active ? "ring-4 ring-primary/20" : ""}`}
                                >
                                  {step.completed && !step.active ? (
                                    <Check className="h-5 w-5" />
                                  ) : (
                                    <Icon className="h-5 w-5" />
                                  )}
                                </div>
                                <div className="space-y-1">
                                  <h4
                                    className={`text-sm font-semibold ${
                                      step.completed ? "text-foreground" : "text-muted-foreground"
                                    }`}
                                  >
                                    {step.label}
                                  </h4>
                                  <p className="text-xs text-muted-foreground leading-relaxed font-light">
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <p className="text-muted-foreground font-light">Order details could not be found.</p>
              )
            ) : (
              <div className="flex flex-col justify-center items-center h-64 border border-dashed border-border rounded-lg bg-card/50">
                <HelpCircle className="h-10 w-10 text-muted-foreground/30 mb-2" />
                <p className="text-sm font-semibold text-muted-foreground">Select an order to track</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-light">
                  Click any order in your purchase list to view live shipping updates.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex justify-center items-center">
          <p className="animate-pulse text-muted-foreground text-sm font-light">Loading order tracking...</p>
        </main>
        <Footer />
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  );
}
