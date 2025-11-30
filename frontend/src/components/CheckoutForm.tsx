"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { orders as ordersApi } from "@/lib/api";

export default function CheckoutForm({ address }: { address?: any }) {
  const [fullName, setFullName] = useState(address?.name || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(address?.phone || "");
  const [address1, setAddress1] = useState(address?.address1 || "");
  const [address2, setAddress2] = useState(address?.address2 || "");
  const [city, setCity] = useState(address?.city || "");
  const [state, setState] = useState("");
  const [postal, setPostal] = useState(address?.postal || "");
  const [country, setCountry] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  function valid() {
    return fullName.trim() && address1.trim() && city.trim() && postal.trim();
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!valid()) {
      alert("Vui lòng điền đầy đủ tên, địa chỉ, thành phố và mã bưu chính.");
      return;
    }

    setLoading(true);
    const payload = { fullName, email, phone, address1, address2, city, state, postal, country, notes };
    try {
      await ordersApi.create(payload);
      alert("Đặt hàng thành công!");
    } catch (e) {
      console.warn('place order failed', e);
      alert("Đặt hàng thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
    // Optionally redirect or clear form
  }

  return (
    <form onSubmit={placeOrder} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium">Họ và tên</label>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nguyễn Văn A" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@domain.com" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Số điện thoại</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="090-xxx-xxxx" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Địa chỉ (số nhà, đường)</label>
        <Input value={address1} onChange={(e) => setAddress1(e.target.value)} placeholder="Số nhà, đường" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Địa chỉ 2 (phường, khu phố)</label>
        <Input value={address2} onChange={(e) => setAddress2(e.target.value)} placeholder="Tầng, khu vực (tùy chọn)" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium">Thành phố</label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Hà Nội" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Tỉnh / Bang</label>
          <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="Hà Nội" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium">Mã bưu chính</label>
          <Input value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="100000" />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Quốc gia</label>
        <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Vietnam" />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium">Ghi chú (tùy chọn)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full resize-none rounded-md border px-3 py-2 text-sm" rows={3} />
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Đang xử lý..." : "Đặt hàng"}</Button>
      </div>
    </form>
  );
}
