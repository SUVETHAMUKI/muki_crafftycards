"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, ShieldAlert, ShoppingCart, UserCheck, Package, DollarSign } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface StatsData {
  stats: {
    users: number;
    products: number;
    orders: number;
    revenue: number;
  };
  categoryStats: { category: string; count: number }[];
  orderStatusStats: { status: string; count: number }[];
  revenueTrends: { date: string; revenue: number }[];
}

interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  stock: number;
  status: "pending" | "approved" | "rejected";
  artisanId: {
    name: string;
    username: string;
  };
}

interface Order {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  total: number;
  paymentStatus: string;
  orderStatus: "pending" | "processed" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading, checkAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<"analytics" | "moderation" | "orders">("analytics");

  useEffect(() => {
    checkAuth().then(() => {
      if (!authLoading && (!user || user.role !== "admin")) {
        router.push("/products");
      }
    });
  }, [user, authLoading, checkAuth, router]);

  const { data: statsData, isLoading: statsLoading } = useQuery<StatsData>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
    enabled: true,
  });

  const { data: moderationData } = useQuery<{ products: Product[] }>({
    queryKey: ["admin-moderation-products"],
    queryFn: async () => {
      const res = await fetch("/api/products?status=pending");
      if (!res.ok) throw new Error("Failed to fetch pending products");
      return res.json();
    },
    enabled: true,
  });

  const { data: ordersData } = useQuery<{ orders: Order[] }>({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders/all");
      if (res.ok) {
        return res.json();
      }
      return { orders: [] };
    },
    enabled: true,
  });

  const pendingProducts = moderationData?.products || [];
  const orders = ordersData?.orders || [];

  const moderateProductMutation = useMutation({
    mutationFn: async ({ productId, status }: { productId: string; status: "approved" | "rejected" }) => {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to moderate product");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-moderation-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      alert("Product status updated successfully!");
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update order status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      alert("Order status updated successfully!");
    },
  });

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="animate-pulse">Loading admin dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const stats = statsData?.stats || { users: 0, products: 0, orders: 0, revenue: 0 };
  const COLORS = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-border pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Administration Board</h1>
            <p className="text-muted-foreground mt-1">Monitor site statistics, approve artisan designs, and track orders</p>
          </div>
          <Button
            onClick={async () => {
              const res = await fetch("/api/admin/migrate", { method: "POST" });
              const data = await res.json();
              alert(data.message || "Migration complete!");
              queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
              queryClient.invalidateQueries({ queryKey: ["admin-products"] });
              queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl shadow cursor-pointer self-start sm:self-auto"
          >
            🚀 Seed / Sync MongoDB Atlas DB
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <UserCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Total Users</span>
                <span className="text-2xl font-bold">{stats.users}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Total Products</span>
                <span className="text-2xl font-bold">{stats.products}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Total Orders</span>
                <span className="text-2xl font-bold">{stats.orders}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground block font-semibold">Net Revenue</span>
                <span className="text-2xl font-bold">₹{stats.revenue}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border pb-px">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "analytics"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab("moderation")}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "moderation"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Moderation Queue ({pendingProducts.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Manage Orders
          </button>
        </div>

        {activeTab === "analytics" && statsData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-1.5 font-semibold">
                  Revenue Trends (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsData.revenueTrends.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-20">No revenue data recorded for this week.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={statsData.revenueTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-1.5 font-semibold">
                  Category Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {statsData.categoryStats.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-20">No category statistics available.</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={240} className="max-w-[240px]">
                      <PieChart>
                        <Pie
                          data={statsData.categoryStats}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          {statsData.categoryStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 text-xs">
                      {statsData.categoryStats.map((entry, index) => (
                        <div key={entry.category} className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full shrink-0"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="capitalize">{entry.category}: {entry.count} designs</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "moderation" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Artisan Product Approval Queue</CardTitle>
              <CardDescription>Review and moderate submitted card templates</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingProducts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <ShieldAlert className="h-10 w-10 mx-auto text-primary/30" />
                  <p className="text-sm font-semibold">Moderation queue is empty</p>
                  <p className="text-xs">No pending artisan submissions need approval.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Design Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Artisan</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingProducts.map((prod) => (
                      <TableRow key={prod._id}>
                        <TableCell className="font-semibold">{prod.title}</TableCell>
                        <TableCell className="capitalize">{prod.category}</TableCell>
                        <TableCell>{prod.artisanId?.name || "Unknown Artisan"}</TableCell>
                        <TableCell>₹{prod.price}</TableCell>
                        <TableCell>{prod.stock}</TableCell>
                        <TableCell className="text-right flex justify-end gap-2">
                          <Button
                            variant="secondary"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white border-none p-1.5 h-8 w-8 rounded-full cursor-pointer"
                            onClick={() => moderateProductMutation.mutate({ productId: prod._id, status: "approved" })}
                            aria-label="Approve"
                          >
                            <Check className="h-4.5 w-4.5" />
                          </Button>
                          <Button
                            variant="destructive"
                            className="p-1.5 h-8 w-8 rounded-full cursor-pointer"
                            onClick={() => moderateProductMutation.mutate({ productId: prod._id, status: "rejected" })}
                            aria-label="Reject"
                          >
                            <X className="h-4.5 w-4.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "orders" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">System Order Shipments</CardTitle>
              <CardDescription>Track and adjust delivery status of paid orders</CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No orders have been recorded in the system yet.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Order Delivery Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((ord) => (
                      <TableRow key={ord._id}>
                        <TableCell className="font-mono text-xs">{ord._id}</TableCell>
                        <TableCell>{ord.userId?.name || "Customer"}</TableCell>
                        <TableCell>{new Date(ord.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>₹{ord.total}</TableCell>
                        <TableCell>
                          <Badge variant={ord.paymentStatus === "paid" ? "success" : "warning"}>
                            {ord.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={ord.orderStatus}
                            onChange={(e) => updateOrderStatusMutation.mutate({ orderId: ord._id, status: e.target.value })}
                            className="h-8 text-xs py-0 w-32 border border-border bg-background rounded"
                          >
                            <option value="pending">Pending</option>
                            <option value="processed">Processed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
