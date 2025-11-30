"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { orders as ordersApi } from "@/lib/api";

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await ordersApi.list();
        if (mounted) setOrders(res || []);
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
        <h3 className="text-lg font-medium">Đơn hàng của bạn</h3>
        <div className="text-sm text-[color:var(--color-muted)]">{orders.length} đơn</div>
      </div>

      {loading && <div className="text-sm text-[color:var(--color-muted)] mb-3">Đang tải đơn hàng...</div>}

      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="font-medium">#{o.id}</div>
              <div className="text-sm text-[color:var(--color-muted)]">{o.date} — {o.total}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-sm">{o.status}</div>
              <Button size="sm">Chi tiết</Button>
            </div>
          </div>
        ))}

        {orders.length === 0 && !loading && (
          <div className="text-sm text-[color:var(--color-muted)]">Bạn chưa có đơn hàng nào.</div>
        )}
      </div>
    </div>
  );
}
