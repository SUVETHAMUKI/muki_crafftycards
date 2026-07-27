"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Sparkles, Clock, CheckCircle, XCircle, Landmark } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/Table";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface Product {
  _id: string;
  title: string;
  price: number;
  category: string;
  stock: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export default function ArtisanPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, loading: authLoading, checkAuth } = useAuthStore();

  const [activeSubTab, setActiveSubTab] = useState<"designs" | "create" | "payouts">("designs");

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Birthday");
  const [stock, setStock] = useState("50");
  const [tagsInput, setTagsInput] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [aiLoading, setAiLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    checkAuth().then(() => {
      if (!authLoading && (!user || user.role !== "artisan")) {
        router.push("/products");
      }
    });
  }, [user, authLoading, checkAuth, router]);

  const { data: productsData, isLoading: productsLoading } = useQuery<{ products: Product[] }>({
    queryKey: ["artisan-products", user?._id],
    queryFn: async () => {
      const res = await fetch(`/api/products?artisanId=${user?._id}&status=`);
      if (!res.ok) throw new Error("Failed to fetch products");
      return res.json();
    },
    enabled: !!user?._id,
  });

  const products = productsData?.products || [];

  const handleAiDescribe = async () => {
    if (!title) {
      alert("Please fill in the card title first.");
      return;
    }
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          category,
          tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate AI description");
      setDescription(data.description);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          category,
          stock: parseInt(stock),
          tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
          images: [
            imageUrl || "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=60",
          ],
          isPersonalizable: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");

      alert("Design submitted successfully! It is now pending admin moderation.");

      setTitle("");
      setPrice("");
      setDescription("");
      setTagsInput("");
      setImageUrl("");
      setActiveSubTab("designs");
      queryClient.invalidateQueries({ queryKey: ["artisan-products"] });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (authLoading || productsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="animate-pulse">Loading artisan dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8 border-b border-border pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Artisan Design Studio</h1>
            <p className="text-muted-foreground mt-1">Manage your greeting card listings and payout earnings</p>
          </div>
          <Button onClick={() => setActiveSubTab("create")} className="flex items-center gap-1.5">
            <PlusCircle className="h-4.5 w-4.5" /> Submit New Design
          </Button>
        </div>

        <div className="flex gap-2 mb-8 border-b border-border pb-px">
          <button
            onClick={() => setActiveSubTab("designs")}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "designs"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            My Designs
          </button>
          <button
            onClick={() => setActiveSubTab("create")}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "create"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Submit New Design
          </button>
          <button
            onClick={() => setActiveSubTab("payouts")}
            className={`pb-2.5 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeSubTab === "payouts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Payouts & Earnings
          </button>
        </div>

        {activeSubTab === "designs" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Your Greeting Card Portfolio</CardTitle>
                <CardDescription>View status of your submitted card designs</CardDescription>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    You haven't submitted any card designs yet.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted On</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((prod) => (
                        <TableRow key={prod._id}>
                          <TableCell className="font-semibold">{prod.title}</TableCell>
                          <TableCell className="capitalize">{prod.category}</TableCell>
                          <TableCell>₹{prod.price}</TableCell>
                          <TableCell>{prod.stock}</TableCell>
                          <TableCell>
                            {prod.status === "approved" && (
                              <Badge variant="success" className="flex w-fit items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Approved
                              </Badge>
                            )}
                            {prod.status === "pending" && (
                              <Badge variant="warning" className="flex w-fit items-center gap-1">
                                <Clock className="h-3 w-3" /> Pending Review
                              </Badge>
                            )}
                            {prod.status === "rejected" && (
                              <Badge variant="destructive" className="flex w-fit items-center gap-1">
                                <XCircle className="h-3 w-3" /> Rejected
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>{new Date(prod.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeSubTab === "create" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Create New Card Template</CardTitle>
              <CardDescription>Submit a greeting card design for moderation</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateProduct}>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="prod-title">
                      Card Name/Title
                    </label>
                    <Input
                      id="prod-title"
                      placeholder="E.g., Pastel Birthday Balloons"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="prod-price">
                      Selling Price (₹)
                    </label>
                    <Input
                      id="prod-price"
                      type="number"
                      placeholder="150"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="prod-cat">
                      Category
                    </label>
                    <Select id="prod-cat" value={category} onChange={(e) => setCategory(e.target.value)}>
                      <option value="Birthday">Birthday</option>
                      <option value="Anniversary">Anniversary</option>
                      <option value="Holiday">Holiday</option>
                      <option value="Thank You">Thank You</option>
                      <option value="Love">Love</option>
                      <option value="Sympathy">Sympathy</option>
                      <option value="Get Well">Get Well</option>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="prod-stock">
                      Initial Stock
                    </label>
                    <Input
                      id="prod-stock"
                      type="number"
                      placeholder="100"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="prod-tags">
                    Search Tags (comma separated)
                  </label>
                  <Input
                    id="prod-tags"
                    placeholder="cute, watercolor, balloons, floral"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="prod-image">
                    Card Background Template Image URL
                  </label>
                  <Input
                    id="prod-image"
                    placeholder="E.g., https://images.unsplash.com/... or leave blank for a fallback template"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium" htmlFor="prod-desc">
                      Product Description
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAiDescribe}
                      disabled={aiLoading}
                      className="flex items-center gap-1 text-xs border-primary text-primary hover:bg-primary/5 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> {aiLoading ? "Drafting..." : "Gemini AI Draft"}
                    </Button>
                  </div>
                  <Textarea
                    id="prod-desc"
                    rows={4}
                    placeholder="Describe your design, the card texture, colors, and styling..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" type="submit" disabled={formLoading}>
                  {formLoading ? "Submitting..." : "Submit Card Design"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {activeSubTab === "payouts" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 font-semibold font-semibold">
                  <Landmark className="h-5 w-5 text-primary" /> Earnings Ledger
                </CardTitle>
                <CardDescription>Your commission structure and payout configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-b border-border pb-3">
                  <span className="text-xs text-muted-foreground block">Commission Rate</span>
                  <span className="text-2xl font-bold text-foreground">10% per sale</span>
                </div>
                <div className="border-b border-border pb-3">
                  <span className="text-xs text-muted-foreground block">Pending Commission Earnings</span>
                  <span className="text-2xl font-bold text-primary">₹0</span>
                </div>
                <Button variant="outline" className="w-full" disabled>
                  Request Commission Payout
                </Button>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Payout Transactions Log</CardTitle>
                <CardDescription>History of commission withdrawal requests</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground text-center py-8">
                  No payout transactions recorded. Withdrawals will appear here when commission claims are processed.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
