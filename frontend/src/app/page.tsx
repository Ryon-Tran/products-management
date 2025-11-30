"use client";

import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { list as fetchProducts } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchProducts();
        if (mounted && Array.isArray(res)) setProducts(res);
      } catch (err) {
        // keep fallback
        console.warn('Fetch products failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  const show = products;

  function ProductSkeleton({ count = 8 }: { count?: number }) {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-3 h-40 w-full rounded bg-slate-100" />
            <div className="h-3 w-3/4 rounded bg-slate-100 mb-2" />
            <div className="h-3 w-1/2 rounded bg-slate-100" />
          </div>
        ))}
      </>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 to-white font-sans">
      {/* Banner gọn gàng */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="flex flex-col justify-center">
            <h1 className="mb-5 max-w-2xl text-4xl font-bold leading-tight text-sky-900">
              Mua sắm nội thất, trang trí nhà cửa hiện đại, giá tốt nhất
            </h1>
            <p className="mb-6 max-w-lg text-base text-slate-700">
              Tìm kiếm và mua sắm các sản phẩm nội thất, đồ trang trí, đồ gia dụng, phụ kiện nhà cửa với mẫu mã đa dạng, chất lượng cao, giá ưu đãi. Đổi mới không gian sống, nâng tầm phong cách với bộ sưu tập sản phẩm hot trend, giao hàng nhanh, hỗ trợ tận tâm. Khám phá ngay các sản phẩm nổi bật, phù hợp mọi nhu cầu từ phòng khách, phòng ngủ, nhà bếp đến văn phòng và ngoài trời.
            </p>
            <div className="flex gap-2">
              <a href="/shop" className="inline-flex items-center rounded px-5 py-2 text-white shadow hover:bg-orange-700 transition text-white">Mua sắm ngay</a>
              <a href="/shop" className="inline-flex items-center rounded border border-orange-600 px-5 py-2 text-orange-600 hover:bg-orange-50">Khám phá</a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="aspect-[4/3] w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-lg">
              <img src="/images/hero.jpg" alt="Hero" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-sky-800">Sản phẩm nổi bật</h2>
          <a href="/shop" className="text-sm text-sky-700 hover:underline">Xem tất cả</a>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            <ProductSkeleton count={8} />
          ) : products.length ? (
            show.map((p: any) => (
              <ProductCard
                key={p.id}
                product={{
                  id: p.id,
                  title: p.title || p.name,
                  price: typeof p.price === "number" ? `$${p.price.toFixed(2)}` : p.price || "$0.00",
                  image: p.image || p.image_url || "/images/placeholder.png",
                }}
              />
            ))
          ) : (
            <div className="col-span-full rounded-lg bg-white p-6 text-center shadow">
              <p className="mb-3 text-lg text-slate-700">Chưa có sản phẩm nào.</p>
            </div>
          )}
        </div>
      </section>

      {/* Đăng ký nhận tin */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-2 text-lg font-semibold text-sky-800">Đăng ký nhận tin</h3>
          <p className="mb-4 text-sm text-slate-700">Nhận khuyến mãi và sản phẩm mới nhất qua email.</p>
          <form className="flex gap-2">
            <Input placeholder="Email của bạn" className="flex-1 rounded border p-2" />
            <Button className="rounded px-4 py-2">Subscribe</Button>
          </form>
        </div>
      </section>

      <Footer />
    </main>
  );
}
