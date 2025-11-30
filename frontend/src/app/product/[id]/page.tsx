"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { products as productsApi } from "@/lib/api";
import { cart as cartApi } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [related, setRelated] = useState<any[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const data = await productsApi.get(Number(id));
        setProduct(data);
        // Fetch related products by category
        if (data?.category_id) {
          const rel = await productsApi.list({ category: data.category_id });
          setRelated(Array.isArray(rel) ? rel.filter((p: any) => p.id !== data.id) : []);
        } else {
          setRelated([]);
        }
      } catch (e) {
        setProduct(null);
        setRelated([]);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="site-container py-10 text-center text-muted">Đang tải sản phẩm...</div>;
  }
  if (!product) {
    return <div className="site-container py-10 text-center text-red-500">Không tìm thấy sản phẩm</div>;
  }

  const priceVND = typeof product.price === "number"
    ? product.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    : Number(product.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  return (
    <div className="site-container max-w-4xl mx-auto py-8">
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0 w-full md:w-1/2 flex items-center justify-center bg-slate-100 rounded-lg overflow-hidden aspect-[4/3]">
          {product.image_url ? (
            <img src={product.image_url} alt={product.title} className="h-full w-full object-contain" />
          ) : (
            <div className="text-slate-400 text-xs">No image</div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-[color:var(--color-text)]">{product.title}</h1>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg font-semibold text-[color:var(--color-accent)]">{priceVND}</span>
              <div className="flex items-center gap-1 text-sm text-[color:var(--color-muted)]">
                <Star size={16} className="text-yellow-500" />
                <span>4.7</span>
              </div>
            </div>
            <div className="mb-6 text-sm text-[color:var(--color-text)]">
              {product.description || "Không có mô tả cho sản phẩm này."}
            </div>
          </div>
          <div className="mt-6">
            <Button
              className="w-full py-3 text-base font-semibold bg-[color:var(--color-accent)] text-white rounded-lg hover:bg-[color:var(--color-accent-dark)] transition"
              disabled={cartLoading}
              onClick={async () => {
                setCartLoading(true);
                try {
                  await cartApi.addOrUpdateItem({ product_id: product.id, quantity: 1 });
                  toast.success("Đã thêm vào giỏ hàng!");
                } catch (e) {
                  toast.error("Thêm vào giỏ hàng thất bại!");
                } finally {
                  setCartLoading(false);
                }
              }}
            >
              {cartLoading ? "Đang thêm..." : "Thêm vào giỏ"}
            </Button>
          </div>
        </div>
      </div>
      {/* Related products section */}
      <div className="mt-12">
        <h2 className="text-lg font-bold mb-4 text-[color:var(--color-text)]">Sản phẩm liên quan</h2>
        {related.length === 0 ? (
          <div className="text-sm text-[color:var(--color-muted)]">Không có sản phẩm liên quan.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={{
                id: p.id,
                title: p.name,
                price: p.price,
                image: p.image_url
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
