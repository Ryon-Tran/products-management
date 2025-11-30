import AdminSidebar from "@/components/AdminSidebar";
import AdminGuard from "@/components/AdminGuard";

export const metadata = {
  title: "Admin - Product Management",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-[color:var(--color-bg)]">
        <div className="mx-auto flex">
          <AdminSidebar />
          <main className="flex-1 p-8">
            <div className="rounded-lg bg-white p-6 shadow">
              <header className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-lg font-semibold">Admin</h1>
                  <p className="text-sm text-[color:var(--color-muted)]">Overview and management</p>
                </div>
              </header>

              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
