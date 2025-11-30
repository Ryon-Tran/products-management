export default function AdminUsersPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-[color:var(--color-sidebar-primary-foreground)]">Quản lý người dùng</h1>
      <div className="grid gap-4">
        <div className="rounded bg-white p-4 shadow">Danh sách người dùng (demo)</div>
        <div className="flex gap-2">
          <button className="rounded bg-[color:var(--color-primary)] px-3 py-2 text-white">Thêm user</button>
        </div>
      </div>
    </div>
  );
}
