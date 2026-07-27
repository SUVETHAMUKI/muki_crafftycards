"use client";

export interface UniversalWishlistItem {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
}

const STORAGE_KEY = "muki_universal_wishlist";

export function getLocalWishlist(): UniversalWishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalWishlist(items: UniversalWishlistItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("wishlist_updated"));
  } catch (e) {
    console.error("Error saving local wishlist:", e);
  }
}

export function isInWishlistUniversal(productId: string): boolean {
  const current = getLocalWishlist();
  return current.some((item) => item._id === productId);
}

export async function toggleWishlistUniversal(product: {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
}): Promise<{ wishlisted: boolean; items: UniversalWishlistItem[] }> {
  const current = getLocalWishlist();
  const index = current.findIndex((item) => item._id === product._id);
  let wishlisted = false;

  if (index > -1) {
    current.splice(index, 1);
    wishlisted = false;
  } else {
    current.push({
      _id: product._id,
      title: product.title,
      price: product.price,
      images: product.images || ["/product1.jpg"],
      category: product.category || "Greeting Cards",
    });
    wishlisted = true;
  }

  saveLocalWishlist(current);

  // Sync to API if user is logged in
  try {
    if (wishlisted) {
      await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
    } else {
      await fetch(`/api/wishlist?productId=${product._id}`, {
        method: "DELETE",
      });
    }
  } catch (err) {
    // Ignore offline/guest sync errors
  }

  return { wishlisted, items: current };
}
