import OrdersList from './OrdersList';

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold ">Quản lý đơn hàng</h1>
      <div className="grid gap-4">
        <div className="rounded bg-white p-4 shadow">
          <OrdersList />
        </div>
        <div className="flex gap-2">
          <button className="rounded bg-[color:var(--color-primary)] px-3 py-2 text-white">Xuất đơn</button>
        </div>
      </div>
    </div>
  );
}
