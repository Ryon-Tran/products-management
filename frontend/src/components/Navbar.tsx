"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, LogIn, UserPlus, Home, Monitor, Search } from "lucide-react";
import { getUserRole, setUserRole } from "@/utils/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
    const [cartCount, setCartCount] = useState(0);

    // Load cart count on mount
    useEffect(() => {
      async function fetchCart() {
        try {
          const cart = await import("@/lib/api").then(mod => mod.cart.get());
          if (cart && Array.isArray(cart.items)) {
            setCartCount(cart.items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0));
          } else {
            setCartCount(0);
          }
        } catch {
          setCartCount(0);
        }
      }
      fetchCart();
      // Listen for cart changes
      window.addEventListener("pm.cart", fetchCart as EventListener);
      return () => window.removeEventListener("pm.cart", fetchCart as EventListener);
    }, []);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const r = getUserRole();
    if (r) setRole(r);
    else {
      try {
        const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (t) setRole('user');
        else setRole(null);
      } catch (_) {
        setRole(null);
      }
    }
    // read cached user for immediate UI
    try {
      if (typeof window !== 'undefined') {
        const raw = localStorage.getItem('pm_user');
        if (raw) {
          const u = JSON.parse(raw || '{}');
          if (u?.name) setUserName(u.name);
        }
      }
    } catch (_) {}
  }, []);

  // listen for auth changes (login/logout) so header updates without full reload
  useEffect(() => {
    function onAuthChange() {
      const r = getUserRole();
      if (r) setRole(r);
      else {
        try {
          const t = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
          if (t) setRole('user');
          else setRole(null);
        } catch (_) {
          setRole(null);
        }
      }
      // update cached user name
      try {
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('pm_user');
          if (raw) {
            const u = JSON.parse(raw || '{}');
            setUserName(u?.name || null);
          } else {
            setUserName(null);
          }
        }
      } catch (_) {
        setUserName(null);
      }
    }
    window.addEventListener('pm.auth', onAuthChange as EventListener);
    return () => window.removeEventListener('pm.auth', onAuthChange as EventListener);
  }, []);

  function logout() {
    setUserRole(null);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('pm_role');
        localStorage.removeItem('pm_user');
      }
    } catch (_) {}
    setRole(null);
    setUserName(null);
    try { window.dispatchEvent(new Event('pm.auth')); } catch (_) {}
    if (typeof window !== "undefined") window.location.href = "/";
  }

  return (
    <header className="w-full border-b bg-[color:var(--color-surface)] shadow-sm sticky top-0 z-40">
      <div className="site-container flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="rounded-md bg-[color:var(--color-primary)] p-2 text-white">R</div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-[color:var(--color-text)]">RyonShop</span>
              <small className="text-xs text-[color:var(--color-muted)]">Curated home goods</small>
            </div>
          </Link>
        </div>

        <div className="hidden flex-1 items-center gap-4 px-4 sm:flex">
          <div className="relative flex w-full max-w-2xl items-center">
            <Search className="absolute left-3 text-[color:var(--color-muted)]" size={18} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const q = query.trim();
                  if (q) router.push(`/shop?search=${encodeURIComponent(q)}`);
                }
              }}
              placeholder="Tìm kiếm sản phẩm, danh mục..."
              className="pl-10"
            />
          </div>
        </div>

        <nav className="flex items-center gap-3">
          <Link href="/cart" className="relative px-3 py-2 rounded text-[color:var(--color-text)] hover:bg-slate-50">
            <ShoppingCart size={18} />
            <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[color:var(--color-accent)] text-xs text-white">{cartCount}</span>
          </Link>

          {role ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm">
                  {userName ? userName[0].toUpperCase() : <User size={16} />}
                </button>
              </DropdownMenuTrigger>
              {/* Ẩn tên người dùng bên ngoài, chỉ hiện trong dropdown */}
              <DropdownMenuContent align="end">
                <div className="px-3 py-2 text-sm text-[color:var(--color-muted)]">
                  {userName ? `Xin chào, ${userName}` : "Chưa đăng nhập"}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Hồ sơ của tôi</Link>
                </DropdownMenuItem>
                {role === "admin" && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin/products">Quản lý Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={logout} className="text-destructive" data-variant="destructive">
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 rounded text-[color:var(--color-text)] hover:bg-slate-50">Login</Link>
              <Link href="/register"><Button className="bg-[color:var(--color-primary)]">Register</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
