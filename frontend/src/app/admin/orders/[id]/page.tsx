"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { orders as ordersApi } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

function StatusBadge({ status }: { status?: string }) {
  const s = status || "unknown";
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const cls =
    s === "paid"
      ? "bg-green-100 text-green-800"
      : s === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : s === "cancelled"
      ? "bg-red-100 text-red-800"
      : "bg-slate-100 text-slate-800";
  return <span className={`${base} ${cls}`}>{s}</span>;
}

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await ordersApi.get(Number(id));
        // API returns { order, items } (backend separates order and items)
        if (mounted) {
          const merged = res?.order ? { ...res.order, items: res.items || [] } : { ...res, items: (res && res.items) || [] };
          setOrder(merged);
        }
      } catch (e: any) {
        console.error(e);
        if (mounted) setError(e?.message || 'Lỗi khi tải đơn hàng');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [id]);

  if (!id) return <div>Không tìm thấy mã đơn.</div>;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Chi tiết đơn #{id}</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={() => router.back()}>
            Quay lại
          </Button>
          <Button size="sm">In / Xuất</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Thông tin đơn hàng</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div>Đang tải...</div>}
          {error && <div className="text-red-600">{error}</div>}

          {order && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-2">
                  <div className="text-sm font-semibold text-blue-700 mb-1">Khách hàng</div>
                  <div className="font-medium">{order.user_name || order.user_email || 'Khách'}</div>
                  {order.user_email && <div className="text-sm text-gray-500">{order.user_email}</div>}
                </div>

                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-2">
                  <div className="text-sm font-semibold text-blue-700 mb-1">Trạng thái</div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={order.status} />
                    <div className="w-32">
                      <Select
                        value={order.status}
                        onValueChange={async (newStatus: string) => {
                          if (newStatus === order.status) return;
                          try {
                            const res = await ordersApi.updateStatus(order.id, newStatus);
                            setOrder((prev: any) => ({ ...prev, status: res.order.status }));
                          } catch (err) {
                            alert('Cập nhật trạng thái thất bại!');
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Chờ xác nhận</SelectItem>
                          <SelectItem value="paid">Đã thanh toán</SelectItem>
                          <SelectItem value="cancelled">Đã hủy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div>
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
        </CardContent>
      </Card>
    </div>
  );
}
