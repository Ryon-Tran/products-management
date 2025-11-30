import { Button } from "@/components/ui/button";

export default function OrdersPage() {
  const orders = [
    { id: 1001, status: "Shipped", total: "$59.99" },
    { id: 1000, status: "Delivered", total: "$129.00" },
  ];

  return (
    <div className="min-h-[70vh] bg-[color:var(--color-bg)] py-8">
      <div className="site-container">
        <h1 className="mb-4 text-2xl font-bold text-[color:var(--color-text)]">Đơn hàng</h1>
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between rounded bg-white p-4 shadow">
              <div>
                <div className="font-medium">Order #{o.id}</div>
                <div className="text-sm text-[color:var(--color-muted)]">Status: {o.status}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-medium">{o.total}</div>
                <Button variant="outline">Details</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
