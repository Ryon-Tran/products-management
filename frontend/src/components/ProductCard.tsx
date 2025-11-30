"use client";

import Link from "next/link";
import { Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cart as cartApi } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

export default function ProductCard({ product }: { product: { id: number; title: string; price: string | number; image?: string } }) {
    const [loading, setLoading] = useState(false);
  // Format price as VND
  let priceVND = "";
  if (typeof product.price === "number") {
    priceVND = product.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
  } else if (typeof product.price === "string" && product.price !== "") {
    const num = Number(product.price);
    priceVND = !isNaN(num)
      ? num.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
      : "";
  } else {
    priceVND = "Liên hệ";
  }

  return (
    <article className="group relative overflow-hidden rounded-lg bg-white shadow-sm transition-transform hover:shadow-md hover:scale-[1.01] p-3">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
          {product.image ? (
            <img src={product.image} alt={product.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">No image</div>
          )}
          <div className="absolute left-2 top-2 rounded bg-[color:var(--color-accent)]/95 px-2 py-0.5 text-xs font-semibold text-white">{priceVND}</div>
        </div>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[color:var(--color-text)] line-clamp-2">{product.title}</h3>
            <div className="flex items-center gap-1 text-xs text-[color:var(--color-muted)]">
              <Star size={12} className="text-yellow-500" />
              <span>4.7</span>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex gap-2 border-t px-3 py-2">
        <Button
          size="sm"
          className="flex-1"
          disabled={loading}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLoading(true);
            try {
              // Lấy giỏ hàng hiện tại
              let quantity = 1;
              try {
                const cart = await cartApi.get();
                if (cart && Array.isArray(cart.items)) {
                  const found = cart.items.find((it: any) => it.product_id === product.id);
                  if (found) quantity = (found.quantity || 1) + 1;
                }
              } catch {}
              await cartApi.addOrUpdateItem({ product_id: product.id, quantity });
              toast.success("Đã thêm vào giỏ hàng!");
              try { window.dispatchEvent(new Event("pm.cart")); } catch (_) {}
            } catch (err) {
              toast.error("Thêm vào giỏ hàng thất bại!");
            } finally {
              setLoading(false);
            }
          }}
        >
          {loading ? "Đang thêm..." : "Thêm vào giỏ"}
        </Button>
        <Link href={`/product/${product.id}`} className="rounded border px-2 py-1 text-xs">Chi tiết</Link>
      </div>
    </article>
  );
}
