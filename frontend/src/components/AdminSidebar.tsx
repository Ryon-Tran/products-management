"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/utils/auth";
import { usePathname } from "next/navigation";
import { Box, Home, List, LogOut, Settings, Users, Tag, ShoppingBag, BarChart } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { me as fetchMe } from "@/lib/api/auth";

function getCurrentUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("pm_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export default function AdminSidebar() {
    const pathname = usePathname() || "/";
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    const refreshUser = useCallback(async () => {
      const u = getCurrentUser();
      if (u) {
        setUser(u);
        return;
      }
      // attempt to fetch /auth/me if no user stored
      try {
        const me = await fetchMe();
        if (me && me.user) {
          try { localStorage.setItem('pm_user', JSON.stringify(me.user || {})); } catch (_) {}
          setUser(me.user);
          return;
        }
      } catch (e) {
        // ignore
      }
      // fallback: if token exists but no user, show placeholder
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) setUser({ name: 'Người dùng', email: '' });
      else setUser(null);
    }, []);

    useEffect(() => {
      refreshUser();
      const handler = () => { refreshUser(); };
      window.addEventListener("pm.auth", handler);
      return () => window.removeEventListener("pm.auth", handler);
    }, [refreshUser]);

    function isActive(href: string) {
        return pathname === href || pathname.startsWith(href + "/");
    }

    const baseLink = "flex items-center gap-3 rounded px-3 py-2 text-sm";
    const hover = "hover:bg-[color:var(--color-bg)]";
    const activeLeft = "border-l-4 border-[color:var(--color-primary)] bg-[color:var(--color-surface)]";

    return (
        <aside className="w-72 min-h-screen bg-[#f5f7fa] border-r">
            <div className="flex items-center gap-3 px-4 py-5">
                <div className="h-10 w-10 rounded-md bg-[color:var(--color-primary)] flex items-center justify-center text-white font-bold">PM</div>
                <div>
                    <div className="text-sm font-semibold">ProductMgmt</div>
                    <div className="text-xs text-[color:var(--color-muted)]">Admin Panel</div>
                </div>
            </div>

            <div className="mt-2 px-2">

                <div className="mb-2 px-3 text-xs font-medium text-[color:var(--color-muted)]">MAIN</div>
                <nav className="flex flex-col gap-1">
                    <Link href="/admin/dashboard" className={`${baseLink} ${hover} ${isActive('/admin/dashboard') ? activeLeft : 'text-[color:var(--color-text)]'}`}>
                        <Home size={16} /> Dashboard
                    </Link>
                    <Link href="/admin/products" className={`${baseLink} ${hover} ${isActive('/admin/products') ? activeLeft : 'text-[color:var(--color-text)]'}`}>
                        <ShoppingBag size={16} /> Products
                    </Link>
                    <Link href="/admin/orders" className={`${baseLink} ${hover} ${isActive('/admin/orders') ? activeLeft : 'text-[color:var(--color-text)]'}`}>
                        <List size={16} /> Orders
                    </Link>
                    <Link href="/admin/categories" className={`${baseLink} ${hover} ${isActive('/admin/categories') ? activeLeft : 'text-[color:var(--color-text)]'}`}>
                        <Tag size={16} /> Categories
                    </Link>
                    <Link href="/admin/customers" className={`${baseLink} ${hover} ${isActive('/admin/customers') ? activeLeft : 'text-[color:var(--color-text)]'}`}>
                        <Users size={16} /> Customers
                    </Link>
                </nav>

                <div className="my-4 border-t" />

                <div className="mb-2 px-3 text-xs font-medium text-[color:var(--color-muted)]">ANALYTICS</div>
                <nav className="flex flex-col gap-1">
                    <Link href="/admin/reports" className={`${baseLink} ${hover} ${isActive('/admin/reports') ? activeLeft : 'text-[color:var(--color-text)]'}`}>
                        <BarChart size={16} /> Reports
                    </Link>
                    <Link href="/admin/settings" className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-[color:var(--color-bg)]">
                        <Settings size={16} /> Settings
                    </Link>


                </nav>
            </div>

            <div className="mt-auto px-4 py-4">
              <div className="mt-3 flex items-center gap-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm">
                    {user?.name ? user.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{user?.name || "Chưa đăng nhập"}</div>
                    <div className="text-xs text-[color:var(--color-muted)]">{user?.email || "Không có email"}</div>
                  </div>
                  <button
                    className="ml-auto flex items-center gap-2 rounded px-3 py-2 text-sm text-[color:var(--color-primary)]"
                    onClick={() => {
                      logout();
                      router.replace("/login");
                    }}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </div>
            </div>

        </aside>
    );
}
