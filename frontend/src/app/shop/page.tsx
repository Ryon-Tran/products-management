"use client";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { list as fetchProducts } from "@/lib/api/products";
import { list as fetchCategories } from "@/lib/api/categories";

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

export default function ShopPage() {
  const searchParams = useSearchParams();
  const q = searchParams?.get("search") || "";
  const initialCategory = searchParams?.get('category') || '';
  const initialMin = searchParams?.get('minPrice') || '';
  const initialMax = searchParams?.get('maxPrice') || '';
  const initialSort = searchParams?.get('sort') || '';
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState<string | number | undefined>(initialCategory || undefined);
  const [minPrice, setMinPrice] = useState<string | undefined>(initialMin || undefined);
  const [maxPrice, setMaxPrice] = useState<string | undefined>(initialMax || undefined);
  const [sort, setSort] = useState<string | undefined>(initialSort || undefined);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const cats = await fetchCategories();
        if (mounted && Array.isArray(cats)) setCategories(cats);
      } catch (err) {
        console.warn('Failed to load categories', err);
      }
    })();
    return () => { mounted = false };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const filters: any = {};
        if (q) filters.search = q;
        if (category) filters.category = category;
        if (minPrice) filters.minPrice = minPrice;
        if (maxPrice) filters.maxPrice = maxPrice;
        if (sort) filters.sort = sort;

        const res = await fetchProducts(Object.keys(filters).length ? filters : undefined);
        if (mounted && Array.isArray(res)) setProducts(res);
      } catch (err) {
        console.warn("Fetch shop products failed", err);
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [q, category, minPrice, maxPrice, sort]);

  return (
    <div className="min-h-[70vh] bg-[color:var(--color-bg)] py-8">
      <div className="site-container">

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--color-text)]">Shop</h1>
            {q ? <p className="text-sm text-slate-600">Kết quả tìm kiếm cho "{q}"</p> : null}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <select
                value={category ?? ''}
                onChange={(e) => setCategory(e.target.value || undefined)}
                className="rounded border p-2"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <input type="number" placeholder="Giá thấp" value={minPrice ?? ''} onChange={(e) => setMinPrice(e.target.value || undefined)} className="w-24 rounded border p-2" />
              <input type="number" placeholder="Giá cao" value={maxPrice ?? ''} onChange={(e) => setMaxPrice(e.target.value || undefined)} className="w-24 rounded border p-2" />

              <select value={sort ?? ''} onChange={(e) => setSort(e.target.value || undefined)} className="rounded border p-2">
                <option value="">Mặc định</option>
                <option value="price_asc">Giá: Tăng dần</option>
                <option value="price_desc">Giá: Giảm dần</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={() => {
                // push filters into url querystring
                const params = new URLSearchParams();
                if (q) params.set('search', q);
                if (category) params.set('category', String(category));
                if (minPrice) params.set('minPrice', String(minPrice));
                if (maxPrice) params.set('maxPrice', String(maxPrice));
                if (sort) params.set('sort', String(sort));
                const url = `/shop${params.toString() ? `?${params.toString()}` : ''}`;
                router.push(url);
              }}>Áp dụng</Button>
              <Button variant="ghost" onClick={() => {
                setCategory(undefined); setMinPrice(undefined); setMaxPrice(undefined); setSort(undefined);
                const params = new URLSearchParams();
                if (q) params.set('search', q);
                const url = `/shop${params.toString() ? `?${params.toString()}` : ''}`;
                router.push(url);
              }}>Xóa</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {loading ? (
            <ProductSkeleton count={8} />
          ) : products.length ? (
            products.map((p: any) => (
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
              <p className="mb-3 text-lg text-slate-700">Không tìm thấy sản phẩm.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
