"use client";

import { useState, useEffect } from "react";
import AddressForm from "./AddressForm";
import { Button } from "@/components/ui/button";
import { address as addressApi } from "@/lib/api/address";

export default function AddressList({ onSelect }: { onSelect?: (addr: any) => void }) {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);
  const [adding, setAdding] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const res = await addressApi.list();
        setAddresses(res.addresses || []);
      } catch {
        setAddresses([]);
      }
    }
    fetchAddresses();
  }, []);

  async function save(addr: any) {
    try {
      if (addr.id) {
        await addressApi.update(addr.id, addr);
      } else {
        await addressApi.add(addr);
      }
      const res = await addressApi.list();
      setAddresses(res.addresses || []);
    } catch {}
    setEditing(null);
    setAdding(false);
  }

  async function remove(id: number) {
    if (!confirm("Xóa địa chỉ này?")) return;
    try {
      await addressApi.remove(id);
      const res = await addressApi.list();
      setAddresses(res.addresses || []);
    } catch {}
  }

  return (
    <div>
      {!adding && !editing && (
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-[color:var(--color-muted)]">Địa chỉ đã lưu</div>
          <Button onClick={() => setAdding(true)}>Thêm địa chỉ</Button>
        </div>
      )}

      {adding && <AddressForm onSave={save} onCancel={() => setAdding(false)} />}

      {editing && <AddressForm initial={editing} onSave={save} onCancel={() => setEditing(null)} />}

      {(!adding && !editing && addresses.length > 0) && (
        <div className="space-y-2">
          <div className="mb-2 text-sm text-gray-700 font-semibold">Chọn địa chỉ giao hàng:</div>
          <div className="flex flex-col gap-3">
            {addresses.map((a) => (
              <label key={a.id} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer bg-white transition border`}>
                <input
                  type="radio"
                  name="address"
                  value={a.id}
                  checked={selectedId === a.id}
                  onChange={() => {
                    setSelectedId(a.id);
                    if (onSelect) onSelect(a);
                  }}
                  className="accent-primary w-6 h-6 mr-2"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-800 text-base">{a.label}</div>
                  <div className="text-xs text-gray-700 font-medium">{a.name} <span className="text-gray-400">— {a.phone}</span></div>
                  <div className="text-xs text-gray-500">{a.street}{a.ward ? ", " + a.ward : ""}{a.district ? ", " + a.district : ""}{a.city ? ", " + a.city : ""}</div>
                </div>
                <div className="flex gap-1">
                  <Button onClick={e => { e.stopPropagation(); setEditing(a); }} size="sm" variant="outline" className="rounded px-2 py-1 text-xs">Sửa</Button>
                  <Button onClick={e => { e.stopPropagation(); remove(a.id); }} size="sm" variant="destructive" className="rounded px-2 py-1 text-xs">Xóa</Button>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {(!adding && !editing && addresses.length === 0) && (
        <div className="text-sm text-[color:var(--color-muted)]">Chưa có địa chỉ nào.</div>
      )}
    </div>
  );
}
