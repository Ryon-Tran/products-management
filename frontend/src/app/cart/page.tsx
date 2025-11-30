"use client";
import { Button } from "@/components/ui/button";
import { cart as cartApi } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CartPage() {
    const handleUpdateQty = async (item: any, qty: number) => {
      if (qty < 1) return;
      try {
        await cartApi.addOrUpdateItem({ product_id: item.product_id, quantity: qty });
        // Update local state for smoother UX
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, quantity: qty } : it
          )
        );
        toast.success("Cập nhật số lượng thành công!");
      } catch {
        toast.error("Cập nhật số lượng thất bại!");
      }
    };

    const handleRemove = async (item: any) => {
      try {
        await cartApi.removeItem(item.id);
        // Update local state for smoother UX
        setItems((prev) => prev.filter((it) => it.id !== item.id));
        toast.success("Đã xóa sản phẩm khỏi giỏ hàng!");
      } catch {
        toast.error("Xóa sản phẩm thất bại!");
      }
    };
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCart() {
      setLoading(true);
      try {
        const cart = await import("@/lib/api").then(mod => mod.cart.get());
        if (cart && Array.isArray(cart.items)) {
          setItems(cart.items);
        } else {
          setItems([]);
        }
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCart();
    window.addEventListener("pm.cart", fetchCart as EventListener);
    return () => window.removeEventListener("pm.cart", fetchCart as EventListener);
  }, []);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  useEffect(() => {
    setSelectedItems(items.map(it => it.id));
  }, [items]);
  const subtotal = items.filter(it => selectedItems.includes(it.id)).reduce((sum, it) => sum + (Number(it.price) * (it.quantity || 1)), 0);

  return (
    <div className="min-h-[70vh] bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Giỏ hàng</h1>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {loading ? (
              <div className="text-center text-gray-400 py-8">Đang tải giỏ hàng...</div>
            ) : items.length === 0 ? (
              <div className="text-center text-gray-400 py-8">Giỏ hàng trống.</div>
            ) : (
              items.map((it) => (
                <div key={it.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-5 mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(it.id)}
                      onChange={e => {
                        setSelectedItems(sel =>
                          e.target.checked
                            ? [...sel, it.id]
                            : sel.filter(id => id !== it.id)
                        );
                      }}
                      className="w-6 h-6 accent-primary mr-2"
                    />
                    {it.image_url ? (
                      <img src={it.image_url} alt={it.name || it.product_name} className="w-20 h-20 object-cover rounded-lg border" />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded-lg text-xs text-gray-400 border">No image</div>
                    )}
                    <div className="flex flex-col justify-between h-full">
                      <div className="font-semibold text-gray-900 max-w-[200px] truncate line-clamp-2 text-base">{it.name || it.product_name}</div>
                      <div className="flex items-center gap-2 mt-3">
                        <Button size="sm" variant="outline" className="rounded px-2" onClick={() => handleUpdateQty(it, (it.quantity || 1) - 1)}>-</Button>
                        <span className="px-3 py-1 rounded bg-gray-100 text-sm font-medium min-w-[32px] text-center">{it.quantity || 1}</span>
                        <Button size="sm" variant="outline" className="rounded px-2" onClick={() => handleUpdateQty(it, (it.quantity || 1) + 1)}>+</Button>
                        <Button size="sm" variant="destructive" className="ml-2 rounded px-3" onClick={() => handleRemove(it)}>Xóa</Button>
                      </div>
                    </div>
                  </div>
                  <div className="font-bold text-lg text-gray-800">{
                    typeof it.price === "number"
                      ? it.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                      : !isNaN(Number(it.price))
                        ? Number(it.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                        : it.price
                  }</div>
                </div>
              ))
            )}
          </div>

          <aside className="rounded-xl border border-gray-100 bg-white p-6 flex flex-col gap-5">
            <div className="text-center mb-2">
              <span className="block text-lg font-semibold text-gray-700 mb-1">Tổng đơn hàng</span>
              <span className={`block text-3xl font-bold ${subtotal === 0 ? 'text-gray-400' : 'text-gray-900'}`}>{subtotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
            </div>
            <div className="mb-2 text-center">
              <span className="text-sm text-gray-400">Phí vận chuyển và thuế sẽ được tính ở trang thanh toán.</span>
            </div>
            <Link href="/checkout" className="mt-2">
              <button
                className={`w-full py-3 text-base font-semibold rounded-2xl transition-all duration-150 ${selectedItems.length === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-700 text-white hover:from-gray-800 hover:to-gray-600 shadow-md'}`}
                disabled={selectedItems.length === 0}
                onClick={() => {
                  if (selectedItems.length > 0) {
                    try {
                      localStorage.setItem('pm.selectedCartItems', JSON.stringify(selectedItems));
                    } catch {}
                  }
                }}
              >
                Tiếp tục đến thanh toán
              </button>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
