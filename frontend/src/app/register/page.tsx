"use client";

import Link from "next/link";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password || !confirmPassword) return setError('Vui lòng hoàn thành các trường');
    if (password.length < 6) return setError('Mật khẩu phải có ít nhất 6 ký tự');
    if (password !== confirmPassword) return setError('Mật khẩu không trùng khớp');
    setLoading(true);
    try {
      await auth.register({ name, email, password });
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[color:var(--color-bg)]">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold text-[color:var(--color-primary)]">Tạo tài khoản mới</h2>
          <p className="text-sm text-[color:var(--color-muted)]">Bắt đầu quản lý danh mục, giỏ hàng và đơn hàng của bạn</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={submit}>
          <label className="text-sm font-medium">Họ và tên</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nguyễn Văn A" />

          <label className="text-sm font-medium">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@mail.com" type="email" />

          <label className="text-sm font-medium">Mật khẩu</label>
          <div className="relative">
            <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (ít nhất 6 ký tự)" type={show ? 'text' : 'password'} />
            <button type="button" aria-label="toggle" onClick={() => setShow(s => !s)} className="absolute right-3 top-2 text-slate-500">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className="text-sm font-medium">Nhập lại mật khẩu</label>
          <div className="relative">
            <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu" type={show ? 'text' : 'password'} />
            <button type="button" aria-label="toggle" onClick={() => setShow(s => !s)} className="absolute right-3 top-2 text-slate-500">
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Đang tạo...' : 'Tạo tài khoản'}</Button>
        </form>

        <div className="mt-6 text-center text-sm text-[color:var(--color-muted)]">
          Đã có tài khoản? <Link href="/login" className="text-[color:var(--color-primary)]">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
