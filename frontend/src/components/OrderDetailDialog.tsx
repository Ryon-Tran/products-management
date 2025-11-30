import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { orders as ordersApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

export default function OrderDetailDialog({ open, onOpenChange, orderId, viStatus, formatVND, statusColor }: { open: boolean; onOpenChange: (v: boolean) => void; orderId: number | null; viStatus?: (s: string) => string; formatVND?: (n: number) => string; statusColor?: (s: string) => string }) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !orderId) return;
    setLoading(true);
    setError(null);
    ordersApi.get(orderId)
      .then(res => {
        setOrder(res?.order ? { ...res.order, items: res.items || [] } : { ...res, items: (res && res.items) || [] });
      })
      .catch(e => setError(e?.message || "Lỗi khi tải đơn hàng"))
      .finally(() => setLoading(false));
  }, [open, orderId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>Chi tiết đơn hàng #{orderId}</DialogTitle>
          <DialogDescription>
            Xem chi tiết đơn hàng, sản phẩm, địa chỉ giao hàng và trạng thái.
          </DialogDescription>
        </DialogHeader>
        {loading && <div className="text-blue-600">Đang tải...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {order && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-2">
                <div className="text-sm font-semibold text-blue-700 mb-1">Trạng thái</div>
                <div className={`font-medium px-2 py-1 rounded border inline-block ${statusColor ? statusColor(order.status) : ''}`}>{viStatus ? viStatus(order.status) : order.status}</div>
                <div className="mt-2 text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-2">
                <div className="text-sm font-semibold text-blue-700 mb-1">Địa chỉ giao hàng</div>
                <div className="font-medium">
                  {order.shipping_name && <div><b>{order.shipping_name}</b></div>}
                  {order.shipping_phone && <div>{order.shipping_phone}</div>}
                  {order.shipping_street && <div>{order.shipping_street}</div>}
                  {order.shipping_ward && <span>{order.shipping_ward}, </span>}
                  {order.shipping_city && <span>{order.shipping_city}, </span>}
                  {order.shipping_state && <span>{order.shipping_state}</span>}
                  {!order.shipping_name && !order.shipping_street && <span className="text-gray-400">Chưa có</span>}
                </div>
              </div>
            </div>
            <div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-2">
                <div className="text-sm font-semibold text-blue-700 mb-2">Sản phẩm</div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="py-2 text-left">Sản phẩm</th>
                        <th className="py-2 text-left">Giá</th>
                        <th className="py-2 text-left">Số lượng</th>
                        <th className="py-2 text-left">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items || []).map((it: any, i: number) => (
                        <tr key={i} className="border-b">
                          <td className="py-2">{it.name || it.product_name || '—'}</td>
                          <td className="py-2">{Number(it.price || it.unit_price || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                          <td className="py-2">{it.quantity || it.qty || 1}</td>
                          <td className="py-2">{Number((it.price || it.unit_price || 0) * (it.quantity || it.qty || 1)).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-2 text-right">
                <div className="text-sm font-semibold text-green-700">Tổng</div>
                <div className="text-lg font-bold text-green-900">{Number(order.total || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
