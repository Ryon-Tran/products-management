"use client";

import { useEffect, useState } from "react";
import { orders as ordersApi } from "@/lib/api";

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await ordersApi.listAdmin();
        if (mounted && Array.isArray(res?.orders)) setOrders(res.orders);
      } catch (e) {
        console.warn('failed to load orders', e);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-medium">Danh sách đơn hàng</h3>
        <div className="text-sm text-[color:var(--color-muted)]">{orders.length} đơn</div>
      </div>

      {loading && <div className="text-sm text-[color:var(--color-muted)] mb-3">Đang tải đơn hàng...</div>}

      <div className="space-y-3">
        {orders.map((o: any) => (
          <div key={o.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="font-medium">#{o.id} — {o.user_name || o.user_email || 'Khách'}</div>
              <div className="text-sm text-[color:var(--color-muted)]">{new Date(o.created_at).toLocaleString()} — {Number(o.total).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm">{o.status}</div>
              <button className="rounded bg-[color:var(--color-primary)] px-3 py-2 text-white">Chi tiết</button>
            </div>
          </div>
        ))}

        {orders.length === 0 && !loading && (
          <div className="text-sm text-[color:var(--color-muted)]">Chưa có đơn hàng nào.</div>
        )}
      </div>
    </div>
  );
}
