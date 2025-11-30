"use client";

import { useEffect, useMemo, useState } from "react";
import { orders as ordersApi } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

function StatusBadge({ status }: { status: string }) {
  const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";
  const cls =
    status === "paid"
      ? "bg-green-100 text-green-800"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : status === "cancelled"
      ? "bg-red-100 text-red-800"
      : "bg-slate-100 text-slate-800";
  const viStatus =
    status === "paid"
      ? "Đã thanh toán"
      : status === "pending"
      ? "Chờ xác nhận"
      : status === "cancelled"
      ? "Đã hủy"
      : status;
  return <span className={`${base} ${cls}`}>{viStatus}</span>;
}

export default function OrdersList() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await ordersApi.listAdmin();
        if (mounted && Array.isArray(res?.orders)) setOrders(res.orders);
      } catch (e) {
        console.warn("failed to load orders", e);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders
      .filter((o) => {
        if (statusFilter && o.status !== statusFilter) return false;
        if (!q) return true;
        return (
          String(o.id).includes(q) ||
          (o.user_email || "").toLowerCase().includes(q) ||
          (o.user_name || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [orders, query, statusFilter]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-medium">Danh sách đơn hàng</h3>
          <div className="text-sm text-muted-foreground">{orders.length} đơn</div>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="w-full max-w-sm">
            <Input
              placeholder="Tìm theo ID, email hoặc tên khách"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="">Tất cả</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <Button variant="outline" size="sm">Xuất CSV</Button>
        </div>
      </div>

      {loading && <div className="text-sm text-muted-foreground mb-3">Đang tải đơn hàng...</div>}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Khách hàng</TableHead>
            <TableHead>Ngày</TableHead>
            <TableHead>Tổng</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Địa chỉ giao hàng</TableHead>
            <TableHead>Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((o: any) => (
            <TableRow key={o.id}>
              <TableCell className="font-medium">#{o.id}</TableCell>
              <TableCell>{o.user_name || o.user_email || "Khách"}</TableCell>
              <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
              <TableCell>
                {Number(o.total).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
              </TableCell>
              <TableCell>
                <StatusBadge status={o.status} />
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  {o.shipping_street && <div>{o.shipping_street}</div>}
                  {o.shipping_ward && <span>{o.shipping_ward}, </span>}
                  {o.shipping_city && <span>{o.shipping_city}, </span>}
                  {o.shipping_state && <span>{o.shipping_state}</span>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <Link href={`/admin/orders/${o.id}`}>Chi tiết</Link>
                  </Button>
                  <Button size="sm" variant="outline">Đơn hàng</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}

          {!loading && filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                Không tìm thấy đơn hàng.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
