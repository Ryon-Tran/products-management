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
    <article className="group relative overflow-hidden rounded-md bg-white shadow transition-transform hover:shadow-lg hover:scale-[1.02] p-4 flex flex-col">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-gray-100 bg-slate-50">
          {product.image ? (
            <img src={product.image} alt={product.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400 text-xs">
              <span className="inline-block bg-gray-100 rounded p-2">Không có ảnh</span>
            </div>
          )}
          <div className="absolute left-2 top-2 rounded bg-green-600/90 px-3 py-1 text-sm font-bold text-white shadow">{priceVND}</div>
        </div>
        <div className="px-1 py-3">
          <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[2.5em]">{product.title}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Star size={14} className="text-yellow-500" />
            <span>4.7</span>
          </div>
        </div>
      </Link>
      <div className="flex gap-2 border-t pt-3 mt-auto">
        <Button
          size="sm"
          className="flex-1 font-medium"
          disabled={loading}
          onClick={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            setLoading(true);
            const start = Date.now();
            try {
              let quantity = 1;
              try {
                const cart = await cartApi.get();
                if (cart && Array.isArray(cart.items)) {
                  const found = cart.items.find((it: any) => it.product_id === product.id);
                  if (found) quantity = (found.quantity || 1) + 1;
                }
              } catch {}
              await cartApi.addOrUpdateItem({ product_id: product.id, quantity });
              toast.success("Đã thêm vào giỏ hàng!", { duration: 1200 });
              try { window.dispatchEvent(new Event("pm.cart")); } catch (_) {}
            } catch (err) {
              toast.error("Thêm vào giỏ hàng thất bại!", { duration: 1200 });
            } finally {
              const elapsed = Date.now() - start;
              const minWait = 400, maxWait = 1200;
              if (elapsed < minWait) {
                setTimeout(() => setLoading(false), minWait - elapsed);
              } else if (elapsed > maxWait) {
                setLoading(false);
              } else {
                setTimeout(() => setLoading(false), maxWait - elapsed);
              }
            }
          }}
        >
          {loading ? (
            <span className="animate-pulse">Đang thêm...</span>
          ) : (
            <span>Thêm vào giỏ</span>
          )}
        </Button>
        <Link href={`/product/${product.id}`} className="rounded border px-3 py-1 text-xs font-medium hover:bg-gray-50 transition">Chi tiết</Link>
      </div>
    </article>
  );
}
