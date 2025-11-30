"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddressForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: any;
  onSave: (addr: any) => void;
  onCancel?: () => void;
}) {
  const [label, setLabel] = useState(initial?.label || "Nhà riêng");
  const [name, setName] = useState(initial?.name || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [address1, setAddress1] = useState(initial?.address1 || "");
  // Removed address2
  const [city, setCity] = useState(initial?.city || "");
  const [district, setDistrict] = useState(initial?.district || "");
  const [ward, setWard] = useState(initial?.ward || "");
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(data => setProvinces(data));
  }, []);

  // Fetch districts when city changes
  useEffect(() => {
    if (!city) {
      setDistricts([]);
      setDistrict("");
      setWards([]);
      setWard("");
      return;
    }
    const selectedProvince = provinces.find((p: any) => p.name === city);
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince.code}?depth=2`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data.districts || []);
          setDistrict("");
          setWards([]);
          setWard("");
        });
    }
  }, [city, provinces]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!district) {
      setWards([]);
      setWard("");
      return;
    }
    const selectedDistrict = districts.find((d: any) => d.name === district);
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict.code}?depth=2`)
        .then(res => res.json())
        .then(data => {
          setWards(data.wards || []);
          setWard("");
        });
    }
  }, [district, districts]);
  // Removed postal code

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !address1.trim() || !city || !district || !ward) {
      alert("Vui lòng điền đầy đủ thông tin địa chỉ.");
      return;
    }
    const addr: any = {
      label,
      name,
      phone,
      address1,
      city,
      district,
      ward,
    };
    if (initial?.id) addr.id = initial.id;
    onSave(addr);
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-5 border border-gray-100">
      <div className="mb-2">
        <label className="mb-1 block text-sm font-semibold text-gray-700">Nhãn</label>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} className="bg-gray-50 focus:bg-white border-gray-200 focus:border-primary rounded-lg" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Người nhận</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-gray-50 focus:bg-white border-gray-200 focus:border-primary rounded-lg" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Số điện thoại</label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-gray-50 focus:bg-white border-gray-200 focus:border-primary rounded-lg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Tỉnh/Thành phố</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:bg-white focus:border-primary"
            value={city}
            onChange={e => setCity(e.target.value)}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((p: any) => (
              <option key={p.code} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-semibold text-gray-700">Quận/Huyện</label>
          <select
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:bg-white focus:border-primary"
            value={district}
            onChange={e => setDistrict(e.target.value)}
            disabled={!districts.length}
          >
            <option value="">Chọn quận/huyện</option>
            {districts.map((d: any) => (
              <option key={d.code} value={d.name}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Phường/Xã</label>
        <select
          className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm bg-gray-50 focus:bg-white focus:border-primary"
          value={ward}
          onChange={e => setWard(e.target.value)}
          disabled={!wards.length}
        >
          <option value="">Chọn phường/xã</option>
          {wards.map((w: any) => (
            <option key={w.code} value={w.name}>{w.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-semibold text-gray-700">Địa chỉ</label>
        <Input value={address1} onChange={(e) => setAddress1(e.target.value)} className="bg-gray-50 focus:bg-white border-gray-200 focus:border-primary rounded-lg" />
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        <Button type="submit" className="px-6 py-2 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 shadow">Lưu</Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-6 py-2 rounded-lg font-semibold border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow">
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
