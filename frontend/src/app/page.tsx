"use client";

import React, { useEffect, useState } from "react";
import { list as fetchCategories } from "@/lib/api/categories";
import { Smartphone, Laptop, Tablet, Tv, Headphones, Camera, Watch, MousePointerClick } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Footer from "@/components/Footer";
import { list as fetchProducts } from "@/lib/api/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchProducts();
        if (mounted && Array.isArray(res)) setProducts(res);
      } catch (err) {
        console.warn('Fetch products failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (mounted && Array.isArray(cats)) setCategories(cats);
      } catch (err) {
        console.warn('Fetch categories failed', err);
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
      {/* Banner công nghệ điện tử */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="flex flex-col justify-center">
            <h1 className="mb-5 max-w-2xl text-4xl font-bold leading-tight text-blue-900">
              Mua bán đồ công nghệ điện tử hiện đại, giá tốt nhất
            </h1>
            <p className="mb-6 max-w-lg text-base text-slate-700">
              Tìm kiếm và mua sắm các sản phẩm công nghệ, điện tử, phụ kiện số, thiết bị thông minh với mẫu mã đa dạng, chất lượng cao, giá ưu đãi.<br />
              Đổi mới trải nghiệm sống, nâng tầm phong cách với bộ sưu tập sản phẩm hot trend, giao hàng nhanh, hỗ trợ tận tâm.<br />
              Khám phá ngay các sản phẩm nổi bật, phù hợp mọi nhu cầu từ điện thoại, laptop, máy tính bảng, thiết bị gia dụng đến đồ chơi công nghệ và văn phòng.
            </p>
            <div className="flex gap-2">
              <a href="/shop" className="inline-flex items-center rounded px-5 py-2 text-white shadow transition">Mua sắm ngay</a>
              <a href="/shop" className="inline-flex items-center rounded border border-blue-600 px-5 py-2 text-blue-600 hover:bg-blue-50">Khám phá</a>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="aspect-[4/3] w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-lg">
              <img src="data:image/webp;base64,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" alt="Hero" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
        {/* Danh mục sản phẩm */}
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className="text-xl font-bold text-blue-800 mb-6">Danh mục nổi bật</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6">
            {categories.length ? categories.map((cat: any, idx: number) => {
              // Demo icon mapping by index
              const icons = [Smartphone, Laptop, Tablet, Tv, Headphones, Camera, Watch, MousePointerClick];
              const Icon = icons[idx % icons.length];
              return (
                <a key={cat.id} href={`/shop?category=${cat.id}`} className="flex flex-col items-center gap-2 rounded-md bg-white shadow hover:shadow-md p-4 border hover:border-blue-400 transition">
                  <Icon size={32} className="text-blue-600 mb-1" />
                  <span className="text-sm font-medium text-gray-700 text-center">{cat.name}</span>
                </a>
              );
            }) : (
              Array.from({ length: 6 }).map((_, idx) => {
                const icons = [Smartphone, Laptop, Tablet, Tv, Headphones, Camera, Watch, MousePointerClick];
                const Icon = icons[idx % icons.length];
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 rounded-md bg-white shadow p-4 border animate-pulse">
                    <Icon size={32} className="text-blue-200 mb-1" />
                    <span className="h-4 w-16 bg-slate-100 rounded" />
                  </div>
                );
              })
            )}
          </div>
        </section>
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
      </section>

      {/* Sản phẩm nổi bật */}


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
