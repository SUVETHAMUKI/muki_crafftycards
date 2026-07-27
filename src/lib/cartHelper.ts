"use client";

export interface UniversalCartItem {
  _id: string;
  productId: {
    _id: string;
    title: string;
    price: number;
    images: string[];
    stock: number;
    category: string;
  };
  qty: number;
  personalization?: {
    customImage: string;
    canvasJson: string;
  };
}

const STORAGE_KEY = "muki_universal_cart";

export function getLocalCart(): UniversalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveLocalCart(items: UniversalCartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("cart_updated"));
  } catch (e) {
    console.error("Error saving local cart:", e);
  }
}

export async function addToCartUniversal(product: {
  _id: string;
  title: string;
  price: number;
  images: string[];
  category: string;
  stock?: number;
}, qty: number = 1, personalization?: { customImage: string; canvasJson: string }): Promise<UniversalCartItem[]> {
  const current = getLocalCart();
  const existingIdx = current.findIndex(
    (item) => item.productId._id === product._id && !item.personalization && !personalization
  );

  if (existingIdx > -1) {
    current[existingIdx].qty += qty;
  } else {
    current.push({
      _id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      productId: {
        _id: product._id,
        title: product.title,
        price: product.price,
        images: product.images || ["/product1.jpg"],
        stock: product.stock || 50,
        category: product.category || "Greeting Cards",
      },
      qty,
      personalization,
    });
  }

  saveLocalCart(current);

  // Also try syncing to backend if user is logged in
  try {
    await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId: product._id,
        qty,
        personalization,
      }),
    });
  } catch (err) {
    // Ignore offline/guest sync errors
  }

  return current;
}

export function removeCartItemUniversal(itemId: string): UniversalCartItem[] {
  const current = getLocalCart();
  const updated = current.filter((item) => item._id !== itemId && item.productId._id !== itemId);
  saveLocalCart(updated);

  // Attempt backend delete
  fetch(`/api/cart?itemId=${itemId}`, { method: "DELETE" }).catch(() => {});
  return updated;
}

export function updateCartQtyUniversal(itemId: string, qty: number): UniversalCartItem[] {
  const current = getLocalCart();
  const updated = current.map((item) => {
    if (item._id === itemId || item.productId._id === itemId) {
      return { ...item, qty: Math.max(1, qty) };
    }
    return item;
  });
  saveLocalCart(updated);

  fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, qty }),
  }).catch(() => {});

  return updated;
}

export function clearCartUniversal() {
  saveLocalCart([]);
  fetch("/api/cart?clear=true", { method: "DELETE" }).catch(() => {});
}
