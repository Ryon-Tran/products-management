"use client";
import CheckoutForm from "@/components/CheckoutForm";
import ProductCard from "@/components/ProductCard";
import AddressList from "@/components/AddressList";
import AddressForm from "@/components/AddressForm";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { cart as cartApi, orders as ordersApi } from "@/lib/api";
import { toast } from "sonner";

// export const metadata = {
//   title: "Checkout - ProductMgmt",
// };

export default function CheckoutPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<any | null>(null);
  const [addingNew, setAddingNew] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    let selectedIds: number[] = [];
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('pm.selectedCartItems') : null;
      if (raw) selectedIds = JSON.parse(raw);
    } catch { }
    async function fetchCart() {
      setLoading(true);
      try {
        const cart = await cartApi.get();
        if (cart && Array.isArray(cart.items)) {
          setItems(cart.items.filter((it: any) => selectedIds.includes(it.id)));
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
  }, []);

  const subtotal = items.reduce((sum, it) => sum + (Number(it.price) * (it.quantity || 1)), 0);

  const handleCreateOrder = async () => {
    if (!selectedAddress || items.length === 0) return;
    setCreatingOrder(true);
    try {
      // You may need to adjust payload to match backend API
      await ordersApi.create({
        address_id: selectedAddress.id,
        items: items.map(it => ({ product_id: it.product_id, quantity: it.quantity })),
      });
      toast.success("Đã tạo đơn hàng thành công!");
      // Optionally redirect or clear cart
    } catch {
      toast.error("Tạo đơn hàng thất bại!");
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Thanh toán</h1>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Chọn địa chỉ giao hàng</h2>
              {!addingNew ? (
                <>
                  <AddressList
                    onSelect={(addr: any) => {
                      setSelectedAddress(addr);
                      setAddingNew(false);
                    }}
                  />
                </>
              ) : (
                <AddressForm
                  onSave={(addr: any) => {
                    setSelectedAddress(addr);
                    setAddingNew(false);
                  }}
                  onCancel={() => setAddingNew(false)}
                />
              )}
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <h3 className="mb-4 text-base font-semibold text-gray-800">Các sản phẩm</h3>
              {loading ? (
                <div className="text-center text-gray-400 py-8">Đang tải sản phẩm...</div>
              ) : items.length === 0 ? (
                <div className="text-center text-gray-400 py-8">Không có sản phẩm nào được chọn.</div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {items.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-4">
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.name || p.product_name} className="w-14 h-14 object-cover rounded-lg border" />
                        ) : (
                          <div className="w-14 h-14 bg-gray-100 flex items-center justify-center rounded-lg text-xs text-gray-400 border">No image</div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-900">{p.name || p.product_name}</span>
                          <span className="text-sm text-gray-500">Số lượng: {p.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-gray-800">{typeof p.price === "number" ? p.price.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : !isNaN(Number(p.price)) ? Number(p.price).toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : p.price}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <aside className="rounded-xl border border-gray-100 bg-white p-5 flex flex-col">
            <div className="text-lg font-semibold text-gray-800 mb-3">Tóm tắt đơn hàng</div>
            <hr className="mb-3" />
            <div className="flex justify-between items-center mb-2 text-sm text-gray-700">
              <span>Tạm tính:</span>
              <span className="font-bold">{subtotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
            </div>
            <hr className="mb-3" />
            <div className="mb-2 text-sm text-gray-500">Phí vận chuyển và thuế sẽ được tính ở bước tiếp theo.</div>
            <hr className="mb-3" />
            <div className="flex justify-between items-center mb-4 text-lg font-bold text-gray-900">
              <span>Tổng:</span>
              <span>{subtotal.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
            </div>
            <button
              className={`w-full rounded-lg bg-gray-900 px-4 py-2 text-white font-semibold hover:bg-gray-800 transition ${items.length === 0 || !selectedAddress ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : ''}`}
              disabled={items.length === 0 || !selectedAddress || creatingOrder}
              onClick={handleCreateOrder}
            >
              {creatingOrder ? "Đang tạo đơn hàng..." : "Thanh toán"}
            </button>
          </aside>
        </div>
      </div>
    </main>
  );
}
