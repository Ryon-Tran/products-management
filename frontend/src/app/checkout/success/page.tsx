"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const orderId = params?.get('orderId');
  const [count, setCount] = useState(3);

  useEffect(() => {
    const t = setInterval(() => setCount(c => c - 1), 1000);
    const redirect = setTimeout(() => router.push('/'), 3000);
    return () => { clearInterval(t); clearTimeout(redirect); };
  }, [router]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center bg-gray-50 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow p-8 text-center">
        <h1 className="text-2xl font-semibold mb-4">Đặt hàng thành công</h1>
        {orderId && <div className="text-sm text-gray-600 mb-4">Mã đơn hàng: <span className="font-medium">#{orderId}</span></div>}
        <button className="px-4 py-2 rounded bg-gray-900 text-white" onClick={() => router.push('/')}>Về trang chủ ngay</button>
      </div>
    </main>
  );
}
