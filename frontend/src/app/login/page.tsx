"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { auth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email || !password) return setError("Vui lòng nhập email và mật khẩu");
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      if (data?.token) {
        localStorage.setItem('token', data.token);
        // fetch user info (roles) and store role for header
        try {
          const me = await auth.me();
          const role = (me?.roles && me.roles.length > 0) ? me.roles[0] : null;
          if (role) localStorage.setItem('pm_role', role);
          // store basic user info for immediate UI fallback
          try {
            if (me && me.user) {
              localStorage.setItem('pm_user', JSON.stringify(me.user || {}));
            }
          } catch (_) {}
        } catch (e) {
          // ignore me errors, header will remain unauthenticated until refresh
          console.warn('me fetch failed', e);
        }
        // notify in-page listeners (Navbar) so header updates immediately
        try { window.dispatchEvent(new Event('pm.auth')); } catch (_) {}
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[color:var(--color-bg)]">
      <div className="w-full max-w-md rounded-lg border bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-[color:var(--color-primary)]">Chào mừng trở lại</h2>
          <p className="text-sm text-[color:var(--color-muted)]">Đăng nhập để tiếp tục quản lý sản phẩm và đơn hàng</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={submit}>
          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@mail.com" type="email" />

          <label className="text-sm font-medium">Mật khẩu</label>
          <div className="relative">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" type={show ? "text" : "password"} />
            <button type="button" aria-label="toggle" onClick={() => setShow(s => !s)} className="absolute right-3 top-2 text-slate-500">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-sky-600" /> Ghi nhớ đăng nhập</label>
            <Link href="/profile/forgot" className="text-sm text-[color:var(--color-primary)]">Quên mật khẩu?</Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</Button>
        </form>

        <div className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
          Chưa có tài khoản? <Link href="/register" className="text-[color:var(--color-primary)]">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}
