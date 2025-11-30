"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { orders as ordersApi } from "@/lib/api";
import OrderDetailDialog from "./OrderDetailDialog";

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await ordersApi.list();
        // res có thể là { orders: [...] } hoặc []
        if (mounted) {
          if (Array.isArray(res)) {
            setOrders(res);
          } else if (res && Array.isArray(res.orders)) {
            setOrders(res.orders);
          } else {
            setOrders([]);
          }
        }
      } catch (e) {
        console.warn('failed to load orders', e);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, []);

  // Helper: trạng thái tiếng Việt
  const viStatus = (status: string) => {
    if (status === "pending") return "Chờ xác nhận";
    if (status === "paid") return "Đã thanh toán";
    if (status === "cancelled") return "Đã hủy";
    return status;
  };

  // Helper: màu sắc trạng thái
  const statusColor = (status: string) => {
    if (status === "pending") return "text-yellow-600 bg-yellow-50 border-yellow-200";
    if (status === "paid") return "text-green-700 bg-green-50 border-green-200";
    if (status === "cancelled") return "text-red-600 bg-red-50 border-red-200";
    return "text-gray-600 bg-gray-50 border-gray-200";
  };

  // Helper: định dạng tiền VND
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

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
              <div className="text-sm text-[color:var(--color-muted)]">{o.date} — {formatVND(o.total)}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`text-sm px-2 py-1 rounded border ${statusColor(o.status)}`}>{viStatus(o.status)}</div>
              <Button size="sm" onClick={() => { setSelectedOrderId(o.id); setDialogOpen(true); }}>Chi tiết</Button>
            </div>
          </div>
        ))}

        {orders.length === 0 && !loading && (
          <div className="text-sm text-[color:var(--color-muted)]">Bạn chưa có đơn hàng nào.</div>
        )}
      </div>
      <OrderDetailDialog open={dialogOpen} onOpenChange={setDialogOpen} orderId={selectedOrderId} viStatus={viStatus} formatVND={formatVND} statusColor={statusColor} />
    </div>
  );
}
